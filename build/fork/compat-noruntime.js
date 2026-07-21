// Gate G7 (sans runtime) : attentes documentées du HTML initial, JavaScript désactivé.
// Pour chaque page du catalogue, le HTML statique doit livrer seul son contenu : titres,
// liens avec href réel, texte, alternatives d'images et contrôles natifs. Les attentes
// committées (tests/fixtures/compat/no-runtime.json) sont le contrat par composant exigé
// par la phase 1 (ROADMAP) et le profil MOBILE_FIRST_SEO.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
    delay,
    evaluate,
    launchChrome,
    navigateAndWait,
    startStaticServer,
} from './lib/chrome-session.js';

const PROJECT_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const FIXTURE = join(PROJECT_ROOT, 'tests/fixtures/compat/no-runtime.json');

const write = process.argv.includes('--write');

const pages = (await readdir(join(PROJECT_ROOT, 'tests')))
    .filter((file) => file.endsWith('.html'))
    .sort();

const server = await startStaticServer(PROJECT_ROOT);
const session = await launchChrome({});
const observed = {};

try {
    const port = server.address().port;
    await session.cdp.send(
        'Emulation.setScriptExecutionDisabled',
        { value: true },
        session.sessionId,
    );
    for (const page of pages) {
        await navigateAndWait(session, `http://127.0.0.1:${port}/tests/${page}`);
        await delay(150);
        observed[page] = await evaluate(
            session,
            `(() => {
                const headings = {};
                for (const heading of document.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
                    headings[heading.tagName.toLowerCase()] =
                        (headings[heading.tagName.toLowerCase()] ?? 0) + 1;
                }
                const links = [...document.querySelectorAll('a')];
                const images = [...document.querySelectorAll('img')];
                return {
                    formControls: document.querySelectorAll('input, select, textarea, button')
                        .length,
                    headings,
                    imagesTotal: images.length,
                    imagesWithoutAlt: images.filter((image) => !image.hasAttribute('alt')).length,
                    links: links.length,
                    linksWithoutHref: links.filter((link) => !link.getAttribute('href')).length,
                    textLength: (document.body.innerText ?? '').replace(/\\s+/g, ' ').trim()
                        .length,
                };
            })()`,
        );
    }
} finally {
    server.close();
    await session.close();
}

if (write) {
    await writeFile(FIXTURE, `${JSON.stringify(observed, null, 4)}\n`);
    console.log(`No-runtime expectations written for ${pages.length} pages.`);
} else {
    const expected = JSON.parse(await readFile(FIXTURE, 'utf8'));
    let failures = 0;
    for (const page of pages) {
        const left = JSON.stringify(expected[page] ?? null);
        const right = JSON.stringify(observed[page]);
        if (left !== right) {
            failures++;
            console.error(`[${page}] attentes sans runtime divergentes:`);
            console.error(`  attendu : ${left}`);
            console.error(`  observé : ${right}`);
        }
    }
    if (failures) {
        console.error(`No-runtime expectations failed: ${failures} page(s).`);
        process.exit(1);
    }
    console.log(
        `No-runtime expectations passed: ${pages.length} pages match the documented contract.`,
    );
}
