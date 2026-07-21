// Gate G7 (C3) : boucle API programmatique — chaque composant du registre est créé
// puis détruit proprement (voir tests/js/compat/api-smoke.ts).
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';
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

const server = await startStaticServer(PROJECT_ROOT);
const session = await launchChrome({});
try {
    const port = server.address().port;
    await navigateAndWait(session, `http://127.0.0.1:${port}/tests/js/compat/api-host.html`);
    await delay(400);

    const source = await readFile(join(PROJECT_ROOT, 'tests/js/compat/api-smoke.ts'), 'utf8');
    const { code } = await transform(source, { format: 'iife', loader: 'ts', target: 'es2022' });
    await evaluate(session, code);
    const result = await evaluate(session, 'window.__drakeApiSmoke()');

    for (const { name, reason } of result.skipped) {
        console.log(`C3 ignoré  : ${name} (${reason})`);
    }
    for (const { name, error } of result.failed) {
        console.error(`C3 échec   : ${name} — ${error}`);
    }
    console.log(
        `C3 API smoke: ${result.passed.length} composants montés et détruits proprement, ` +
            `${result.skipped.length} ignorés documentés, ${result.failed.length} échecs.`,
    );
    if (result.failed.length) {
        process.exitCode = 1;
    }
} finally {
    server.close();
    await session.close();
}
