// Gate G7 (C0/C1) : snapshots structurels du catalogue tests/ en LTR et RTL.
// --write : capture et enregistre les fixtures (mode référence, avec --map pour appliquer
//           la table de renommage D-012 aux traces d'une référence pré-renommage).
// (défaut) : capture l'état courant et le compare aux fixtures committées.
import { transform } from 'esbuild';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const COLLECTOR_SOURCE = join(PROJECT_ROOT, 'tests/js/compat/snapshot-collector.ts');
const DEFAULT_FIXTURES = join(PROJECT_ROOT, 'tests/fixtures/compat');
const DIRECTIONS = ['ltr', 'rtl'];

// Contenus volatils (toutes pages) : le texte des compteurs dépend de l'horloge,
// descendants compris (les chiffres vivent dans des spans enfants).
const VOLATILE_TEXT = [
    '.uk-countdown-number',
    '.uk-countdown-number *',
    '.drk-countdown-number',
    '.drk-countdown-number *',
];

const MIME_TYPES = {
    '.css': 'text/css',
    '.html': 'text/html; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.mjs': 'text/javascript',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webm': 'video/webm',
    '.woff2': 'font/woff2',
};

const options = parseArguments(process.argv.slice(2));
const root = resolve(options.root || PROJECT_ROOT);
const fixturesDirectory = resolve(options.fixtures || DEFAULT_FIXTURES);

const pages = options.pages
    ? options.pages.split(',').map((page) => page.trim())
    : (await readdir(join(root, 'tests'))).filter((file) => file.endsWith('.html')).sort();

const collector = await compileCollector();
const server = await startServer(root);
const port = server.address().port;
const userDataDirectory = await mkdtemp(join(tmpdir(), 'drake-compat-chrome-'));
const chrome = spawn(
    options.chrome || 'google-chrome',
    [
        '--headless=new',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-sync',
        '--hide-scrollbars',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-sandbox',
        '--remote-debugging-port=0',
        `--user-data-dir=${userDataDirectory}`,
        'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
);

let failures = 0;
let captured = 0;

try {
    const websocketUrl = await readDevToolsUrl(chrome);
    const cdp = await createCdpClient(websocketUrl);
    try {
        const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await cdp.send('Target.attachToTarget', { flatten: true, targetId });
        await Promise.all([
            cdp.send('Page.enable', {}, sessionId),
            cdp.send('Runtime.enable', {}, sessionId),
            cdp.send(
                'Emulation.setDeviceMetricsOverride',
                {
                    deviceScaleFactor: 1,
                    height: 900,
                    mobile: false,
                    screenHeight: 900,
                    screenWidth: 1440,
                    width: 1440,
                },
                sessionId,
            ),
        ]);

        if (options.write) {
            await mkdir(fixturesDirectory, { recursive: true });
        }

        for (const direction of DIRECTIONS) {
            await cdp.send(
                'Page.addScriptToEvaluateOnNewDocument',
                {
                    source:
                        `try { sessionStorage.setItem('_uikit_dir', ${JSON.stringify(direction)});` +
                        ` sessionStorage.setItem('_drake_dir', ${JSON.stringify(direction)}); } catch {}\n${collector}`,
                },
                sessionId,
            );
            for (const page of pages) {
                const lines = await capturePage(cdp, sessionId, page);
                const mapped = options.map ? lines.map(applyRenameMap) : lines;
                const fixtureFile = join(
                    fixturesDirectory,
                    `${page.replace(/\.html$/, '')}.${direction}.txt`,
                );
                captured++;
                if (options.write) {
                    await writeFile(fixtureFile, `${mapped.join('\n')}\n`);
                } else {
                    await compareWithFixture(page, direction, mapped, fixtureFile);
                }
            }
        }
    } finally {
        cdp.close();
    }
} finally {
    server.close();
    await cleanupChrome(chrome, userDataDirectory);
}

if (options.write) {
    console.log(
        `Compat snapshots written: ${captured} captures into ${relativePath(fixturesDirectory)}.`,
    );
} else if (failures) {
    console.error(
        `Compat snapshot check failed: ${failures} capture(s) diverge from the fixtures.`,
    );
    process.exit(1);
} else {
    console.log(`Compat snapshot check passed: ${captured} captures match the fixtures.`);
}

async function capturePage(cdp, sessionId, page) {
    const url = `http://127.0.0.1:${port}/tests/${page}`;
    await cdp.send('Page.navigate', { url }, sessionId);
    await waitForDocumentComplete(cdp, sessionId);
    await evaluate(cdp, sessionId, 'window.__drakeCompat.settle()');
    const volatileText = VOLATILE_TEXT;
    return evaluate(
        cdp,
        sessionId,
        `window.__drakeCompat.snapshot({ volatileText: ${JSON.stringify(volatileText)} })`,
    );
}

async function compareWithFixture(page, direction, lines, fixtureFile) {
    const expectedRaw = await readFile(fixtureFile, 'utf8').catch(() => null);
    if (expectedRaw === null) {
        failures++;
        console.error(`[${page} ${direction}] fixture manquante: ${relativePath(fixtureFile)}`);
        return;
    }
    const expected = expectedRaw.split('\n').filter(Boolean);
    if (
        expected.length === lines.length &&
        expected.every((line, index) => line === lines[index])
    ) {
        return;
    }
    failures++;
    console.error(
        `[${page} ${direction}] divergence (${expected.length} lignes attendues, ${lines.length} capturées)`,
    );
    let shown = 0;
    const max = Math.max(expected.length, lines.length);
    for (let index = 0; index < max && shown < 5; index++) {
        if (expected[index] !== lines[index]) {
            shown++;
            console.error(`  #${index}`);
            console.error(`    attendu : ${expected[index] ?? '<absent>'}`);
            console.error(`    capturé : ${lines[index] ?? '<absent>'}`);
        }
    }
}

// Table de renommage D-012 appliquée aux traces d'une référence pré-renommage.
// Le tri des classes et attributs est refait APRÈS mapping : l'ordre lexical de uk-*
// et drk-* diffère par rapport aux autres noms.
function applyRenameMap(line) {
    const [depth, tag, classes, attributes, text] = JSON.parse(line);
    const map = (value) =>
        value
            .replaceAll('uikit-ts.example', 'drake-css.example')
            .replaceAll('https://getuikit.com', 'https://example.com')
            .replaceAll('getuikit.com', 'example.com')
            .replaceAll('UIkit', 'Drake')
            .replaceAll('UIKit', 'Drake')
            .replaceAll('uikit', 'drake')
            .replaceAll('uk-', 'drk-');
    const attributeName = (attribute) => attribute.slice(0, attribute.indexOf('='));
    return JSON.stringify([
        depth,
        map(tag),
        classes.map(map).sort(),
        // Tri par NOM d'attribut (comme le collecteur) : le tri par chaîne complète
        // inverse les paires nom/nom-préfixé ('stroke' vs 'stroke-width').
        attributes
            .map(map)
            .sort((left, right) => (attributeName(left) < attributeName(right) ? -1 : 1)),
        map(text),
    ]);
}

async function compileCollector() {
    const source = await readFile(COLLECTOR_SOURCE, 'utf8');
    const result = await transform(source, { format: 'iife', loader: 'ts', target: 'es2022' });
    return result.code;
}

function startServer(rootDirectory) {
    const server = createServer(async (request, response) => {
        try {
            const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
            const file = join(rootDirectory, pathname.replaceAll('..', ''));
            const body = await readFile(file);
            response.writeHead(200, {
                'content-type': MIME_TYPES[extname(file)] || 'application/octet-stream',
            });
            response.end(body);
        } catch {
            response.writeHead(404);
            response.end('not found');
        }
    });
    return new Promise((resolveServer, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => resolveServer(server));
    });
}

function parseArguments(argv) {
    const parsed = { chrome: '', fixtures: '', map: false, pages: '', root: '', write: false };
    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];
        if (argument === '--write') parsed.write = true;
        else if (argument === '--map') parsed.map = true;
        else if (argument === '--root') parsed.root = argv[++index];
        else if (argument === '--fixtures') parsed.fixtures = argv[++index];
        else if (argument === '--pages') parsed.pages = argv[++index];
        else if (argument === '--chrome') parsed.chrome = argv[++index];
        else throw new Error(`Unknown argument: ${argument}`);
    }
    return parsed;
}

async function readDevToolsUrl(child) {
    return new Promise((resolveUrl, reject) => {
        let output = '';
        const timer = setTimeout(
            () => reject(new Error('Chrome DevTools startup timed out.')),
            30000,
        );
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => {
            output += chunk;
            const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
            if (match) {
                clearTimeout(timer);
                resolveUrl(match[1]);
            }
        });
        child.once('error', (error) => {
            clearTimeout(timer);
            reject(error);
        });
        child.once('exit', (code) => {
            clearTimeout(timer);
            reject(new Error(`Chrome exited before DevTools was ready (${code}).`));
        });
    });
}

async function createCdpClient(url) {
    const socket = new WebSocket(url);
    const pending = new Map();
    let identifier = 0;

    await new Promise((resolveOpen, reject) => {
        socket.addEventListener('open', resolveOpen, { once: true });
        socket.addEventListener('error', () => reject(new Error('Unable to connect to Chrome.')), {
            once: true,
        });
    });
    socket.addEventListener('message', ({ data }) => {
        const message = JSON.parse(String(data));
        if (!message.id || !pending.has(message.id)) {
            return;
        }
        const { reject, resolveResult } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) {
            reject(new Error(message.error.message));
        } else {
            resolveResult(message.result || {});
        }
    });

    return {
        close() {
            socket.close();
        },
        send(method, params = {}, sessionId) {
            return new Promise((resolveResult, reject) => {
                const id = ++identifier;
                pending.set(id, { reject, resolveResult });
                socket.send(JSON.stringify({ id, method, params, sessionId }));
            });
        },
    };
}

async function waitForDocumentComplete(cdp, sessionId) {
    for (let attempt = 0; attempt < 600; attempt++) {
        const state = await evaluate(cdp, sessionId, 'document.readyState');
        if (state === 'complete') {
            return;
        }
        await delay(50);
    }
    throw new Error('Page load timed out.');
}

async function evaluate(cdp, sessionId, expression) {
    const result = await cdp.send(
        'Runtime.evaluate',
        { awaitPromise: true, expression, returnByValue: true },
        sessionId,
    );
    if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.text);
    }
    return result.result.value;
}

function delay(milliseconds) {
    return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function cleanupChrome(child, directory) {
    if (child.exitCode === null) {
        child.kill('SIGTERM');
        await Promise.race([
            new Promise((resolveExit) => child.once('exit', resolveExit)),
            delay(2000),
        ]);
    }
    await rm(directory, { force: true, recursive: true }).catch(() => {});
}

function relativePath(file) {
    return file.startsWith(`${PROJECT_ROOT}/`) ? file.slice(PROJECT_ROOT.length + 1) : file;
}

// Empreinte utilitaire exposée pour les diagnostics (non utilisée par le gate).
export function fingerprint(lines) {
    return createHash('sha256').update(lines.join('\n')).digest('hex');
}
