import { transform } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const METRICS_SOURCE = resolve(PROJECT_ROOT, 'tests/js/mobile-seo-metrics.ts');
const options = parseArguments(process.argv.slice(2));

if (options.help) {
    printHelp();
    process.exit(0);
}
if (!options.url) {
    throw new Error('--url is required.');
}

const output = resolve(
    PROJECT_ROOT,
    options.output || 'tests/fixtures/fork-mobile-seo.metrics.json',
);
const deviceProfile = options.width < 960 ? 'mobile' : 'desktop';
const userDataDirectory = await mkdtemp(resolve(tmpdir(), 'drake-ts-chrome-'));
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
        '--no-default-browser-check',
        '--no-first-run',
        '--no-sandbox',
        '--remote-debugging-port=0',
        `--user-data-dir=${userDataDirectory}`,
        'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
);

try {
    const websocketUrl = await readDevToolsUrl(chrome);
    const cdp = await createCdpClient(websocketUrl);

    try {
        const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await cdp.send('Target.attachToTarget', {
            flatten: true,
            targetId,
        });

        await Promise.all([
            cdp.send('Page.enable', {}, sessionId),
            cdp.send('Runtime.enable', {}, sessionId),
            cdp.send(
                'Emulation.setDeviceMetricsOverride',
                {
                    deviceScaleFactor: 1,
                    height: options.height,
                    mobile: deviceProfile === 'mobile',
                    screenHeight: options.height,
                    screenWidth: options.width,
                    width: options.width,
                },
                sessionId,
            ),
        ]);
        await cdp.send(
            'Page.addScriptToEvaluateOnNewDocument',
            { source: await compileMetricsBootstrap() },
            sessionId,
        );
        await cdp.send('Page.navigate', { url: options.url }, sessionId);
        await waitForDocumentComplete(cdp, sessionId);
        await evaluate(cdp, sessionId, 'window.__forkMobileSeo.fontsReady()');
        await delay(500);

        const summaryRect = await evaluate(
            cdp,
            sessionId,
            'window.__forkMobileSeo.summaryCenter()',
        );
        if (summaryRect) {
            await cdp.send(
                'Input.dispatchMouseEvent',
                { button: 'left', clickCount: 1, type: 'mousePressed', ...summaryRect },
                sessionId,
            );
            await cdp.send(
                'Input.dispatchMouseEvent',
                { button: 'left', clickCount: 1, type: 'mouseReleased', ...summaryRect },
                sessionId,
            );
            await delay(300);
        }

        const measured = await evaluate(cdp, sessionId, 'window.__forkMobileSeo.snapshot()');
        const metrics = {
            schemaVersion: 1,
            source: 'Chrome headless laboratory run',
            page: new URL(options.url).pathname,
            deviceProfile,
            viewport: { height: options.height, width: options.width },
            lcpMs: round(measured.lcpMs, 1),
            inpMs: measured.inpMs === null ? null : round(measured.inpMs, 1),
            cls: round(measured.cls, 4),
            labTbtMs: round(measured.labTbtMs, 1),
            reflow: measured.reflow,
            actionTarget: measured.actionTarget
                ? {
                      height: round(measured.actionTarget.height, 1),
                      width: round(measured.actionTarget.width, 1),
                  }
                : null,
            content: measured.content,
            fonts: measured.fonts,
            table: measured.table,
        };

        await mkdir(dirname(output), { recursive: true });
        await writeFile(output, `${JSON.stringify(metrics, null, 4)}\n`, 'utf8');
        console.log(
            `${deviceProfile === 'mobile' ? 'Mobile' : 'Desktop'} SEO metrics written to ${relativeProjectPath(output)}`,
        );
    } finally {
        cdp.close();
    }
} finally {
    await cleanupChrome(chrome, userDataDirectory);
}

function parseArguments(argv) {
    const result = { chrome: null, height: 640, help: false, output: null, url: null, width: 320 };
    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];
        if (argument === '-h' || argument === '--help') {
            result.help = true;
            continue;
        }

        const [name, inlineValue] = argument.split('=', 2);
        if (!['--chrome', '--height', '--output', '--url', '--width'].includes(name)) {
            throw new Error(`Unknown argument: ${argument}`);
        }
        const value = inlineValue ?? argv[++index];
        if (!value || value.startsWith('--')) {
            throw new Error(`Missing value for ${name}`);
        }
        result[toCamelCase(name.slice(2))] = ['--height', '--width'].includes(name)
            ? parsePositiveInteger(value, name)
            : value;
    }
    return result;
}

function printHelp() {
    console.log(`
Measure the HTML-first fixture with local headless Chrome.

Usage:
  node build/fork/measure-mobile-seo.js --url <url> [options]

Options:
  --chrome <path>  Chrome executable (default: google-chrome)
  --width <px>     Viewport width (default: 320)
  --height <px>    Viewport height (default: 640)
  --output <path>  Metrics JSON output
  -h, --help       Show this help
`);
}

async function compileMetricsBootstrap() {
    const source = await readFile(METRICS_SOURCE, 'utf8');
    const result = await transform(source, {
        format: 'iife',
        loader: 'ts',
        target: 'es2022',
    });
    return result.code;
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

    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            await rm(directory, { force: true, recursive: true });
            return;
        } catch (error) {
            if (error.code !== 'ENOTEMPTY' || attempt === 4) {
                console.warn(`Temporary Chrome profile cleanup failed: ${error.message}`);
                return;
            }
            await delay(100);
        }
    }
}

function round(value, precision) {
    const factor = 10 ** precision;
    return Math.round(Number(value || 0) * factor) / factor;
}

function parsePositiveInteger(value, name) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`${name} must be a positive integer.`);
    }
    return parsed;
}

function relativeProjectPath(file) {
    return file.startsWith(`${PROJECT_ROOT}/`) ? file.slice(PROJECT_ROOT.length + 1) : file;
}

function toCamelCase(value) {
    return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
