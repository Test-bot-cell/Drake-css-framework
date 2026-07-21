import { execa } from 'execa';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, resolve, sep } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CHROME = process.env.CHROME || 'google-chrome';
const server = createServer(serveProjectFile);

await new Promise((resolveListening, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListening);
});

const address = server.address();
if (!address || typeof address === 'string') {
    throw new Error('Unable to resolve the frontend audit server address.');
}

const baseUrl = `http://127.0.0.1:${address.port}`;
const pageUrl = `${baseUrl}/tests/fork-mobile-seo.html`;
const assetsPageUrl = `${baseUrl}/tests/fork-assets.html`;

try {
    await run('build/fork/measure-mobile-seo.js', [
        '--chrome',
        CHROME,
        '--url',
        pageUrl,
        '--width',
        '320',
        '--height',
        '640',
        '--output',
        'tests/fixtures/fork-mobile-seo.metrics.json',
    ]);
    await run('build/fork/measure-mobile-seo.js', [
        '--chrome',
        CHROME,
        '--url',
        pageUrl,
        '--width',
        '1440',
        '--height',
        '1000',
        '--output',
        'tests/fixtures/fork-mobile-seo.desktop.metrics.json',
    ]);
    await run('build/fork/audit-browser-assets.js', ['--chrome', CHROME, '--url', assetsPageUrl]);
    await run('build/fork/check-frontend-policy.js', ['--base-url', baseUrl]);
} finally {
    await new Promise((resolveClosed, reject) => {
        server.close((error) => (error ? reject(error) : resolveClosed()));
    });
}

async function run(script, args) {
    await execa(process.execPath, [script, ...args], {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
    });
}

async function serveProjectFile(request, response) {
    try {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            respond(response, 405, 'Method Not Allowed\n', 'text/plain; charset=utf-8');
            return;
        }

        const url = new URL(request.url || '/', 'http://127.0.0.1');
        const requestedPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
        let file = resolve(PROJECT_ROOT, requestedPath || 'tests/fork-mobile-seo.html');
        if (file !== PROJECT_ROOT && !file.startsWith(`${PROJECT_ROOT}${sep}`)) {
            respond(response, 403, 'Forbidden\n', 'text/plain; charset=utf-8');
            return;
        }

        const fileStat = await stat(file);
        if (fileStat.isDirectory()) {
            file = resolve(file, 'index.html');
        } else if (!fileStat.isFile()) {
            respond(response, 404, 'Not Found\n', 'text/plain; charset=utf-8');
            return;
        }

        const body = await readFile(file);
        response.writeHead(200, {
            'Cache-Control': 'no-store',
            'Content-Length': body.byteLength,
            'Content-Type': contentType(file),
        });
        response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
        if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
            respond(response, 404, 'Not Found\n', 'text/plain; charset=utf-8');
            return;
        }
        respond(response, 500, 'Internal Server Error\n', 'text/plain; charset=utf-8');
    }
}

function respond(response, status, body, type) {
    response.writeHead(status, {
        'Cache-Control': 'no-store',
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': type,
    });
    response.end(body);
}

function contentType(file) {
    return (
        {
            '.css': 'text/css; charset=utf-8',
            '.gif': 'image/gif',
            '.html': 'text/html; charset=utf-8',
            '.jpeg': 'image/jpeg',
            '.jpg': 'image/jpeg',
            '.js': 'text/javascript; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
        }[extname(file).toLowerCase()] || 'application/octet-stream'
    );
}
