import { readFile, stat } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// Gate des budgets de taille (D-024) : outille le pilier vélocité côté distribution.
// Sans garde-fou chiffré, une régression de poids des artefacts dist/ passerait
// silencieusement de version en version. Chaque artefact principal porte donc un budget
// épinglé dans tests/fixtures/size-budgets.json (taille constatée + 5 % arrondie au Kio
// supérieur) : tout dépassement échoue ici, et le seul remède est d'optimiser ou de
// consigner une décision explicite de relèvement — jamais un relèvement silencieux.
// Les fontes WOFF2 restent hors budgets : leurs empreintes exactes (D-022) sont plus
// fortes qu'un plafond. Le manifeste dist/fork-manifest.json sert de registre de
// référence : une entrée de fixture qui n'y figure plus est périmée et échoue aussi,
// car un orphelin d'un ancien build peut traîner sur disque — la seule présence du
// fichier ne prouve pas qu'il est encore un artefact livré. L'option --fixture <chemin>
// permet d'auto-tester les chemins d'échec sur une copie altérée de la fixture, sans
// toucher au dépôt.

const PROJECT_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const DEFAULT_FIXTURE = join(PROJECT_ROOT, 'tests/fixtures/size-budgets.json');
const MANIFEST_FILE = join(PROJECT_ROOT, 'dist/fork-manifest.json');
const KIBIOCTET = 1024;

try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
        printHelp();
        process.exit(0);
    }

    const fixtureFile = options.fixture ? resolve(options.fixture) : DEFAULT_FIXTURE;
    const budgets = await loadBudgets(fixtureFile);
    const manifestPaths = await loadManifestPaths();

    let tightestMarginPercent = Infinity;
    for (const [path, budget] of Object.entries(budgets)) {
        const file = join(PROJECT_ROOT, path);
        const details = await stat(file).catch((error) => {
            throw new Error(
                `Artefact budgété introuvable sur disque : ${path} (${error.message}) — ` +
                    `reconstruire les artefacts (pnpm build-assets, pnpm compile, ` +
                    `pnpm compile-rtl) ou, si l'artefact n'existe plus, retirer l'entrée ` +
                    `périmée de la fixture par décision consignée (D-024).`,
                { cause: error },
            );
        });
        if (!details.isFile()) {
            throw new Error(`L'artefact budgété ${path} doit être un fichier régulier.`);
        }
        if (!manifestPaths.has(path)) {
            throw new Error(
                `Entrée périmée dans la fixture : ${path} n'est plus un artefact ` +
                    `enregistré au manifeste dist/fork-manifest.json — retirer l'entrée ou ` +
                    `la remplacer par le chemin actuel, par décision consignée (D-024).`,
            );
        }

        if (details.size > budget) {
            const overage = details.size - budget;
            throw new Error(
                `Budget de taille dépassé pour ${path} : taille ${details.size} octets, ` +
                    `budget ${budget} octets, dépassement ${overage} octets ` +
                    `(+${formatPercent((overage / budget) * 100)} %) — remède D-024 : ` +
                    `optimiser l'artefact ou consigner une décision de relèvement du ` +
                    `budget, jamais de relèvement silencieux.`,
            );
        }
        tightestMarginPercent = Math.min(
            tightestMarginPercent,
            ((budget - details.size) / budget) * 100,
        );
    }

    console.log(
        `Budgets de taille : ${Object.keys(budgets).length} artefacts sous budget ` +
            `(marge min ${formatPercent(tightestMarginPercent)} %).`,
    );
} catch (error) {
    console.error(`Budgets de taille en échec : ${error.message}`);
    process.exitCode = 1;
}

function parseArguments(argv) {
    const result = { fixture: null, help: false };

    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];

        if (argument === '-h' || argument === '--help') {
            result.help = true;
            continue;
        }

        const [name, inlineValue] = argument.split('=', 2);
        if (name !== '--fixture') {
            throw new Error(`Argument inconnu : ${argument} (voir --help).`);
        }

        const value = inlineValue ?? argv[++index];
        if (!value || value.startsWith('--')) {
            throw new Error(`Valeur manquante pour ${name}.`);
        }
        result.fixture = value;
    }

    return result;
}

function printHelp() {
    console.log(`
Vérifie les budgets de taille épinglés des artefacts de distribution (D-024).

Usage :
  node build/fork/check-budgets.js [options]

Options :
  --fixture <chemin>  Fixture de budgets à contrôler
                      (défaut : tests/fixtures/size-budgets.json)
  -h, --help          Affiche cette aide
`);
}

async function loadBudgets(file) {
    let fixture;
    try {
        fixture = JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
        throw new Error(`Fixture de budgets illisible (${file}) : ${error.message}`, {
            cause: error,
        });
    }

    if (!fixture || Object.getPrototypeOf(fixture) !== Object.prototype) {
        throw new Error(`La fixture de budgets doit être un objet JSON (${file}).`);
    }
    const expectedKeys = ['budgets', 'policy', 'schemaVersion'];
    const actualKeys = Object.keys(fixture).sort();
    if (
        actualKeys.length !== expectedKeys.length ||
        actualKeys.some((key, index) => key !== expectedKeys[index])
    ) {
        throw new Error(
            `La fixture de budgets doit porter exactement les champs ` +
                `schemaVersion, policy et budgets (${file}).`,
        );
    }
    if (fixture.schemaVersion !== 1) {
        throw new Error(
            `Version de schéma de fixture inattendue : ${fixture.schemaVersion} au lieu de 1.`,
        );
    }
    if (typeof fixture.policy !== 'string' || !fixture.policy.includes('D-024')) {
        throw new Error(`La politique de la fixture doit être une chaîne citant D-024.`);
    }
    if (!fixture.budgets || Object.getPrototypeOf(fixture.budgets) !== Object.prototype) {
        throw new Error(`Le champ budgets de la fixture doit être un objet chemin -> octets.`);
    }
    const entries = Object.entries(fixture.budgets);
    if (!entries.length) {
        throw new Error(`La fixture de budgets ne contient aucun artefact.`);
    }

    for (const [path, budget] of entries) {
        if (!path.startsWith('dist/') || isAbsolute(path) || path.split('/').includes('..')) {
            throw new Error(
                `Chemin budgété invalide : ${path} — seuls des chemins relatifs sous dist/ ` +
                    `sont admis.`,
            );
        }
        if (!Number.isSafeInteger(budget) || budget <= 0 || budget % KIBIOCTET !== 0) {
            throw new Error(
                `Budget invalide pour ${path} : ${budget} — attendu un entier positif ` +
                    `d'octets multiple de ${KIBIOCTET} (taille constatée + 5 % arrondie au ` +
                    `Kio supérieur, D-024).`,
            );
        }
    }

    return fixture.budgets;
}

async function loadManifestPaths() {
    let manifest;
    try {
        manifest = JSON.parse(await readFile(MANIFEST_FILE, 'utf8'));
    } catch (error) {
        throw new Error(
            `Manifeste de distribution illisible (${MANIFEST_FILE}) : ${error.message} — ` +
                `le régénérer avec pnpm build-manifest.`,
            { cause: error },
        );
    }

    if (
        manifest?.schemaVersion !== 1 ||
        !Array.isArray(manifest.files) ||
        manifest.files.some((entry) => typeof entry?.path !== 'string')
    ) {
        throw new Error(
            `Manifeste de distribution invalide (${MANIFEST_FILE}) : schemaVersion 1 et ` +
                `liste files[].path attendus — le régénérer avec pnpm build-manifest.`,
        );
    }

    return new Set(manifest.files.map((entry) => entry.path));
}

function formatPercent(value) {
    return value.toFixed(1).replace('.', ',');
}
