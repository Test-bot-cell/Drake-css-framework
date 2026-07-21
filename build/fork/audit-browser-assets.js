import { transform } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const AUDIT_SOURCE = resolve(PROJECT_ROOT, 'tests/js/browser-assets-audit.ts');
const options = parseArguments(process.argv.slice(2));

if (!options.url) {
    throw new Error('--url is required.');
}

const output = resolve(PROJECT_ROOT, options.output || 'reports/fork/browser-assets-audit.json');
const userDataDirectory = await mkdtemp(resolve(tmpdir(), 'uikit-ts-assets-chrome-'));
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
                    mobile: true,
                    screenHeight: options.height,
                    screenWidth: options.width,
                    width: options.width,
                },
                sessionId,
            ),
        ]);
        await cdp.send(
            'Page.addScriptToEvaluateOnNewDocument',
            { source: await compileAuditBootstrap() },
            sessionId,
        );
        await cdp.send('Page.navigate', { url: options.url }, sessionId);
        await waitForDocumentComplete(cdp, sessionId);

        const measurement = await evaluate(cdp, sessionId, 'window.__forkAssetsAudit.run()');
        const assertions = createAssertions(measurement);
        const report = {
            schemaVersion: 1,
            source: 'Chrome headless browser asset and animation audit',
            page: new URL(options.url).pathname,
            passed: assertions.every(({ passed }) => passed),
            assertions,
            evidence: measurement,
        };

        await mkdir(dirname(output), { recursive: true });
        await writeFile(output, `${JSON.stringify(report, null, 4)}\n`, 'utf8');

        if (!report.passed) {
            const failed = assertions.filter(({ passed }) => !passed).map(({ id }) => id);
            throw new Error(
                `Browser asset audit failed: ${failed.join(', ')}. Report: ${relativeProjectPath(output)}`,
            );
        }

        console.log(`Browser asset audit passed: ${relativeProjectPath(output)}`);
    } finally {
        cdp.close();
    }
} finally {
    await cleanupChrome(chrome, userDataDirectory);
}

function createAssertions(measurement) {
    const {
        accessibility,
        aliases,
        animation,
        bindings,
        direction,
        dom,
        fonts,
        icons,
        runtimeFailures,
    } = measurement;

    return [
        assertion(
            'viewport.mobile-320',
            measurement.viewport.width === 320,
            320,
            measurement.viewport.width,
        ),
        assertion('fonts.status', fonts.status === 'loaded', 'loaded', fonts.status),
        assertion(
            'fonts.roman-loaded-applied',
            fonts.roman.available &&
                fonts.roman.allFacesLoaded &&
                fonts.roman.family.includes('InterVariable') &&
                fonts.roman.style === 'normal',
            'available loaded InterVariable normal face',
            fonts.roman,
        ),
        assertion(
            'fonts.italic-loaded-applied',
            fonts.italic.available &&
                fonts.italic.allFacesLoaded &&
                fonts.italic.family.includes('InterVariable') &&
                fonts.italic.style === 'italic',
            'available loaded InterVariable italic face',
            fonts.italic,
        ),
        assertion('icons.runtime-ready', icons.runtimeReady, true, icons.runtimeReady),
        assertion(
            'icons.tabler-catalogue-mask',
            icons.tablerCatalogue.hasDataMask &&
                icons.tablerCatalogue.classes.includes('uk-ti-brand-tabler'),
            'uk-ti-brand-tabler with a CSS data mask',
            icons.tablerCatalogue,
        ),
        assertion(
            'icons.apple-alias-brand-exact',
            aliases.appleEqualsBrandApple && aliases.appleDiffersFromFruit,
            'legacy apple mask equals brand-apple and differs from apple fruit',
            aliases,
        ),
        assertion('icons.no-svg-dom', dom.svgCount === 0, 0, dom.svgCount),
        assertion(
            'icons.close-target',
            icons.close.width >= 24 && icons.close.height >= 24,
            'width and height >= 24px',
            { height: icons.close.height, width: icons.close.width },
        ),
        assertion(
            'icons.close-glyph-size',
            icons.close.maskSize === '14px 14px',
            '14px 14px',
            icons.close.maskSize,
        ),
        assertion(
            'icons.decorative-hidden',
            accessibility.decorativeAriaHidden === 'true',
            'true',
            accessibility.decorativeAriaHidden,
        ),
        assertion(
            'icons.spinner-accessible-mask',
            accessibility.spinnerRole === 'status' &&
                accessibility.spinnerAriaLabel === 'Chargement' &&
                icons.spinner.hasDataMask,
            'role=status, label=Chargement, CSS data mask',
            { ...accessibility, mask: icons.spinner },
        ),
        assertion(
            'icons.rtl-next-inverted',
            direction.rtlNextDirection === 'rtl' &&
                direction.rtlNextMatchesLtrPrevious &&
                direction.rtlNextDiffersFromLtrNext,
            'RTL next equals LTR previous and differs from LTR next',
            direction,
        ),
        assertion(
            'layout.no-horizontal-overflow',
            !dom.horizontalOverflow && dom.scrollWidth <= dom.clientWidth,
            'scrollWidth <= clientWidth',
            { clientWidth: dom.clientWidth, scrollWidth: dom.scrollWidth },
        ),
        assertion('runtime.no-page-failures', runtimeFailures.length === 0, [], runtimeFailures),
        assertion('runtime.null-typed-prop', bindings.nullTypedProp, true, bindings.nullTypedProp),
        assertion(
            'runtime.array-event-targets',
            bindings.arrayEventTargets,
            true,
            bindings.arrayEventTargets,
        ),
        assertion(
            'animation.after-filter',
            animation.afterFilterFired,
            true,
            animation.afterFilterFired,
        ),
        assertion(
            'animation.final-state',
            animation.finalStateSettled &&
                animation.visibleCoolItems === 2 &&
                animation.hiddenWarmItems === 2,
            '2 visible cool items, 2 hidden warm items, settled',
            animation,
        ),
        assertion(
            'animation.cleanup',
            animation.residualDatasetTransition === null &&
                animation.residualVisibleInlineStyles === 0 &&
                animation.residualTransitionClasses.length === 0,
            'no transition dataset/classes or visible-element animation styles',
            animation,
        ),
    ];
}

function assertion(id, passed, expected, actual) {
    return { id, passed, expected, actual };
}

function parseArguments(argv) {
    const result = { chrome: null, height: 640, output: null, url: null, width: 320 };
    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];
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

async function compileAuditBootstrap() {
    const source = await readFile(AUDIT_SOURCE, 'utf8');
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

async function waitForDocumentComplete(cdp, sessionId) {
    for (let attempt = 0; attempt < 100; attempt++) {
        const ready = await evaluate(cdp, sessionId, 'window.__forkAssetsAudit.ready()');
        if (ready) {
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
