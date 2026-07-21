// Gate G7 (C2) : exécute les scénarios d'interaction du catalogue
// (tests/js/compat/scenarios/*.ts) dans Chrome headless et agrège les assertions.
import { build } from 'esbuild';
import { readdir } from 'node:fs/promises';
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
const SCENARIOS_DIRECTORY = join(PROJECT_ROOT, 'tests/js/compat/scenarios');

const options = parseArguments(process.argv.slice(2));
const groupFiles = (await readdir(SCENARIOS_DIRECTORY))
    .filter((file) => file.endsWith('.ts'))
    .filter((file) => !options.group || file === `${options.group}.ts`)
    .sort();

const server = await startStaticServer(PROJECT_ROOT);
const session = await launchChrome({});
let totalChecks = 0;
let failures = 0;

try {
    const port = server.address().port;
    for (const groupFile of groupFiles) {
        const bundle = await bundleGroup(join(SCENARIOS_DIRECTORY, groupFile));

        await navigateAndWait(session, 'data:text/html,<title>drake-scenarios</title>');
        await evaluate(session, bundle);
        const definitions = await evaluate(session, 'window.__drakeScenarios.list()');

        // Une navigation par scénario : chaque scénario part d'un état de page vierge.
        for (const { name, page } of definitions) {
            await navigateAndWait(session, `http://127.0.0.1:${port}/tests/${page}`);
            await delay(600);
            await evaluate(session, bundle);
            const result = await evaluate(
                session,
                `window.__drakeScenarios.run(${JSON.stringify(name)})`,
            );
            report(groupFile, page, name, result);
        }
    }
} finally {
    server.close();
    await session.close();
}

if (failures) {
    console.error(`Compat scenarios failed: ${failures} assertion(s) en échec.`);
    process.exit(1);
}
console.log(`Compat scenarios passed: ${totalChecks} assertions vertes.`);

function report(groupFile, page, name, result) {
    if (result.error) {
        failures++;
        console.error(`[${groupFile} · ${page} · ${name}] erreur: ${result.error}`);
    }
    for (const check of result.checks) {
        totalChecks++;
        if (!check.pass) {
            failures++;
            console.error(
                `[${groupFile} · ${page} · ${name}] ÉCHEC: ${check.label}` +
                    (check.detail ? ` — ${check.detail}` : ''),
            );
        }
    }
}

async function bundleGroup(entry) {
    const result = await build({
        bundle: true,
        entryPoints: [entry],
        format: 'iife',
        target: 'es2022',
        write: false,
    });
    return result.outputFiles[0].text;
}

function parseArguments(argv) {
    const parsed = { group: '' };
    for (let index = 0; index < argv.length; index++) {
        if (argv[index] === '--group') {
            parsed.group = argv[++index];
        } else {
            throw new Error(`Unknown argument: ${argv[index]}`);
        }
    }
    return parsed;
}
