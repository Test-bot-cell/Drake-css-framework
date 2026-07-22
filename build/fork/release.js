import { execFile } from 'node:child_process';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

// Rituel de release outillé (D-024, livrable n°2).
//
// POURQUOI : la release v0.1.0 a livré un chemin CDN mort parce que le rituel
// (préflight, tag signé, release GitHub, vérification HTTP des chemins recommandés)
// reposait sur la seule discipline humaine. Ce script outille chaque étape en
// sous-commande EXPLICITE : chacune est un feu vert distinct du mainteneur, aucune
// n'en déclenche une autre implicitement. Sans sous-commande (ou avec --check), seul
// le préflight en lecture seule s'exécute. Toutes les commandes gh ciblent
// explicitement le dépôt du remote origin (--repo), car la résolution par défaut de
// gh peut retenir le remote de l'amont.

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GATE = 'Rituel de release';

// Chemins recommandés par le README — mêmes noms exacts que build/fork/check-assets.js
// pour les quatre WOFF2 subsettés (D-022) : c'est la surface servie par le CDN.
const RECOMMENDED_CDN_PATHS = [
    'dist/css/drake-inter-files.css',
    'dist/css/drake.min.css',
    'dist/css/drake-core.min.css',
    'dist/js/drake.min.js',
    'dist/fonts/InterVariable-latin.woff2',
    'dist/fonts/InterVariable-latin-ext.woff2',
    'dist/fonts/InterVariable-Italic-latin.woff2',
    'dist/fonts/InterVariable-Italic-latin-ext.woff2',
];
const CDN_WARMUP_ATTEMPTS = 5;
const CDN_WARMUP_DELAY_MS = 20000;

async function main() {
    const args = process.argv.slice(2);
    if (args.includes('-h') || args.includes('--help')) {
        printHelp();
        return;
    }

    const known = ['--check', '--tag', '--publish', '--verify-cdn'];
    const unknown = args.filter((argument) => !known.includes(argument));
    if (unknown.length) {
        throw new Error(
            `argument inconnu : ${unknown.join(' ')}. Sous-commandes : ${known.join(', ')} ` +
                `(sans sous-commande : préflight --check seul).`,
        );
    }

    const requested = [...new Set(args)];
    if (requested.length > 1) {
        throw new Error(
            `une seule sous-commande à la fois (chaque étape est un feu vert distinct du ` +
                `mainteneur, aucune n'en déclenche une autre) ; reçu : ${requested.join(' ')}.`,
        );
    }

    const command = requested[0] ?? '--check';
    if (command === '--check') {
        await runCheck();
    } else if (command === '--tag') {
        await runTag();
    } else if (command === '--publish') {
        await runPublish();
    } else {
        await runVerifyCdn();
    }
}

function printHelp() {
    console.log(`
Rituel de release outillé (D-024). Chaque sous-commande est un feu vert distinct
du mainteneur ; aucune étape n'en déclenche une autre implicitement.

Usage :
  node build/fork/release.js [sous-commande]

Sous-commandes :
  --check       Préflight en lecture seule (défaut sans sous-commande)
  --tag         Tag annoté SIGNÉ vV sur HEAD, vérifié puis poussé (exige préflight vert)
  --publish     npm pack complet + release GitHub avec notes du CHANGELOG (exige tag poussé)
  --verify-cdn  Vérification HTTP des chemins recommandés au tag vV (échauffement CDN)
  -h, --help    Cette aide
`);
}

// ---------------------------------------------------------------------------
// --check : préflight en lecture seule.
// ---------------------------------------------------------------------------

async function runCheck() {
    const preflight = await collectPreflight();
    printRecap(preflight);

    const { version, tagState } = preflight;
    if (tagState.state === 'publiee') {
        console.log(
            `${GATE} — préflight : v${version} déjà publiée (${tagState.releaseUrl}) — ` +
                `bump de version d'abord (package.json, CHANGELOG.md, README.md) avant ` +
                `tout nouveau tag.`,
        );
        return;
    }

    const failing = preflight.checks.filter((check) => !check.ok);
    if (failing.length) {
        throw new Error(
            `préflight non vert : ${failing.length} contrôle(s) ✗ (voir le récapitulatif ` +
                `ci-dessus) — corriger puis relancer --check.`,
        );
    }
    if (tagState.state === 'pousse-sans-release') {
        console.log(
            `${GATE} — préflight : tag v${version} poussé, release absente — prochaine ` +
                `étape --publish (feu vert distinct).`,
        );
        return;
    }
    console.log(`${GATE} — préflight vert : prêt à tagger v${version} (--tag, feu vert distinct).`);
}

async function collectPreflight() {
    const { name, version } = await readPackage();
    const slug = await readOriginSlug();
    const { stdout: headRaw } = await git(['rev-parse', 'HEAD']);
    const headSha = headRaw.trim();
    const checks = [];

    const { stdout: statusRaw } = await git(['status', '--porcelain']);
    const dirty = statusRaw.split('\n').filter(Boolean);
    checks.push({
        label: 'Arbre git propre',
        ok: dirty.length === 0,
        detail: dirty.length
            ? `${dirty.length} entrée(s) non commitée(s) (${dirty
                  .slice(0, 5)
                  .map((line) => line.slice(3))
                  .join(', ')}${dirty.length > 5 ? ', …' : ''}) — commiter ou remiser avant release`
            : 'git status --porcelain vide',
    });

    checks.push({ label: 'Version', ok: true, detail: `package.json : ${name} ${version}` });

    const section = await readChangelogSection(version);
    checks.push({
        label: 'CHANGELOG.md',
        ok: Boolean(section),
        detail: section
            ? `section « ## ${version} — » présente`
            : `section « ## ${version} — » introuvable — documenter la version avant release`,
    });

    const pins = await readReadmePins();
    const matching = pins.filter((pin) => pin === version);
    const foreign = [...new Set(pins.filter((pin) => pin !== version))];
    let readmeDetail;
    if (!matching.length) {
        readmeDetail = `aucune épingle @v${version} dans les épingles de distribution — mettre le README à niveau`;
    } else if (foreign.length) {
        readmeDetail =
            `${matching.length} épingle(s) @v${version}, mais incohérence : épingle(s) ` +
            `d'une autre version (${foreign.map((pin) => `@v${pin}`).join(', ')}) — aligner le README`;
    } else {
        readmeDetail = `${matching.length} épingle(s) de distribution @v${version}, aucune autre version`;
    }
    checks.push({
        label: 'README.md',
        ok: matching.length > 0 && !foreign.length,
        detail: readmeDetail,
    });

    const ci = await checkCi(headSha, slug);
    checks.push({ label: 'CI sur HEAD', ok: ci.ok, detail: ci.detail });

    const tagState = await readTagState(version, slug);
    checks.push({ label: `Tag v${version}`, ok: tagState.ok, detail: tagState.detail });

    return { name, version, slug, headSha, checks, section, tagState };
}

function printRecap({ version, slug, headSha, checks }) {
    console.log(`Préflight release v${version} — origin ${slug}, HEAD ${headSha.slice(0, 8)}`);
    for (const check of checks) {
        console.log(`  ${check.ok ? '✓' : '✗'} ${check.label} : ${check.detail}`);
    }
}

async function checkCi(headSha, slug) {
    const pushed = await git(['branch', '-r', '--contains', headSha]).then(
        ({ stdout }) => stdout.trim().length > 0,
        () => false,
    );

    let runs;
    try {
        const { stdout } = await gh([
            'run',
            'list',
            '--commit',
            headSha,
            '--json',
            'status,conclusion',
            '--repo',
            slug,
        ]);
        runs = JSON.parse(stdout);
    } catch (error) {
        return {
            ok: false,
            detail: `interrogation gh impossible : ${firstLine(error)} — vérifier gh auth status et le réseau`,
        };
    }

    if (!Array.isArray(runs) || runs.length === 0) {
        if (!pushed) {
            return {
                ok: true,
                detail: `aucun run — toléré avec avertissement : HEAD n'est pas poussé, la CI ne tournera qu'après push`,
            };
        }
        return {
            ok: false,
            detail: `HEAD est poussé mais aucun run CI ne le couvre — attendre le déclenchement ou vérifier les workflows`,
        };
    }

    const pending = runs.filter((run) => run.status !== 'completed').length;
    const failed = runs.filter(
        (run) => run.status === 'completed' && run.conclusion !== 'success',
    ).length;
    if (pending > 0 || failed > 0) {
        return {
            ok: false,
            detail: `${runs.length} run(s) : ${pending} en cours, ${failed} non verts — exiger une CI verte sur HEAD avant release`,
        };
    }
    return { ok: true, detail: `${runs.length} run(s) en succès` };
}

async function readTagState(version, slug) {
    const tag = `v${version}`;
    const local = await git(['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`]).then(
        () => true,
        () => false,
    );
    const remote = await git(['ls-remote', '--tags', 'origin', `refs/tags/${tag}`]).then(
        ({ stdout }) => stdout.trim().length > 0,
        (error) => {
            throw new Error(
                `interrogation des tags d'origin impossible : ${firstLine(error)} — vérifier le réseau puis relancer.`,
                { cause: error },
            );
        },
    );

    let releaseUrl = null;
    try {
        const { stdout } = await gh(['release', 'view', tag, '--repo', slug, '--json', 'url']);
        releaseUrl = JSON.parse(stdout).url;
    } catch (error) {
        if (!/not found/i.test(`${error.stderr ?? ''} ${error.message ?? ''}`)) {
            throw new Error(
                `état de la release ${tag} indéterminable via gh : ${firstLine(error)} — vérifier gh auth status.`,
                { cause: error },
            );
        }
    }

    if (releaseUrl) {
        if (local && remote) {
            return {
                state: 'publiee',
                ok: true,
                releaseUrl,
                detail: `présent, poussé, release GitHub publiée (${releaseUrl}) — v${version} déjà publiée, bump d'abord`,
            };
        }
        const missing = [!local && 'absent localement', !remote && 'absent sur origin']
            .filter(Boolean)
            .join(' et ');
        return {
            state: 'incoherent',
            ok: false,
            releaseUrl,
            detail: `release GitHub publiée mais tag ${missing} — git fetch origin --tags puis investiguer`,
        };
    }
    if (local && remote) {
        return {
            state: 'pousse-sans-release',
            ok: true,
            detail: `présent et poussé, release GitHub absente — prochaine étape --publish`,
        };
    }
    if (local) {
        return {
            state: 'local-seulement',
            ok: false,
            detail: `présent localement mais absent sur origin — rituel --tag interrompu, pousser avec git push origin ${tag}`,
        };
    }
    if (remote) {
        return {
            state: 'remote-seulement',
            ok: false,
            detail: `présent sur origin mais absent localement — git fetch origin --tags avant de continuer`,
        };
    }
    return { state: 'absent', ok: true, detail: `absent — prêt à tagger` };
}

// ---------------------------------------------------------------------------
// --tag : tag annoté signé sur HEAD, vérifié puis poussé.
// ---------------------------------------------------------------------------

async function runTag() {
    const preflight = await collectPreflight();
    printRecap(preflight);

    const { version, section, tagState } = preflight;
    const failing = preflight.checks.filter((check) => !check.ok);
    if (failing.length) {
        throw new Error(
            `--tag refusé : préflight non vert (${failing.length} contrôle(s) ✗) — corriger puis relancer --check.`,
        );
    }
    if (tagState.state !== 'absent') {
        throw new Error(`--tag refusé : le tag v${version} n'est pas absent — ${tagState.detail}.`);
    }

    const tag = `v${version}`;
    const message = [`Drake.css framework ${version}`, '', section.body].join('\n').trim();
    await runStep(
        `création du tag signé ${tag}`,
        'git',
        ['tag', '-s', '-a', tag, '-m', message],
        'vérifier la clé de signature git (user.signingkey) puis relancer --tag',
    );
    await runStep(
        `vérification de la signature du tag ${tag}`,
        'git',
        ['tag', '-v', tag],
        `supprimer le tag local (git tag -d ${tag}) et relancer --tag après correction de la clé`,
    );
    await runStep(
        `push du tag ${tag}`,
        'git',
        ['push', 'origin', tag],
        'vérifier le réseau et les droits sur origin puis relancer --tag (le tag local est conservé)',
    );
    console.log(`${GATE} — tag ${tag} signé, vérifié et poussé sur origin.`);
}

// ---------------------------------------------------------------------------
// --publish : npm pack complet (re-preuve de build) + release GitHub avec notes.
// ---------------------------------------------------------------------------

async function runPublish() {
    const { name, version } = await readPackage();
    const slug = await readOriginSlug();
    const tag = `v${version}`;

    const tagState = await readTagState(version, slug);
    if (tagState.state === 'publiee') {
        throw new Error(
            `--publish refusé : la release ${tag} existe déjà (${tagState.releaseUrl}) — bump de version d'abord.`,
        );
    }
    if (tagState.state !== 'pousse-sans-release') {
        throw new Error(
            `--publish refusé : ${tagState.detail} — exécuter --tag (feu vert distinct) avant de publier.`,
        );
    }

    const section = await readChangelogSection(version);
    if (!section) {
        throw new Error(
            `section « ## ${version} — » introuvable dans CHANGELOG.md — impossible d'extraire les notes de release.`,
        );
    }

    // npm pack COMPLET (avec prepack) : la re-preuve de build avant publication.
    const packDirectory = await mkdtemp(join(tmpdir(), 'drake-release-'));
    await runStep(
        `npm pack vers ${packDirectory}`,
        'npm',
        ['pack', '--pack-destination', packDirectory],
        'corriger la chaîne de build (prepack) puis relancer --publish',
    );
    const tarball = join(packDirectory, tarballName(name, version));
    await stat(tarball).catch(() => {
        throw new Error(
            `tarball attendu introuvable après npm pack : ${tarball} — vérifier le nom du paquet dans package.json.`,
        );
    });

    const { stdout } = await runStep(
        `création de la release GitHub ${tag}`,
        'gh',
        [
            'release',
            'create',
            tag,
            tarball,
            '--repo',
            slug,
            '--title',
            `Drake.css framework ${version}`,
            '--notes',
            section.body,
        ],
        'vérifier gh auth status et les droits sur le dépôt puis relancer --publish',
    );
    const url = stdout.trim().split('\n').pop();
    console.log(`${GATE} — release ${tag} publiée : ${url}`);
}

// ---------------------------------------------------------------------------
// --verify-cdn : HTTP 200 + tailles exactes des chemins recommandés au tag.
// ---------------------------------------------------------------------------

async function runVerifyCdn() {
    const { name, version } = await readPackage();
    const slug = await readOriginSlug();
    const tag = `v${version}`;

    const results = [];
    for (const path of RECOMMENDED_CDN_PATHS) {
        const url = `https://cdn.jsdelivr.net/gh/${slug}@${tag}/${path}`;
        results.push(await verifyCdnPath(path, url));
    }
    const tarballUrl = `https://github.com/${slug}/releases/download/${tag}/${tarballName(name, version)}`;
    results.push(await verifyTarballUrl(tarballUrl));

    console.log(`Vérification CDN au tag ${tag} (${slug}) :`);
    for (const result of results) {
        console.log(`  ${result.ok ? '✓' : '✗'} ${result.label} : ${result.detail}`);
    }

    const failing = results.filter((result) => !result.ok);
    if (failing.length) {
        throw new Error(
            `${failing.length} chemin(s) non conforme(s) au tag ${tag} — vérifier la release publiée et relancer --verify-cdn après l'échauffement CDN.`,
        );
    }
    console.log(`${GATE} — vérification CDN : ${results.length} chemins conformes au tag ${tag}.`);
}

async function verifyCdnPath(path, url) {
    const local = await stat(join(PROJECT_ROOT, path)).catch(() => null);
    if (!local) {
        return {
            label: path,
            ok: false,
            detail: `fichier local absent — reconstruire dist avant de comparer les tailles`,
        };
    }

    let lastDetail = 'aucune tentative';
    for (let attempt = 1; attempt <= CDN_WARMUP_ATTEMPTS; attempt++) {
        if (attempt > 1) {
            console.log(
                `  … ${path} : ${lastDetail} — nouvelle tentative dans ` +
                    `${CDN_WARMUP_DELAY_MS / 1000} s (${attempt}/${CDN_WARMUP_ATTEMPTS}).`,
            );
            await wait(CDN_WARMUP_DELAY_MS);
        }

        let response;
        try {
            response = await fetch(url);
        } catch (error) {
            lastDetail = `réseau : ${firstLine(error)}`;
            continue;
        }
        if (response.status !== 200) {
            await response.body?.cancel();
            lastDetail = `statut ${response.status}`;
            continue;
        }

        const size = (await response.arrayBuffer()).byteLength;
        if (size !== local.size) {
            return {
                label: path,
                ok: false,
                detail: `statut 200 mais ${size} octets servis contre ${local.size} localement — contenu au tag divergent`,
            };
        }
        return {
            label: path,
            ok: true,
            detail: `statut 200, ${size} octets (taille locale identique)`,
        };
    }
    return {
        label: path,
        ok: false,
        detail: `${lastDetail} après ${CDN_WARMUP_ATTEMPTS} tentatives espacées de ${CDN_WARMUP_DELAY_MS / 1000} s`,
    };
}

async function verifyTarballUrl(url) {
    try {
        const response = await fetch(url);
        await response.body?.cancel();
        return response.status === 200
            ? { label: url, ok: true, detail: 'statut 200' }
            : {
                  label: url,
                  ok: false,
                  detail: `statut ${response.status} — vérifier que la release porte bien le tarball`,
              };
    } catch (error) {
        return { label: url, ok: false, detail: `réseau : ${firstLine(error)}` };
    }
}

// ---------------------------------------------------------------------------
// Helpers : lecture du dépôt, exécution montrée, extraction CHANGELOG/README.
// ---------------------------------------------------------------------------

function git(args, options = {}) {
    return execFileAsync('git', args, {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        ...options,
    });
}

function gh(args, options = {}) {
    return execFileAsync('gh', args, {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        ...options,
    });
}

async function runStep(description, program, args, remede) {
    console.log(`$ ${program} ${args.map(displayArgument).join(' ')}`);
    try {
        const result = await execFileAsync(program, args, {
            cwd: PROJECT_ROOT,
            encoding: 'utf8',
            maxBuffer: 16 * 1024 * 1024,
        });
        const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
        if (output) {
            console.log(output);
        }
        return result;
    } catch (error) {
        throw new Error(`échec — ${description} : ${firstLine(error)} — ${remede}.`, {
            cause: error,
        });
    }
}

function displayArgument(argument) {
    if (/\n/.test(argument) || argument.length > 80) {
        return `<argument de ${argument.length} caractères>`;
    }
    return /[\s"']/.test(argument) ? `'${argument}'` : argument;
}

async function readPackage() {
    const manifest = JSON.parse(await readFile(join(PROJECT_ROOT, 'package.json'), 'utf8'));
    const { name, version } = manifest;
    if (!name || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
        throw new Error(
            `package.json doit porter un nom et une version semver ; reçu ${name ?? 'aucun nom'} / ${version ?? 'aucune version'}.`,
        );
    }
    return { name, version };
}

async function readOriginSlug() {
    const { stdout } = await git(['remote', 'get-url', 'origin']);
    const match = stdout.trim().match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (!match) {
        throw new Error(
            `le remote origin n'est pas un dépôt GitHub (${stdout.trim()}) — le rituel de release exige la distribution GitHub-first (D-020).`,
        );
    }
    return `${match[1]}/${match[2]}`;
}

async function readChangelogSection(version) {
    const changelog = await readFile(join(PROJECT_ROOT, 'CHANGELOG.md'), 'utf8');
    const lines = changelog.split('\n');
    const headerIndex = lines.findIndex((line) => line.startsWith(`## ${version} — `));
    if (headerIndex === -1) {
        return null;
    }
    let end = lines.length;
    for (let index = headerIndex + 1; index < lines.length; index++) {
        if (lines[index].startsWith('## ')) {
            end = index;
            break;
        }
    }
    return {
        header: lines[headerIndex],
        body: lines
            .slice(headerIndex + 1, end)
            .join('\n')
            .trim(),
    };
}

async function readReadmePins() {
    const readme = await readFile(join(PROJECT_ROOT, 'README.md'), 'utf8');
    return [...readme.matchAll(/@v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/g)].map((match) => match[1]);
}

function tarballName(name, version) {
    return `${name.replace(/^@/, '').replaceAll('/', '-')}-${version}.tgz`;
}

function firstLine(error) {
    const text = `${error.stderr ?? ''}`.trim() || `${error.message ?? error}`.trim();
    return text.split('\n')[0];
}

main().catch((error) => {
    console.error(`${GATE} — échec : ${error.message}`);
    process.exitCode = 1;
});
