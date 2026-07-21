// Inventaire des écarts mobile-first/SEO hérités (phase 1, ROADMAP) — CONSTAT, pas gate.
// Mesure chaque page du catalogue à 320 px CSS, runtime actif, et consigne les écarts à
// corriger : débordement horizontal, cibles interactives < 24 px (hors liens en ligne,
// exception WCAG 2.2), images sans alt ou sans dimensions réservées, sauts de hiérarchie
// de titres, contenu masqué par breakpoint. Sortie committée :
// tests/fixtures/heritage-audit.json.
import { readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    evaluate,
    launchChrome,
    navigateAndWait,
    startStaticServer,
} from './lib/chrome-session.js';

const PROJECT_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUTPUT = join(PROJECT_ROOT, 'tests/fixtures/heritage-audit.json');

const pages = (await readdir(join(PROJECT_ROOT, 'tests')))
    .filter((file) => file.endsWith('.html'))
    .sort();

const server = await startStaticServer(PROJECT_ROOT);
const session = await launchChrome({ height: 640, width: 320 });
const inventory = {};
const totals = {
    breakpointHidden: 0,
    headingSkips: 0,
    horizontalOverflow: 0,
    imagesWithoutAlt: 0,
    imagesWithoutDimensions: 0,
    smallTargets: 0,
};

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
        const metrics = await evaluate(
            session,
            `(() => {
                const root = document.documentElement;
                const visible = (element) => {
                    const rect = element.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                };
                const targets = [
                    ...document.querySelectorAll(
                        'a, button, input, select, textarea, [role="button"]',
                    ),
                ].filter(visible);
                const smallTargets = targets.filter((target) => {
                    if (
                        target.tagName === 'A' &&
                        getComputedStyle(target).display === 'inline'
                    ) {
                        return false; // exception WCAG 2.2 des liens en ligne
                    }
                    const rect = target.getBoundingClientRect();
                    return rect.width < 24 || rect.height < 24;
                });
                const images = [...document.querySelectorAll('img')];
                const levels = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(
                    (heading) => Number(heading.tagName[1]),
                );
                let headingSkips = 0;
                for (let index = 1; index < levels.length; index++) {
                    if (levels[index] - levels[index - 1] > 1) headingSkips++;
                }
                return {
                    breakpointHidden: document.querySelectorAll(
                        '[class*="drk-visible@"], [class*="drk-hidden@"]',
                    ).length,
                    headingSkips,
                    horizontalOverflow: root.scrollWidth > root.clientWidth,
                    imagesWithoutAlt: images.filter((image) => !image.hasAttribute('alt'))
                        .length,
                    imagesWithoutDimensions: images.filter(
                        (image) =>
                            !(image.hasAttribute('width') && image.hasAttribute('height')) &&
                            !getComputedStyle(image).aspectRatio.includes('/'),
                    ).length,
                    smallTargets: smallTargets.length,
                    smallTargetsSample: smallTargets.slice(0, 5).map((target) => {
                        const rect = target.getBoundingClientRect();
                        return (
                            target.tagName.toLowerCase() +
                            '.' +
                            [...target.classList].slice(0, 2).join('.') +
                            ' ' +
                            Math.round(rect.width) +
                            'x' +
                            Math.round(rect.height)
                        );
                    }),
                };
            })()`,
        );
        inventory[page] = metrics;
        totals.breakpointHidden += metrics.breakpointHidden;
        totals.headingSkips += metrics.headingSkips;
        totals.horizontalOverflow += metrics.horizontalOverflow ? 1 : 0;
        totals.imagesWithoutAlt += metrics.imagesWithoutAlt;
        totals.imagesWithoutDimensions += metrics.imagesWithoutDimensions;
        totals.smallTargets += metrics.smallTargets;
    }
} finally {
    server.close();
    await session.close();
}

await writeFile(
    OUTPUT,
    `${JSON.stringify(
        {
            schemaVersion: 1,
            scope: 'Catalogue tests/ à 320 px CSS, runtime actif — inventaire de dette héritée, non gate.',
            totals,
            pages: inventory,
        },
        null,
        4,
    )}\n`,
);
console.log(
    `Heritage audit: ${pages.length} pages — débordements: ${totals.horizontalOverflow}, ` +
        `cibles < 24 px: ${totals.smallTargets}, images sans alt: ${totals.imagesWithoutAlt}, ` +
        `sans dimensions: ${totals.imagesWithoutDimensions}, sauts de titres: ${totals.headingSkips}, ` +
        `masquages par breakpoint: ${totals.breakpointHidden}. Inventaire: ${OUTPUT.replace(`${PROJECT_ROOT}/`, '')}`,
);
