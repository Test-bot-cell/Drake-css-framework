// Session Chrome headless + serveur statique partagés par les gates de compatibilité (G7).
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';

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

export function startStaticServer(rootDirectory) {
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

export async function launchChrome({ chrome = 'google-chrome', width = 1440, height = 900 } = {}) {
    const userDataDirectory = await mkdtemp(join(tmpdir(), 'drake-compat-chrome-'));
    const child = spawn(
        chrome,
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

    const websocketUrl = await readDevToolsUrl(child);
    const cdp = await createCdpClient(websocketUrl);
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { flatten: true, targetId });
    await Promise.all([
        cdp.send('Page.enable', {}, sessionId),
        cdp.send('Runtime.enable', {}, sessionId),
        cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true }, sessionId),
        cdp.send(
            'Emulation.setDeviceMetricsOverride',
            {
                deviceScaleFactor: 1,
                height,
                mobile: false,
                screenHeight: height,
                screenWidth: width,
                width,
            },
            sessionId,
        ),
    ]);

    return {
        cdp,
        sessionId,
        async close() {
            cdp.close();
            if (child.exitCode === null) {
                child.kill('SIGTERM');
                await Promise.race([
                    new Promise((resolveExit) => child.once('exit', resolveExit)),
                    delay(2000),
                ]);
            }
            await rm(userDataDirectory, { force: true, recursive: true }).catch(() => {});
        },
    };
}

export async function navigateAndWait(session, url) {
    await session.cdp.send('Page.navigate', { url }, session.sessionId);
    for (let attempt = 0; attempt < 200; attempt++) {
        const state = await evaluate(session, 'document.readyState');
        if (state === 'complete') {
            return;
        }
        await delay(50);
    }
    throw new Error(`Page load timed out: ${url}`);
}

export async function evaluate(session, expression) {
    const result = await session.cdp.send(
        'Runtime.evaluate',
        { awaitPromise: true, expression, returnByValue: true },
        session.sessionId,
    );
    if (result.exceptionDetails) {
        throw new Error(
            result.exceptionDetails.exception?.description || result.exceptionDetails.text,
        );
    }
    return result.result.value;
}

export function delay(milliseconds) {
    return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function readDevToolsUrl(child) {
    return new Promise((resolveUrl, reject) => {
        let output = '';
        const timer = setTimeout(
            () => reject(new Error('Chrome DevTools startup timed out.')),
            10000,
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
