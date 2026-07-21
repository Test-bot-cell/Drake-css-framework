import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_ALLOWLIST = 'tests/fixtures/frontend-policy-allowlist.json';
const DEFAULT_EXPECTATIONS = 'tests/fixtures/fork-mobile-seo.expected.json';
const DEFAULT_METRICS = 'tests/fixtures/fork-mobile-seo.metrics.json';
const DEFAULT_DESKTOP_METRICS = 'tests/fixtures/fork-mobile-seo.desktop.metrics.json';
const DEFAULT_REPORT = 'reports/fork/frontend-policy-audit.json';
const options = parseArguments(process.argv.slice(2));

if (options.help) {
    printHelp();
    process.exit(0);
}

const allowlistFile = resolveProjectPath(options.allowlist || DEFAULT_ALLOWLIST);
const expectationsFile = resolveProjectPath(options.expectations || DEFAULT_EXPECTATIONS);
const metricsFile = resolveProjectPath(options.metrics || DEFAULT_METRICS);
const desktopMetricsFile = resolveProjectPath(options.desktopMetrics || DEFAULT_DESKTOP_METRICS);
const reportFile = resolveProjectPath(options.report || DEFAULT_REPORT);

try {
    const [allowlist, expectations] = await Promise.all([
        readJson(allowlistFile),
        readJson(expectationsFile),
    ]);
    const browserJavaScript = await auditBrowserJavaScript();
    const legacyIcons = await auditLegacyIconRegistries();
    const mediaQueries = await auditMediaQueries(allowlist);
    const html = await auditHtmlFixture(expectations, options.baseUrl);
    const performance = await auditPerformance(expectations, metricsFile, desktopMetricsFile);

    const gates = {
        G10: createGate('Sources frontend et registres d’icônes', [
            ...browserJavaScript.errors,
            ...legacyIcons.errors,
        ]),
        G11: createGate('HTML-first et SEO technique', html.errors),
        G12: createGate('CSS mobile-first', mediaQueries.errors),
        G13: createGate('Budgets de performance', performance.errors, performance.pending),
    };
    const status = Object.values(gates).every(({ status }) => status === 'pass') ? 'pass' : 'fail';
    const report = {
        schemaVersion: 1,
        policy: 'D-011 / G10-G13',
        status,
        gates,
        evidence: {
            browserJavaScript,
            legacyIcons,
            mediaQueries,
            html,
            performance,
        },
    };

    await mkdir(dirname(reportFile), { recursive: true });
    await writeFile(reportFile, `${JSON.stringify(report, null, 4)}\n`, 'utf8');

    console.log(
        `Frontend policy audit ${status}: ` +
            Object.entries(gates)
                .map(([gate, result]) => `${gate}=${result.status}`)
                .join(', '),
    );
    console.log(`Report: ${toProjectPath(reportFile)}`);

    if (status !== 'pass' && !options.reportOnly) {
        process.exitCode = 1;
    }
} catch (error) {
    console.error(`Frontend policy audit failed: ${error.message}`);
    process.exitCode = 1;
}

function parseArguments(argv) {
    const result = {
        allowlist: null,
        baseUrl: null,
        desktopMetrics: null,
        expectations: null,
        help: false,
        metrics: null,
        report: null,
        reportOnly: false,
    };

    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];
        if (argument === '-h' || argument === '--help') {
            result.help = true;
            continue;
        }
        if (argument === '--report-only') {
            result.reportOnly = true;
            continue;
        }

        const [name, inlineValue] = argument.split('=', 2);
        if (
            ![
                '--allowlist',
                '--base-url',
                '--desktop-metrics',
                '--expectations',
                '--metrics',
                '--report',
            ].includes(name)
        ) {
            throw new Error(`Unknown argument: ${argument}`);
        }
        const value = inlineValue ?? argv[++index];
        if (!value || value.startsWith('--')) {
            throw new Error(`Missing value for ${name}`);
        }
        result[toCamelCase(name.slice(2))] = value;
    }

    return result;
}

function printHelp() {
    console.log(`
Audit the fork frontend policy and write deterministic G10-G13 evidence.

Usage:
  node build/fork/check-frontend-policy.js [options]

Options:
  --allowlist <path>     Explicit max-width media-query allowlist
  --expectations <path>  HTML/SEO expectations fixture
  --metrics <path>       Mobile browser metrics fixture
  --desktop-metrics <path> Desktop browser metrics fixture
  --base-url <url>       Running site root used to verify HTTP statuses
  --report <path>        JSON report output
  --report-only          Write evidence without returning a failing exit code
  -h, --help             Show this help
`);
}

async function auditBrowserJavaScript() {
    const files = (
        await Promise.all(
            ['src', 'tests'].map(async (root) =>
                (await walk(resolve(PROJECT_ROOT, root))).filter((file) =>
                    ['.cjs', '.js', '.mjs'].includes(extname(file)),
                ),
            ),
        )
    )
        .flat()
        .map(toProjectPath)
        .sort();
    const htmlFiles = (
        await Promise.all(['src', 'tests'].map((root) => walk(resolve(PROJECT_ROOT, root))))
    )
        .flat()
        .filter((file) => extname(file) === '.html')
        .sort();
    const htmlViolations = [];

    for (const file of htmlFiles) {
        const html = await readFile(file, 'utf8');
        const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
        let scriptMatch;
        while ((scriptMatch = scriptPattern.exec(html))) {
            const attributes = readAttributes(`<script ${scriptMatch[1]}>`);
            if (attributes.type === 'application/ld+json') {
                continue;
            }

            if (attributes.src) {
                if (!isDistScriptReference(file, attributes.src)) {
                    htmlViolations.push({
                        file: toProjectPath(file),
                        line: lineAt(html, scriptMatch.index),
                        kind: 'script-outside-dist',
                        value: attributes.src,
                    });
                }
            } else if (scriptMatch[2].trim()) {
                htmlViolations.push({
                    file: toProjectPath(file),
                    line: lineAt(html, scriptMatch.index),
                    kind: 'inline-script',
                });
            }
        }

        const tagPattern = /<[a-z][^>]*>/gi;
        let tagMatch;
        while ((tagMatch = tagPattern.exec(html))) {
            const attributes = readAttributes(tagMatch[0]);
            for (const name of Object.keys(attributes).filter((name) => /^on[a-z]+$/.test(name))) {
                htmlViolations.push({
                    file: toProjectPath(file),
                    line: lineAt(html, tagMatch.index),
                    kind: 'inline-event-handler',
                    value: name,
                });
            }
        }
    }

    htmlViolations.sort((left, right) =>
        `${left.file}:${left.line}:${left.kind}`.localeCompare(
            `${right.file}:${right.line}:${right.kind}`,
            'en',
        ),
    );
    const errors = [];
    if (files.length) {
        errors.push(`JavaScript navigateur trouvé hors de dist/: ${files.length} fichier(s).`);
    }
    if (htmlViolations.length) {
        errors.push(
            `Script inline, handler on* ou bundle hors dist/ trouvé dans le HTML: ${htmlViolations.length}.`,
        );
    }

    return {
        status: errors.length ? 'fail' : 'pass',
        files,
        htmlViolations,
        errors,
    };
}

async function auditLegacyIconRegistries() {
    const roots = ['build', 'custom', 'dist', 'src', 'tests'];
    const files = (
        await Promise.all(roots.map((root) => walk(resolve(PROJECT_ROOT, root))))
    ).flat();
    const prohibitedFiles = files
        .filter((file) => {
            const path = toProjectPath(file);
            return (
                /(?:^|\/)uikit-icons(?:-[^/]+)?(?:\.min)?\.(?:js|ts)$/.test(path) ||
                /^src\/images\/(?:backgrounds|components|icons)\/.*\.svg$/.test(path) ||
                path === 'tests/images/icons.svg'
            );
        })
        .map(toProjectPath)
        .sort();
    const signatures = [
        { id: 'uikit-icons-bundle', pattern: /uikit-icons(?:-[\w-]+)?\.js/ },
        { id: 'virtual-icons-registry', pattern: /['"]virtual:icons['"]/ },
        { id: 'runtime-icon-registry', pattern: /\bUIkit\.icon\.add\b/ },
    ];
    const registryMatches = [];

    for (const file of files.sort()) {
        const extension = extname(file);
        if (!['.cjs', '.js', '.mjs', '.ts'].includes(extension)) {
            continue;
        }
        if (resolve(file) === resolve(fileURLToPath(import.meta.url))) {
            continue;
        }

        const source = await readFile(file, 'utf8');
        for (const signature of signatures) {
            if (signature.pattern.test(source)) {
                registryMatches.push({ file: toProjectPath(file), signature: signature.id });
            }
        }
    }

    registryMatches.sort((left, right) =>
        `${left.file}:${left.signature}`.localeCompare(`${right.file}:${right.signature}`, 'en'),
    );
    const errors = [];
    if (prohibitedFiles.length) {
        errors.push(
            `Catalogue d’icônes Drake hérité trouvé: ${prohibitedFiles.length} fichier(s).`,
        );
    }
    if (registryMatches.length) {
        errors.push(`Signature de registre SVG JavaScript trouvée: ${registryMatches.length}.`);
    }

    return {
        status: errors.length ? 'fail' : 'pass',
        prohibitedFiles,
        registryMatches,
        errors,
    };
}

async function auditMediaQueries(allowlist) {
    validateAllowlist(allowlist);
    const allowlistByKey = new Map(
        allowlist.maxWidthQueries.map((entry) => [mediaKey(entry.file, entry.condition), entry]),
    );
    const usedAllowlist = new Set();
    const allowed = [];
    const violations = [];
    const lessFiles = (await walk(resolve(PROJECT_ROOT, 'src/less')))
        .filter((file) => extname(file) === '.less')
        .sort();
    let scanned = 0;

    for (const file of lessFiles) {
        const source = await readFile(file, 'utf8');
        for (const query of readMediaQueries(source)) {
            scanned++;
            if (!/\bmax-width\s*:/.test(query.condition)) {
                continue;
            }

            const path = toProjectPath(file);
            const key = mediaKey(path, query.condition);
            const exception = allowlistByKey.get(key);
            const evidence = { file: path, condition: query.condition, line: query.line };

            if (exception) {
                usedAllowlist.add(key);
                allowed.push({
                    ...evidence,
                    category: exception.category,
                    reason: exception.reason,
                });
            } else {
                violations.push(evidence);
            }
        }
    }

    const staleAllowlist = [...allowlistByKey]
        .filter(([key]) => !usedAllowlist.has(key))
        .map(([, entry]) => entry)
        .sort(compareMediaEntries);
    const legacyLayoutDebt = allowed.filter(
        ({ category }) => category === 'protected-legacy-layout',
    );
    allowed.sort(compareMediaEntries);
    violations.sort(compareMediaEntries);
    const errors = [];
    if (violations.length) {
        errors.push(`Media query max-width non autorisée: ${violations.length}.`);
    }
    if (staleAllowlist.length) {
        errors.push(`Entrée d’allowlist inutilisée: ${staleAllowlist.length}.`);
    }
    if (legacyLayoutDebt.length) {
        errors.push(
            `Exception desktop-first protégée restant à migrer: ${legacyLayoutDebt.length}.`,
        );
    }

    return {
        status: errors.length ? 'fail' : 'pass',
        scanned,
        maxWidthAllowed: allowed,
        maxWidthViolations: violations,
        legacyLayoutDebt,
        staleAllowlist,
        errors,
    };
}

async function auditHtmlFixture(expectations, baseUrl) {
    validateExpectations(expectations);
    const file = resolveProjectPath(expectations.page.file);
    const html = await readFile(file, 'utf8');
    const errors = [];
    const title = readElementText(html, 'title');
    const description = readNamedMeta(html, 'description');
    const robots = readNamedMeta(html, 'robots');
    const canonical = readCanonical(html);
    const htmlTag = readTags(html, 'html')[0];

    assert(errors, /^\s*<!doctype html>/i.test(html), 'Doctype HTML manquant.');
    assert(
        errors,
        htmlTag?.attributes.lang === expectations.page.language,
        'Langue HTML incorrecte.',
    );
    assert(errors, title === expectations.page.title, 'Title différent de la fixture.');
    assert(errors, description === expectations.page.description, 'Meta description incorrecte.');
    assert(errors, robots === expectations.page.robots, 'Directive robots incorrecte.');
    assert(errors, canonical === expectations.page.canonical, 'Canonical incorrect.');
    assert(
        errors,
        readNamedMeta(html, 'viewport') === 'width=device-width, initial-scale=1',
        'Viewport mobile manquant ou incorrect.',
    );
    assert(
        errors,
        readTags(html, 'main').length === 1,
        'Le document doit contenir un main unique.',
    );
    assert(errors, readTags(html, 'nav').length >= 1, 'Navigation HTML manquante.');
    assert(
        errors,
        readTags(html, 'details').length >= 1 && readTags(html, 'summary').length >= 1,
        'Repli interactif HTML natif manquant.',
    );

    const links = readTags(html, 'a');
    const invalidLinks = links
        .map(({ attributes }) => attributes.href)
        .filter((href) => !href || /^javascript:/i.test(href));
    assert(errors, links.length > 0 && invalidLinks.length === 0, 'Lien sans href réel détecté.');

    const images = readTags(html, 'img');
    const invalidImages = images.filter(({ attributes }) => {
        return (
            !Object.hasOwn(attributes, 'alt') ||
            !/^\d+$/.test(attributes.width || '') ||
            !/^\d+$/.test(attributes.height || '')
        );
    });
    assert(
        errors,
        images.length > 0 && invalidImages.length === 0,
        'Image non dimensionnée ou sans alt.',
    );

    const headings = readHeadings(html);
    assert(
        errors,
        headings.filter(({ level }) => level === 1).length === 1,
        'Un h1 unique est requis.',
    );
    assert(errors, !hasHeadingLevelJump(headings), 'Saut de niveau de titre détecté.');

    const scripts = readScriptBlocks(html);
    const executableScripts = scripts.filter(
        ({ attributes }) => attributes.type !== 'application/ld+json',
    );
    assert(errors, executableScripts.length === 0, 'La fixture HTML-first charge du JavaScript.');
    const structuredData = scripts.filter(
        ({ attributes }) => attributes.type === 'application/ld+json',
    );
    assert(errors, structuredData.length === 1, 'Une donnée structurée JSON-LD est requise.');
    if (structuredData.length === 1) {
        try {
            const data = JSON.parse(structuredData[0].content);
            assert(
                errors,
                data['@context'] === 'https://schema.org',
                'Contexte JSON-LD incorrect.',
            );
            assert(errors, data.url === canonical, 'URL JSON-LD différente du canonical.');
        } catch {
            errors.push('JSON-LD invalide.');
        }
    }

    const stylesheets = readTags(html, 'link')
        .filter(({ attributes }) => attributes.rel === 'stylesheet')
        .map(({ attributes }) => attributes.href);
    for (const required of ['../dist/css/drake-inter.css', '../dist/css/drake.css']) {
        assert(
            errors,
            stylesheets.includes(required),
            `Feuille de style requise absente: ${required}.`,
        );
    }
    assert(
        errors,
        !stylesheets.includes('../dist/css/drake-tabler-icons.css'),
        'Le catalogue Tabler complet doit rester opt-in sur la fixture de performance.',
    );

    const inlineMaxWidthQueries = readStyleBlocks(html)
        .flatMap(readMediaQueries)
        .filter(({ condition }) => /\bmax-width\s*:/.test(condition));
    assert(
        errors,
        inlineMaxWidthQueries.length === 0,
        'La fixture contient une media query de mise en page max-width.',
    );
    assert(
        errors,
        expectations.viewports.some(({ width }) => width === 320),
        'Le viewport de preuve 320 px n’est pas déclaré.',
    );

    const http = await auditHttp(expectations, baseUrl);
    errors.push(...http.errors);

    return {
        status: errors.length ? 'fail' : 'pass',
        file: toProjectPath(file),
        metadata: { canonical, description, robots, title },
        counts: {
            anchors: links.length,
            headings: headings.length,
            images: images.length,
            structuredData: structuredData.length,
        },
        inlineMaxWidthQueries,
        http,
        errors,
    };
}

async function auditHttp(expectations, baseUrl) {
    if (!baseUrl) {
        return {
            status: 'not-run',
            checks: [],
            errors: ['Preuve HTTP non exécutée: fournir --base-url.'],
        };
    }

    const checks = [];
    const errors = [];
    for (const expectation of [expectations.page, expectations.missingRoute]) {
        const url = new URL(expectation.route, ensureTrailingSlash(baseUrl));
        try {
            const response = await fetch(url, { redirect: 'manual' });
            checks.push({
                route: expectation.route,
                expected: expectation.status,
                actual: response.status,
            });
            if (response.status !== expectation.status) {
                errors.push(
                    `Statut HTTP ${response.status} pour ${expectation.route}; ${expectation.status} attendu.`,
                );
            }
        } catch (error) {
            errors.push(`Requête HTTP impossible pour ${expectation.route}: ${error.message}`);
        }
    }

    return { status: errors.length ? 'fail' : 'pass', checks, errors };
}

async function auditPerformance(expectations, metricsFile, desktopMetricsFile) {
    const budgets = expectations.performanceBudgets;
    const errors = [];
    const pending = [];
    validateBudgets(budgets, errors);

    const desktopWidth = Math.max(...expectations.viewports.map(({ width }) => width));
    const profiles = [
        {
            file: metricsFile,
            label: 'mobile',
            metrics: await readJson(metricsFile, { optional: true }),
            width: 320,
        },
        {
            file: desktopMetricsFile,
            label: 'desktop',
            metrics: await readJson(desktopMetricsFile, { optional: true }),
            width: desktopWidth,
        },
    ];

    for (const profile of profiles) {
        if (!profile.metrics) {
            pending.push(
                `Mesures navigateur ${profile.label} absentes: ${toProjectPath(profile.file)}.`,
            );
            continue;
        }
        validatePerformanceProfile(errors, profile, expectations.page.route, budgets);
    }

    const [mobile, desktop] = profiles.map(({ metrics }) => metrics);
    if (
        mobile &&
        desktop &&
        (mobile.content?.signature !== desktop.content?.signature ||
            mobile.content?.headings !== desktop.content?.headings ||
            mobile.content?.links !== desktop.content?.links)
    ) {
        errors.push('Le contenu rendu diffère entre les profils mobile et bureau.');
    }

    return {
        status: errors.length ? 'fail' : pending.length ? 'pending' : 'pass',
        budgets,
        profiles: Object.fromEntries(profiles.map(({ label, metrics }) => [label, metrics])),
        errors,
        pending,
    };
}

function validatePerformanceProfile(errors, profile, route, budgets) {
    const { label, metrics, width } = profile;
    for (const name of ['lcpMs', 'cls', 'labTbtMs']) {
        if (typeof metrics[name] !== 'number' || metrics[name] < 0) {
            errors.push(`Mesure ${label} invalide: ${name}.`);
        }
    }
    if (typeof metrics.inpMs !== 'number' && metrics.inpMs !== null) {
        errors.push(
            `La mesure ${label} inpMs doit être un nombre ou null pour un audit laboratoire.`,
        );
    }
    if (metrics.viewport?.width !== width) {
        errors.push(`Le profil ${label} doit être mesuré à ${width} px.`);
    }
    if (metrics.deviceProfile !== label) {
        errors.push(
            `Le profil ${label} utilise une émulation ${metrics.deviceProfile || 'inconnue'}.`,
        );
    }
    if (metrics.page !== route) {
        errors.push(`Le profil ${label} ne mesure pas la route de référence.`);
    }
    if (metrics.reflow?.passes !== true) {
        errors.push(`Le profil ${label} échoue le contrôle de reflow.`);
    }
    if (
        metrics.table?.headerVisible !== true ||
        (label === 'mobile' &&
            (metrics.table.display !== 'block' || metrics.table.overflowX !== 'auto')) ||
        (label === 'desktop' && metrics.table.display !== 'table')
    ) {
        errors.push(`Le tableau mobile-first du profil ${label} est invalide.`);
    }
    if (
        typeof metrics.actionTarget?.width !== 'number' ||
        typeof metrics.actionTarget?.height !== 'number' ||
        metrics.actionTarget.width < 24 ||
        metrics.actionTarget.height < 24
    ) {
        errors.push(`Le profil ${label} contient une cible interactive inférieure à 24 px.`);
    }
    if (
        metrics.fonts?.status !== 'loaded' ||
        metrics.fonts?.roman !== true ||
        metrics.fonts?.italic !== true ||
        !metrics.fonts?.bodyFamily?.includes('InterVariable')
    ) {
        errors.push(`Les fontes du profil ${label} ne sont pas chargées.`);
    }
    if (
        typeof metrics.content?.signature !== 'string' ||
        metrics.content.signature.length !== 8 ||
        metrics.content.headings < 1 ||
        metrics.content.links < 1 ||
        metrics.content.hiddenPrimary !== 0
    ) {
        errors.push(`Le profil ${label} ne prouve pas la parité du contenu primaire.`);
    }
    for (const name of ['lcpMs', 'cls', 'labTbtMs']) {
        compareMetric(errors, metrics, budgets, name, label);
    }
    if (metrics.inpMs !== null) {
        compareMetric(errors, metrics, budgets, 'inpMs', label);
    }
}

function validateAllowlist(value) {
    if (value?.schemaVersion !== 1 || !Array.isArray(value.maxWidthQueries)) {
        throw new Error('Invalid frontend policy allowlist.');
    }

    const keys = new Set();
    for (const entry of value.maxWidthQueries) {
        if (
            typeof entry.file !== 'string' ||
            typeof entry.condition !== 'string' ||
            typeof entry.category !== 'string' ||
            typeof entry.reason !== 'string' ||
            entry.reason.length < 40
        ) {
            throw new Error(
                'Each max-width exception requires file, condition, category and reason.',
            );
        }
        const key = mediaKey(entry.file, entry.condition);
        if (keys.has(key)) {
            throw new Error(`Duplicate media-query exception: ${key}`);
        }
        keys.add(key);
    }
}

function validateExpectations(value) {
    if (
        value?.schemaVersion !== 1 ||
        typeof value.page?.file !== 'string' ||
        typeof value.page?.route !== 'string' ||
        typeof value.missingRoute?.route !== 'string' ||
        !Array.isArray(value.viewports) ||
        !value.performanceBudgets
    ) {
        throw new Error('Invalid mobile/SEO expectations fixture.');
    }
}

function validateBudgets(budgets, errors) {
    const expected = { cls: 0.1, inpMs: 200, lcpMs: 2500 };
    for (const [name, maximum] of Object.entries(expected)) {
        if (budgets[name] !== maximum) {
            errors.push(`Budget constitutionnel ${name} incorrect: ${budgets[name]}.`);
        }
    }
    if (typeof budgets.labTbtMs !== 'number' || budgets.labTbtMs <= 0) {
        errors.push('Budget laboratoire TBT manquant.');
    }
    if (budgets.percentile !== 75) {
        errors.push('Les budgets terrain doivent cibler le 75e percentile.');
    }
}

function compareMetric(errors, metrics, budgets, name, label) {
    if (typeof metrics[name] === 'number' && metrics[name] > budgets[name]) {
        errors.push(`${name} (${label}) dépasse le budget: ${metrics[name]} > ${budgets[name]}.`);
    }
}

function createGate(label, errors, pending = []) {
    return {
        label,
        status: errors.length || pending.length ? 'fail' : 'pass',
        errors,
        pending,
    };
}

function readMediaQueries(source) {
    const queries = [];
    const pattern = /@media\s*([^{]+)\{/g;
    let match;
    while ((match = pattern.exec(source))) {
        queries.push({
            condition: normalizeWhitespace(match[1]),
            line: source.slice(0, match.index).split('\n').length,
        });
    }
    return queries;
}

function isDistScriptReference(htmlFile, reference) {
    const cleanReference = reference.split(/[?#]/, 1)[0];
    if (
        !cleanReference ||
        /^(?:[a-z]+:)?\/\//i.test(cleanReference) ||
        cleanReference.startsWith('data:')
    ) {
        return false;
    }

    const absolute = cleanReference.startsWith('/')
        ? resolve(PROJECT_ROOT, cleanReference.slice(1))
        : resolve(dirname(htmlFile), cleanReference);
    const path = toProjectPath(absolute);
    return path === 'dist' || path.startsWith('dist/');
}

function lineAt(source, index) {
    return source.slice(0, index).split('\n').length;
}

function readTags(html, name) {
    const matches = html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];
    return matches.map((source) => ({ attributes: readAttributes(source), source }));
}

function readAttributes(tag) {
    const attributes = {};
    for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)) {
        attributes[match[1].toLowerCase()] = match[3];
    }
    return attributes;
}

function readNamedMeta(html, name) {
    return readTags(html, 'meta').find(({ attributes }) => attributes.name === name)?.attributes
        .content;
}

function readCanonical(html) {
    return readTags(html, 'link').find(({ attributes }) =>
        (attributes.rel || '').split(/\s+/).includes('canonical'),
    )?.attributes.href;
}

function readElementText(html, name) {
    const match = html.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
    return match ? normalizeWhitespace(stripTags(match[1])) : null;
}

function readHeadings(html) {
    return [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
        level: Number(match[1]),
        text: normalizeWhitespace(stripTags(match[2])),
    }));
}

function hasHeadingLevelJump(headings) {
    return headings.some(
        (heading, index) => index > 0 && heading.level > headings[index - 1].level + 1,
    );
}

function readScriptBlocks(html) {
    return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((match) => ({
        attributes: readAttributes(`<script ${match[1]}>`),
        content: match[2].trim(),
    }));
}

function readStyleBlocks(html) {
    return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
}

function stripTags(value) {
    return value.replace(/<[^>]+>/g, ' ');
}

function normalizeWhitespace(value) {
    return value.replace(/\s+/g, ' ').trim();
}

function mediaKey(file, condition) {
    return `${file}::${normalizeWhitespace(condition)}`;
}

function compareMediaEntries(left, right) {
    return `${left.file}:${left.condition}`.localeCompare(`${right.file}:${right.condition}`, 'en');
}

function assert(errors, condition, message) {
    if (!condition) {
        errors.push(message);
    }
}

async function readJson(file, { optional = false } = {}) {
    let source;
    try {
        source = await readFile(file, 'utf8');
    } catch (error) {
        if (optional && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }

    try {
        return JSON.parse(source);
    } catch (error) {
        throw new Error(`Invalid JSON in ${toProjectPath(file)}: ${error.message}`, {
            cause: error,
        });
    }
}

async function walk(directory) {
    let entries;
    try {
        entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }

    const files = [];
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))) {
        const file = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await walk(file)));
        } else if (entry.isFile()) {
            files.push(file);
        }
    }
    return files;
}

function resolveProjectPath(file) {
    return resolve(PROJECT_ROOT, file);
}

function toProjectPath(file) {
    return relative(PROJECT_ROOT, file).split(sep).join('/');
}

function ensureTrailingSlash(value) {
    return value.endsWith('/') ? value : `${value}/`;
}

function toCamelCase(value) {
    return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
