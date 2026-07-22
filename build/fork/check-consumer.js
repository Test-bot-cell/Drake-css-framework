import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

// Gate consommateur (D-024) : re-prouve le canal de distribution D-020 de bout en bout,
// en local comme en CI. Ce canal n'avait été prouvé qu'une seule fois, manuellement, au
// moment de v0.1.0 ; ce gate rejoue donc le parcours consommateur complet à chaque
// exécution : empaquetage du tarball (npm pack), installation dans un projet consommateur
// vierge en répertoire temporaire, chargement réel du point d'entrée (le bundle UMD
// s'exporte en CommonJS sous Node, sans DOM), cohérence de version, puis présence des
// fichiers recommandés par le README dans l'arbre installé. Une release cassée est ainsi
// détectée avant le tag, plus jamais après.

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = fileURLToPath(new URL('../..', import.meta.url));

// Surfaces minimales de l'objet runtime exporté, vérifiées dans les sources :
// App.util (src/js/api/app.ts) ; App.use, App.component et App.mixin (src/js/api/global.ts).
const EXPECTED_RUNTIME_SURFACES = {
    util: 'object',
    use: 'function',
    component: 'function',
    mixin: 'function',
};

// Fichiers recommandés par le README (installation locale et chemins CDN). Les quatre
// WOFF2 sont les subsets épinglés par D-022 : leurs noms canoniques sont tenus par
// EXPECTED_INTER_FONT_FILES dans build/fork/check-assets.js (les empreintes exactes sont
// vérifiées là-bas ; ici, seule la présence dans l'arbre installé est en jeu). Le point
// d'entrée des types s'y ajoute, lu dans le champ types du paquet installé.
const README_RECOMMENDED_FILES = [
    'dist/css/drake.css',
    'dist/css/drake.min.css',
    'dist/css/drake-inter-files.css',
    'dist/fonts/InterVariable-latin.woff2',
    'dist/fonts/InterVariable-latin-ext.woff2',
    'dist/fonts/InterVariable-Italic-latin.woff2',
    'dist/fonts/InterVariable-Italic-latin-ext.woff2',
    'dist/js/drake.js',
    'dist/js/drake.min.js',
];

let workspace = null;

try {
    const manifest = JSON.parse(await readFile(join(PROJECT_ROOT, 'package.json'), 'utf8'));
    workspace = await mkdtemp(join(tmpdir(), 'drake-check-consumer-'));

    const tarball = await packTarball(workspace);
    const consumer = await installConsumer(workspace, tarball);
    const installedRoot = join(consumer, 'node_modules', manifest.name);

    const installed = await readInstalledManifest(installedRoot, manifest);
    smokeTestRuntime(consumer, manifest);
    const checkedFileCount = await checkRecommendedFiles(installedRoot, installed);

    console.log(
        `Gate consommateur (D-024) : canal D-020 prouvé de bout en bout — ` +
            `${manifest.name}@${manifest.version} empaqueté, installé dans un consommateur ` +
            `vierge et chargé sans window ` +
            `(surfaces ${Object.keys(EXPECTED_RUNTIME_SURFACES).join(', ')}) ; ` +
            `${checkedFileCount} fichiers recommandés présents.`,
    );
} catch (error) {
    console.error(`Gate consommateur en échec : ${error.message}`);
    process.exitCode = 1;
} finally {
    if (workspace) {
        await rm(workspace, { force: true, recursive: true });
    }
}

async function packTarball(workspace) {
    // --ignore-scripts est légitime et NORMATIF ici (D-024) : ce gate s'exécute après la
    // chaîne amont (pnpm verify puis preuve de non-diff G9) qui vient de reconstruire les
    // artefacts dist/ et de prouver qu'ils sont identiques à l'arbre versionné ; rejouer
    // prepack ici ne ferait que reconstruire une seconde fois ce qui est déjà prouvé.
    // Le cache npm est confiné au répertoire temporaire pour garder le gate hermétique.
    const { stdout } = await runNpm(
        [
            'pack',
            '--ignore-scripts',
            '--json',
            '--pack-destination',
            workspace,
            '--cache',
            join(workspace, 'npm-cache'),
        ],
        PROJECT_ROOT,
        'npm pack',
    );

    const filename = JSON.parse(stdout)?.[0]?.filename;
    if (!filename) {
        throw new Error(
            `npm pack n'a retourné aucun nom de tarball : sortie JSON inattendue (${stdout.slice(0, 200)}).`,
        );
    }

    const tarball = join(workspace, filename);
    await assertNonEmptyFile(tarball, 'le tarball npm');
    return tarball;
}

async function installConsumer(workspace, tarball) {
    const consumer = join(workspace, 'consumer');
    await mkdir(consumer);
    await writeFile(
        join(consumer, 'package.json'),
        `${JSON.stringify({ name: 'consumer', private: true }, null, 4)}\n`,
    );
    await runNpm(
        [
            'install',
            '--ignore-scripts',
            '--no-audit',
            '--no-fund',
            '--cache',
            join(workspace, 'npm-cache'),
            tarball,
        ],
        consumer,
        'npm install du tarball dans le consommateur vierge',
    );
    return consumer;
}

async function readInstalledManifest(installedRoot, manifest) {
    let installed;
    try {
        installed = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8'));
    } catch (error) {
        throw new Error(
            `Le package.json du paquet installé est illisible (${installedRoot}) : ${error.message}`,
            { cause: error },
        );
    }

    if (installed.version !== manifest.version) {
        throw new Error(
            `Version installée incohérente : ${installed.version ?? 'aucune'} au lieu de ` +
                `${manifest.version} — vérifier package.json puis réempaqueter.`,
        );
    }
    if (typeof installed.types !== 'string' || !installed.types) {
        throw new Error(
            `Le paquet installé ne déclare pas de champ types : les consommateurs TypeScript ` +
                `perdraient les déclarations (attendu : ${manifest.types}).`,
        );
    }

    return installed;
}

function smokeTestRuntime(consumer, manifest) {
    // Fumée d'exécution sans DOM : le chargement doit réussir alors qu'aucun global
    // window n'existe (contrat minimal côté outillage Node et rendu côté serveur).
    if (typeof globalThis.window !== 'undefined') {
        throw new Error(
            `Un global window est présent dans ce processus Node : la fumée sans DOM ne ` +
                `prouverait rien, exécuter ce gate dans un Node vierge.`,
        );
    }

    const requireFromConsumer = createRequire(join(consumer, 'smoke.cjs'));
    let Drake;
    try {
        Drake = requireFromConsumer(manifest.name);
    } catch (error) {
        throw new Error(
            `require('${manifest.name}') a échoué depuis le consommateur : ${error.message}`,
            { cause: error },
        );
    }

    if (Drake === null || (typeof Drake !== 'object' && typeof Drake !== 'function')) {
        throw new Error(`Le point d'entrée n'exporte pas l'objet runtime : reçu ${typeof Drake}.`);
    }
    for (const [surface, expectedType] of Object.entries(EXPECTED_RUNTIME_SURFACES)) {
        if (typeof Drake[surface] !== expectedType || Drake[surface] === null) {
            throw new Error(
                `Surface runtime absente ou invalide sur l'export : ${surface} ` +
                    `(attendu ${expectedType}, reçu ${typeof Drake[surface]}).`,
            );
        }
    }
    if (Drake.version !== manifest.version) {
        throw new Error(
            `Version runtime incohérente : Drake.version=${Drake.version ?? 'aucune'} au lieu ` +
                `de ${manifest.version} — reconstruire les bundles (pnpm compile).`,
        );
    }
}

async function checkRecommendedFiles(installedRoot, installed) {
    const files = [...README_RECOMMENDED_FILES, installed.types];
    for (const file of files) {
        await assertNonEmptyFile(join(installedRoot, file), `le fichier recommandé ${file}`);
    }
    return files.length;
}

async function assertNonEmptyFile(file, label) {
    const details = await stat(file).catch((error) => {
        throw new Error(`Introuvable : ${label} (${file}) : ${error.message}`, { cause: error });
    });
    if (!details.isFile() || details.size === 0) {
        throw new Error(`${label} (${file}) doit être un fichier régulier non vide.`);
    }
}

async function runNpm(args, cwd, label) {
    try {
        return await execFileAsync('npm', args, {
            cwd,
            encoding: 'utf8',
            maxBuffer: 16 * 1024 * 1024,
        });
    } catch (error) {
        const detail =
            error.stderr?.trim().split('\n').slice(-5).join(' | ') || error.message || error;
        throw new Error(`${label} a échoué : ${detail}`, { cause: error });
    }
}
