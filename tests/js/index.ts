import tests from 'virtual:tests';
import { awaitFrame, awaitTimeout } from '../../src/js/util/await';
import { installFixtureActions } from './fixture-actions';

interface ThemeDefinition {
    css: string;
}

const STYLE_KEY = '_uikit_style';
const INVERSE_KEY = '_uikit_inverse';
const DIRECTION_KEY = '_uikit_dir';
const FALLBACK_THEME: ThemeDefinition = { css: '../dist/css/uikit.css' };
const storage = window.sessionStorage;
const requestedStyle = getParam('style');
const externalThemes = loadThemes('../themes.json');
const styles: Record<string, ThemeDefinition> = {
    core: { css: '../dist/css/uikit-core.css' },
    theme: FALLBACK_THEME,
    ...externalThemes,
};

if (requestedStyle?.endsWith('.css')) {
    styles.custom = { css: requestedStyle };
} else if (requestedStyle?.endsWith('.json')) {
    Object.assign(styles, loadThemes(requestedStyle));
}

const component = (location.pathname.split('/').pop() ?? '').replace(/\.html$/, '');
const variations = new Map([
    ['', 'Default'],
    ['light', 'Dark'],
    ['dark', 'Light'],
]);

if (!storage.getItem(STYLE_KEY)) {
    storage.setItem(STYLE_KEY, 'core');
}
if (!storage.getItem(INVERSE_KEY)) {
    storage.setItem(INVERSE_KEY, '');
}

const direction = storage.getItem(DIRECTION_KEY) === 'rtl' ? 'rtl' : 'ltr';
const selectedStyle = styles[storage.getItem(STYLE_KEY) ?? ''] ?? FALLBACK_THEME;

document.dir = direction;
appendStylesheet('../dist/css/uikit-inter.css');
appendStylesheet(
    direction === 'rtl' ? selectedStyle.css.replace(/\.css$/, '-rtl.css') : selectedStyle.css,
);
appendStylesheet('../dist/css/uikit-tabler-icons.css');

const testPageStyle = document.createElement('style');
testPageStyle.textContent =
    'html:not(:has(body :first-child [aria-label="Component switcher"])) { padding-top: 80px; }';
document.head.append(testPageStyle);

const runtime = document.createElement('script');
runtime.src = '../dist/js/uikit.js';
runtime.async = false;
const runtimeReady = new Promise<void>((resolve, reject) => {
    runtime.addEventListener('load', () => resolve(), { once: true });
    runtime.addEventListener(
        'error',
        () => reject(new Error(`Unable to load the UIkit fixture runtime: ${runtime.src}`)),
        { once: true },
    );
});
document.head.append(runtime);
const fixtureActionsReady = Promise.all([runtimeReady, whenDocumentReady()]).then(() => {
    installFixtureActions();
});

window.addEventListener('load', async () => {
    await fixtureActionsReady;
    await awaitTimeout(100);
    await awaitFrame();

    const container = document.createElement('div');
    container.className = 'uk-container';

    const testSelect = createSelect('Component switcher', [
        ['index.html', 'Overview'],
        ...tests.map((name): [string, string] => [
            `${name}.html`,
            name.split('-').map(upperFirst).join(' '),
        ]),
    ]);
    const styleSelect = createSelect(
        'Theme switcher',
        Object.keys(styles).map((name): [string, string] => [name, upperFirst(name)]),
    );
    const inverseSelect = createSelect('Inverse switcher', [...variations.entries()]);
    const rtlLabel = document.createElement('label');
    const rtlCheckbox = document.createElement('input');
    const rtlText = document.createElement('span');

    rtlCheckbox.type = 'checkbox';
    rtlCheckbox.className = 'uk-checkbox';
    rtlCheckbox.checked = direction === 'rtl';
    rtlText.textContent = 'RTL';
    rtlText.style.margin = '5px';
    rtlLabel.style.margin = '20px';
    rtlLabel.append(rtlCheckbox, rtlText);
    container.append(testSelect, styleSelect, inverseSelect, rtlLabel);
    document.body.prepend(container);

    testSelect.addEventListener('change', () => {
        if (!testSelect.value) {
            return;
        }

        const query = requestedStyle ? `?style=${encodeURIComponent(requestedStyle)}` : '';
        location.href = `${testSelect.value}${query}`;
    });
    testSelect.value = `${component || 'index'}.html`;

    styleSelect.addEventListener('change', () => {
        storage.setItem(STYLE_KEY, styleSelect.value);
        location.reload();
    });
    styleSelect.value = storage.getItem(STYLE_KEY) ?? 'core';

    inverseSelect.value = storage.getItem(INVERSE_KEY) ?? '';
    applyInverse(inverseSelect.value);
    inverseSelect.addEventListener('change', () => {
        storage.setItem(INVERSE_KEY, inverseSelect.value);
        location.reload();
    });

    rtlCheckbox.addEventListener('change', () => {
        storage.setItem(DIRECTION_KEY, rtlCheckbox.checked ? 'rtl' : 'ltr');
        location.reload();
    });
});

function appendStylesheet(href: string): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
}

function whenDocumentReady(): Promise<void> {
    if (document.readyState !== 'loading') {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
    });
}

function createSelect(
    label: string,
    options: ReadonlyArray<readonly [string, string]>,
): HTMLSelectElement {
    const select = document.createElement('select');
    select.className = 'uk-select uk-form-width-small';
    select.ariaLabel = label;
    select.style.margin = '20px';

    for (const [value, text] of options) {
        select.add(new Option(text, value));
    }

    return select;
}

function loadThemes(url: string): Record<string, ThemeDefinition> {
    const request = new XMLHttpRequest();
    request.open('GET', url, false);

    try {
        request.send(null);
    } catch {
        return {};
    }

    if (request.status !== 200) {
        return {};
    }

    let value: unknown;
    try {
        value = JSON.parse(request.responseText);
    } catch {
        return {};
    }

    if (!isRecord(value)) {
        return {};
    }

    const themes: Record<string, ThemeDefinition> = {};
    for (const [name, definition] of Object.entries(value)) {
        if (isRecord(definition) && typeof definition.css === 'string') {
            themes[name] = { css: definition.css };
        }
    }
    return themes;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function applyInverse(inverse: string): void {
    if (!inverse) {
        return;
    }

    const inverseClasses = [
        'uk-card-default',
        'uk-card-muted',
        'uk-card-primary',
        'uk-card-secondary',
        'uk-card-overlay',
        'uk-tile-default',
        'uk-tile-muted',
        'uk-tile-primary',
        'uk-tile-secondary',
        'uk-section-default',
        'uk-section-muted',
        'uk-section-primary',
        'uk-section-secondary',
        'uk-overlay-default',
        'uk-overlay-primary',
    ];

    for (const element of document.querySelectorAll<HTMLElement>('*')) {
        element.classList.remove(...inverseClasses);
    }
    for (const navbar of document.querySelectorAll<HTMLElement>('.uk-navbar-container')) {
        navbar.classList.add('uk-navbar-transparent');
    }

    document.documentElement.style.background = inverse === 'dark' ? '#fff' : '#222';
    document.body.classList.add(`uk-${inverse}`);
}

function getParam(name: string): string | null {
    return new URLSearchParams(window.location.search).get(name);
}

function upperFirst(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
