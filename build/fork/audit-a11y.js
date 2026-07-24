// Gate permanent d'accessibilité axe-core du catalogue (D-026).
// Calqué sur build/fork/audit-heritage.js : même serveur statique servant la racine du
// dépôt, même lancement Chrome headless (CDP), même boucle sur tests/*.html triés, même
// viewport 320x640 et même séquence de settle (attente InterVariable + resize + 300 ms).
// Sur chaque page : injection d'axe-core (exact-épinglé en devDependency) puis
// axe.run(document, { resultTypes: ['violations'] }) ; chaque nœud en violation est
// décompté contre le registre d'exceptions tests/fixtures/a11y-exceptions.json (règles
// { famille, regle, selecteur, pages éventuel, motif }, sélecteur apparié via
// element.matches sur le nœud résolu, à défaut par égalité avec la cible axe — même
// mécanique que heritage-exceptions). Le chiffre de suivi est le nombre de violations
// NON consignées, attendu à zéro ; une règle du registre qui ne consigne rien fait
// aussi échouer le gate (entrée périmée). Sortie committée : tests/fixtures/a11y-audit.json.
// Debug : --pages <motif[,motif…]> filtre les pages par sous-chaîne (aucune écriture de
// l'inventaire, contrôle des entrées périmées désactivé).
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    evaluate,
    launchChrome,
    navigateAndWait,
    startStaticServer,
} from './lib/chrome-session.js';

const PROJECT_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUTPUT = join(PROJECT_ROOT, 'tests/fixtures/a11y-audit.json');
const EXCEPTIONS = join(PROJECT_ROOT, 'tests/fixtures/a11y-exceptions.json');

const pagesFilterIndex = process.argv.indexOf('--pages');
const pagesFilter =
    pagesFilterIndex === -1
        ? null
        : (process.argv[pagesFilterIndex + 1] || '')
              .split(',')
              .map((motif) => motif.trim())
              .filter(Boolean);
if (pagesFilterIndex !== -1 && (!pagesFilter || pagesFilter.length === 0)) {
    console.error('Option --pages sans motif : usage `--pages <motif[,motif…]>`.');
    process.exit(1);
}

const allPages = (await readdir(join(PROJECT_ROOT, 'tests')))
    .filter((file) => file.endsWith('.html'))
    .sort();
const pages = pagesFilter
    ? allPages.filter((page) => pagesFilter.some((motif) => page.includes(motif)))
    : allPages;
if (pages.length === 0) {
    console.error(`Aucune page du catalogue ne correspond au filtre --pages "${pagesFilter}".`);
    process.exit(1);
}

const exceptionRules = JSON.parse(await readFile(EXCEPTIONS, 'utf8')).rules;
const axeSource = await readFile(join(PROJECT_ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');
const axeVersion = JSON.parse(
    await readFile(join(PROJECT_ROOT, 'node_modules/axe-core/package.json'), 'utf8'),
).version;

const server = await startStaticServer(PROJECT_ROOT);
const session = await launchChrome({ height: 640, width: 320 });
const inventory = {};
const totals = {
    consignees: 0,
    consigneesParFamille: {},
    nonConsignees: 0,
    nonConsigneesParRegle: {},
    violations: 0,
};
const accountedPerRule = exceptionRules.map(() => 0);
let engineVersion = null;

try {
    const port = server.address().port;
    for (const page of pages) {
        await navigateAndWait(session, `http://127.0.0.1:${port}/tests/${page}`);
        await evaluate(
            session,
            `(async () => {
                for (let attempt = 0; attempt < 100; attempt++) {
                    if (getComputedStyle(document.body).fontFamily.includes('InterVariable')) break;
                    await new Promise((done) => setTimeout(done, 50));
                }
                window.dispatchEvent(new Event('resize'));
                await new Promise((done) => setTimeout(done, 300));
                return true;
            })()`,
        );
        const axeReady = await evaluate(session, `${axeSource}\n;typeof window.axe`);
        if (axeReady !== 'object' && axeReady !== 'function') {
            throw new Error(`Injection d'axe-core échouée sur ${page} (typeof axe = ${axeReady}).`);
        }
        const metrics = await evaluate(
            session,
            `axe.run(document, { resultTypes: ['violations'] }).then((result) => {
                const exceptionRules = ${JSON.stringify(exceptionRules)};
                const page = ${JSON.stringify(page)};
                const resolveElement = (target) => {
                    if (target.length !== 1 || typeof target[0] !== 'string') return null;
                    try {
                        return document.querySelector(target[0]);
                    } catch {
                        return null;
                    }
                };
                const accountedRuleIndex = (violationId, element, cible) => {
                    for (let index = 0; index < exceptionRules.length; index++) {
                        const rule = exceptionRules[index];
                        if (rule.regle !== violationId) continue;
                        if (rule.pages && !rule.pages.includes(page)) continue;
                        if (element && element.matches(rule.selecteur)) return index;
                        if (cible === rule.selecteur) return index;
                    }
                    return -1;
                };
                const consigneesParRegistre = {};
                const nonConsigneesParRegle = {};
                const echantillon = [];
                let violations = 0;
                let consignees = 0;
                let nonConsignees = 0;
                for (const violation of result.violations) {
                    for (const node of violation.nodes) {
                        violations++;
                        const cible = node.target.map(String).join(' ');
                        const element = resolveElement(node.target);
                        const index = accountedRuleIndex(violation.id, element, cible);
                        if (index !== -1) {
                            consignees++;
                            consigneesParRegistre[index] = (consigneesParRegistre[index] ?? 0) + 1;
                        } else {
                            nonConsignees++;
                            nonConsigneesParRegle[violation.id] =
                                (nonConsigneesParRegle[violation.id] ?? 0) + 1;
                            if (echantillon.length < 10) {
                                echantillon.push({
                                    cible: cible.slice(0, 200),
                                    regle: violation.id,
                                    resume: String(node.failureSummary || violation.help)
                                        .replace(/\\s+/g, ' ')
                                        .slice(0, 220),
                                });
                            }
                        }
                    }
                }
                return {
                    consignees,
                    consigneesParRegistre,
                    engine: result.testEngine.version,
                    nonConsignees,
                    nonConsigneesEchantillon: echantillon,
                    nonConsigneesParRegle,
                    violations,
                };
            })`,
        );
        engineVersion = metrics.engine;
        const consigneesParFamille = {};
        for (const [index, count] of Object.entries(metrics.consigneesParRegistre)) {
            accountedPerRule[index] += count;
            const famille = exceptionRules[index].famille;
            consigneesParFamille[famille] = (consigneesParFamille[famille] ?? 0) + count;
            totals.consigneesParFamille[famille] =
                (totals.consigneesParFamille[famille] ?? 0) + count;
        }
        for (const [regle, count] of Object.entries(metrics.nonConsigneesParRegle)) {
            totals.nonConsigneesParRegle[regle] =
                (totals.nonConsigneesParRegle[regle] ?? 0) + count;
        }
        totals.violations += metrics.violations;
        totals.consignees += metrics.consignees;
        totals.nonConsignees += metrics.nonConsignees;
        inventory[page] = {
            consignees: metrics.consignees,
            consigneesParFamille,
            nonConsignees: metrics.nonConsignees,
            nonConsigneesEchantillon: metrics.nonConsigneesEchantillon,
            nonConsigneesParRegle: metrics.nonConsigneesParRegle,
            violations: metrics.violations,
        };
    }
} finally {
    server.close();
    await session.close();
}

if (!pagesFilter) {
    await writeFile(
        OUTPUT,
        `${JSON.stringify(
            {
                schemaVersion: 1,
                scope: 'Catalogue tests/ à 320 px CSS, runtime actif — gate D-026 : axe.run resultTypes=[violations], nœuds décomptés contre le registre d’exceptions tests/fixtures/a11y-exceptions.json.',
                axeVersion,
                engineVersion,
                viewport: { height: 640, width: 320 },
                totals,
                pages: inventory,
            },
            null,
            4,
        )}\n`,
    );
}

const filterNote = pagesFilter ? ` (filtre --pages "${pagesFilter.join(',')}")` : '';
console.log(
    `A11y audit${filterNote}: ${pages.length} pages — violations: ${totals.violations} ` +
        `(consignées: ${totals.consignees}, NON consignées: ${totals.nonConsignees}), ` +
        `axe-core ${axeVersion}.` +
        (pagesFilter ? '' : ` Inventaire: ${OUTPUT.replace(`${PROJECT_ROOT}/`, '')}`),
);
if (totals.nonConsignees > 0) {
    const breakdown = Object.entries(totals.nonConsigneesParRegle)
        .sort((a, b) => b[1] - a[1])
        .map(([regle, count]) => `${regle}: ${count}`)
        .join(', ');
    console.error(`NON consignées par règle axe — ${breakdown}.`);
    console.error(
        'Violations axe-core hors registre d’exceptions : compléter la correction ou le registre (D-026).',
    );
    process.exitCode = 1;
}
if (!pagesFilter) {
    const stale = exceptionRules
        .filter((rule, index) => accountedPerRule[index] === 0)
        .map((rule) => rule.famille);
    if (stale.length > 0) {
        console.error(
            `Règle(s) du registre sans occurrence consignée (entrée périmée) : ${stale.join(', ')} — ` +
                'retirer ou justifier via DECISIONS.md (D-026).',
        );
        process.exitCode = 1;
    }
}
