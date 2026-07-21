import { Buffer } from 'node:buffer';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const TABLER_VERSION = '3.45.0';
const INTER_VERSION = '4.1';
const EXPECTED_ICON_COUNT = 5112;
const EXPECTED_PUBLIC_ALIAS_COUNT = 162;
const EXPECTED_INTERNAL_ALIAS_COUNT = 22;
const EXPECTED_RTL_ALIAS_COUNT = 14;
const EXPECTED_CORE_TARGET_COUNT = 14;
const EXPECTED_COMPONENT_BUNDLES = [
    'countdown',
    'filter',
    'lightbox',
    'lightbox-panel',
    'notification',
    'parallax',
    'slider',
    'slider-parallax',
    'slideshow',
    'slideshow-parallax',
    'sortable',
    'tooltip',
    'upload',
];
const EXPECTED_TABLER_SOURCE_SHA256 =
    '02f2036fdca959639f74ac3827e283110b3232bb8f2dc5f4241f4b57d757afdc';
// Deliberately update this only after reviewing an intentional Tabler asset refresh.
const EXPECTED_TABLER_CSS_SHA256 =
    'df895a32fcd5f84c0a264293e742b11d456c88717ebc1b903e2cc944b6c4d948';
const EXPECTED_LICENSE_SHA256 = {
    inter: 'cdad1abdaae7825b20ffd96fc7b20c13c2209c45cbb3721c10e955fc268c9918',
    tabler: 'b740a1d46122672da62833e97f7e7c8a13fa85cbc7445b584b297cc00dde93db',
    drake: '1aad791f51d28f466734553711181c9f676877a1899a760ac07171718213cee2',
};
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const execFileAsync = promisify(execFile);
const DEFAULT_MAPPING = join(PROJECT_ROOT, 'src/icons/drake-tabler.json');
const DEFAULT_CORE_LESS = join(PROJECT_ROOT, 'src/styles/tabler.ts');
const EXPECTED_INTER_FACES = {
    normal: {
        sha256: '693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3',
        size: 352240,
    },
    italic: {
        sha256: 'e564f652916db6c139570fefb9524a77c4d48f30c92928de9db19b6b5c7a262a',
        size: 387976,
    },
};

// Variante fichiers (D-022) : seuls ces quatre WOFF2 subsettés sont autorisés dans la
// distribution, épinglés par empreinte. À re-épingler après toute mise à jour d'Inter
// ou de subset-font (changement sensible).
const EXPECTED_INTER_FONT_FILES = {
    'InterVariable-latin.woff2': {
        sha256: 'a46c4efe99af9e94ea5bb51114f62b4dd4c56c2d3f91522c622b3823418817d5',
        size: 105148,
    },
    'InterVariable-latin-ext.woff2': {
        sha256: 'c4425342c8811347d149d5b79c85281abe562bf9a023e03fc6208f614d92964a',
        size: 135588,
    },
    'InterVariable-Italic-latin.woff2': {
        sha256: '3a4a80645d1ca99f9582ffd373ae0beeb41042348d92543bcf7f8f35b774c7fc',
        size: 115968,
    },
    'InterVariable-Italic-latin-ext.woff2': {
        sha256: '8e65a663d4362ae38b227aecd94d0070395327fdf4df0485b55846f678c06f68',
        size: 148544,
    },
};

const options = parseArguments(process.argv.slice(2));

if (options.help) {
    printHelp();
    process.exit(0);
}

try {
    const dist = resolve(options.dist || join(PROJECT_ROOT, 'dist'));
    const iconsFile = resolve(options.iconsCss || join(dist, 'css/drake-tabler-icons.css'));
    const interFile = resolve(options.interCss || join(dist, 'css/drake-inter.css'));
    const coreLessFile = resolve(options.coreLess || DEFAULT_CORE_LESS);
    const mapping = await loadCompatibilityMapping(resolve(options.mapping || DEFAULT_MAPPING));

    await validatePackageVersion();
    await validateLegalFiles();
    const nativeIcons = await validateTablerCss(iconsFile, mapping);
    await validateCoreLess(coreLessFile, mapping, nativeIcons);
    await validateStyleSources();
    await validateInterCss(interFile);
    await validateInterFilesCss(
        resolve(join(dist, 'css/drake-inter-files.css')),
        resolve(join(dist, 'fonts')),
    );
    await validateDistFiles(dist);
    await validateBuiltCoreCss(dist);
    await validateDistManifest();
    await validatePackageContents();

    console.log(
        `Asset checks passed: ${EXPECTED_ICON_COUNT} Tabler outline masks, ` +
            `two Inter ${INTER_VERSION} variable faces, ` +
            `${Object.keys(EXPECTED_INTER_FONT_FILES).length} pinned subsetted WOFF2 files ` +
            `(D-022), no other standalone SVG/WOFF file.`,
    );
} catch (error) {
    console.error(`Asset check failed: ${error.message}`);
    process.exitCode = 1;
}

function parseArguments(argv) {
    const result = {
        coreLess: null,
        dist: null,
        help: false,
        iconsCss: null,
        interCss: null,
        mapping: null,
    };

    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];

        if (argument === '-h' || argument === '--help') {
            result.help = true;
            continue;
        }

        const [name, inlineValue] = argument.split('=', 2);
        if (!['--core-less', '--dist', '--icons-css', '--inter-css', '--mapping'].includes(name)) {
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
Validate the generated fork assets and the distribution file policy.

Usage:
  node build/fork/check-assets.js [options]

Options:
  --dist <path>       Distribution root (default: dist)
  --icons-css <path>  Generated Tabler CSS
  --inter-css <path>  Generated Inter CSS
  --mapping <path>    Canonical Drake-to-Tabler mapping JSON
  --core-less <path>  Generated core Tabler Less aliases
  -h, --help          Show this help
`);
}

function toCamelCase(value) {
    return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

async function validatePackageVersion() {
    const manifest = JSON.parse(await readFile(join(PROJECT_ROOT, 'package.json'), 'utf8'));
    const actual = manifest.devDependencies?.['@tabler/icons'];

    if (actual !== TABLER_VERSION) {
        throw new Error(
            `package.json must pin @tabler/icons to ${TABLER_VERSION}; received ${actual || 'none'}.`,
        );
    }
}

async function validateLegalFiles() {
    const files = {
        inter: join(PROJECT_ROOT, 'licenses/Inter-OFL-1.1.txt'),
        tabler: join(PROJECT_ROOT, 'licenses/Tabler-Icons-MIT.txt'),
        drake: join(PROJECT_ROOT, 'LICENSE.md'),
    };
    for (const [name, file] of Object.entries(files)) {
        const contents = await readFile(file);
        const hash = createHash('sha256').update(contents).digest('hex');
        assertEqual(hash, EXPECTED_LICENSE_SHA256[name], `${name} license hash`);
    }

    const packageTablerLicense = await readFile(
        join(PROJECT_ROOT, 'node_modules/@tabler/icons/LICENSE'),
    );
    const packageTablerHash = createHash('sha256').update(packageTablerLicense).digest('hex');
    assertEqual(packageTablerHash, EXPECTED_LICENSE_SHA256.tabler, 'Installed Tabler license hash');

    const notices = await readFile(join(PROJECT_ROOT, 'THIRD_PARTY_NOTICES.md'), 'utf8');
    for (const required of [
        'following third-party assets',
        `Tabler Icons ${TABLER_VERSION}`,
        `Inter ${INTER_VERSION}`,
        'licenses/Tabler-Icons-MIT.txt',
        'licenses/Inter-OFL-1.1.txt',
    ]) {
        if (!notices.includes(required)) {
            throw new Error(`THIRD_PARTY_NOTICES.md is missing: ${required}.`);
        }
    }
}

async function loadCompatibilityMapping(file) {
    let mapping;

    try {
        mapping = JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
        throw new Error(`Unable to read the canonical icon mapping ${file}: ${error.message}`, {
            cause: error,
        });
    }

    assertObjectKeys(
        mapping,
        [
            'version',
            'tablerVersion',
            'public',
            'internal',
            'backgrounds',
            'stateTargets',
            'brandDivergences',
        ],
        'Icon mapping',
    );
    assertEqual(mapping.version, 1, 'Icon mapping schema');
    assertEqual(mapping.tablerVersion, TABLER_VERSION, 'Icon mapping Tabler version');
    validateMappingGroup(mapping.public, EXPECTED_PUBLIC_ALIAS_COUNT, 'public');
    validateMappingGroup(mapping.internal, EXPECTED_INTERNAL_ALIAS_COUNT, 'internal');
    validateMappingGroup(mapping.backgrounds, 7, 'background');
    validateMappingGroup(mapping.stateTargets, 2, 'state');
    validateMappingGroup(mapping.brandDivergences, 6, 'brand divergence');

    const aliases = [...Object.keys(mapping.public), ...Object.keys(mapping.internal)];
    if (new Set(aliases).size !== aliases.length) {
        throw new Error(`Public and internal Drake icon aliases must not overlap.`);
    }
    for (const [alias, target] of Object.entries(mapping.brandDivergences)) {
        assertEqual(mapping.public[alias], target, `Documented brand divergence ${alias}`);
    }

    return mapping;
}

function validateMappingGroup(group, expectedCount, label) {
    if (!group || Object.getPrototypeOf(group) !== Object.prototype) {
        throw new Error(`The ${label} icon mapping must be an object.`);
    }

    const entries = Object.entries(group);
    assertEqual(entries.length, expectedCount, `${label} icon mapping count`);
    for (const [alias, target] of entries) {
        if (!isSafeIconName(alias) || !isSafeIconName(target)) {
            throw new Error(`Unsafe ${label} icon mapping: ${alias} -> ${target}.`);
        }
    }
}

async function validateTablerCss(file, mapping) {
    const css = await readFile(file, 'utf8').catch((error) => {
        throw new Error(`Unable to read ${file}: ${error.message}`);
    });
    const marker = readMarker(css, 'tabler-icons');

    assertEqual(marker.version, TABLER_VERSION, 'Tabler marker version');
    assertEqual(marker.variant, 'outline', 'Tabler marker variant');
    assertEqual(marker.count, String(EXPECTED_ICON_COUNT), 'Tabler marker count');
    assertEqual(
        marker['public-aliases'],
        String(EXPECTED_PUBLIC_ALIAS_COUNT),
        'Tabler public alias count',
    );
    assertEqual(
        marker['internal-aliases'],
        String(EXPECTED_INTERNAL_ALIAS_COUNT),
        'Tabler internal alias count',
    );
    assertMarkerKeys(
        marker,
        ['version', 'variant', 'count', 'public-aliases', 'internal-aliases', 'source-sha256'],
        'Tabler',
    );
    assertEqual(
        marker['source-sha256'],
        EXPECTED_TABLER_SOURCE_SHA256,
        'Tabler canonical source hash',
    );
    if (!css.includes('MIT License') || !css.includes('Copyright (c)')) {
        throw new Error(`The generated Tabler CSS must retain the MIT license notice.`);
    }
    if (!/\.drk-ti\s*\{[\s\S]*?mask-image:\s*var\(--drk-ti-mask\)/.test(css)) {
        throw new Error(`The .drk-ti mask base class is missing.`);
    }
    if (/tabler-icons-filled|icons\/filled/i.test(css)) {
        throw new Error(`The generated Tabler CSS contains a filled icon asset.`);
    }

    const rulePattern =
        /^(\.drk-ti-([a-z0-9]+(?:-[a-z0-9]+)*)(?:,\n\.drk-ti\.drk-icon-alias-[a-z0-9]+(?:-[a-z0-9]+)*)*) \{ --drk-ti-mask: url\("(data:image\/svg\+xml,[^"]+)"\); \}$/gm;
    const matches = [...css.matchAll(rulePattern)];
    if (matches.length !== EXPECTED_ICON_COUNT) {
        throw new Error(
            `Expected ${EXPECTED_ICON_COUNT} Tabler mask rules in ${basename(file)}, found ${matches.length}.`,
        );
    }

    const names = new Set();
    const nativeIcons = new Map();
    const aliasMatches = [];
    for (const [, selectors, name, dataUri] of matches) {
        if (names.has(name)) {
            throw new Error(`Duplicate Tabler CSS class: drk-ti-${name}`);
        }
        names.add(name);
        nativeIcons.set(name, dataUri);
        for (const selector of selectors.split(',\n').slice(1)) {
            const alias = selector.match(
                /^\.drk-ti\.drk-icon-alias-([a-z0-9]+(?:-[a-z0-9]+)*)$/,
            )?.[1];
            if (!alias) {
                throw new Error(`Invalid compatibility selector grouped with drk-ti-${name}.`);
            }
            aliasMatches.push([null, alias, dataUri]);
        }

        let svg;
        try {
            svg = decodeURIComponent(dataUri.slice(dataUri.indexOf(',') + 1));
        } catch {
            throw new Error(`Invalid SVG data URI for drk-ti-${name}.`);
        }

        if (
            !/^<svg\b[\s\S]*<\/svg>$/.test(svg) ||
            !/\bstroke="black"/.test(svg) ||
            !/\bfill=(['"])none\1/.test(svg) ||
            /<(?:script|style|foreignObject|image|use)\b/i.test(svg) ||
            /\b(?:href|xlink:href)\s*=/i.test(svg)
        ) {
            throw new Error(`Unsafe or non-outline SVG mask for drk-ti-${name}.`);
        }
    }

    const aliases = { ...mapping.public, ...mapping.internal };
    validateAliasRules(aliasMatches, aliases, nativeIcons, 'Drake compatibility');

    const rtlAliases = expectedRtlAliases(aliases);
    const rtlPattern =
        /^:dir\(rtl\)\.drk-ti\.drk-icon-alias-([a-z0-9]+(?:-[a-z0-9]+)*) \{ --drk-ti-mask: url\("(data:image\/svg\+xml,[^"]+)"\); \}$/gm;
    const rtlMatches = [...css.matchAll(rtlPattern)];
    validateAliasRules(rtlMatches, rtlAliases, nativeIcons, 'RTL compatibility');
    assertEqual(rtlMatches.length, EXPECTED_RTL_ALIAS_COUNT, 'RTL compatibility alias count');
    assertEqual(
        countMatches(css, /\.drk-ti\.drk-icon-alias-/g),
        Object.keys(aliases).length + rtlMatches.length,
        'Total Drake compatibility selector count',
    );

    const urls = readCssUrls(css);
    if (
        urls.length !== EXPECTED_ICON_COUNT + rtlMatches.length ||
        urls.some((url) => !url.startsWith('data:image/svg+xml,'))
    ) {
        throw new Error(`Every Tabler URL must be an embedded SVG mask.`);
    }
    rejectExternalOrUnexpectedCss(css, 'Tabler');

    const cssHash = createHash('sha256').update(css).digest('hex');
    assertEqual(cssHash, EXPECTED_TABLER_CSS_SHA256, 'Tabler canonical CSS hash');

    return nativeIcons;
}

function validateAliasRules(matches, expected, nativeIcons, label) {
    const seen = new Set();
    const expectedEntries = Object.entries(expected);
    assertEqual(matches.length, expectedEntries.length, `${label} alias count`);

    for (const [, alias, dataUri] of matches) {
        if (seen.has(alias)) {
            throw new Error(`Duplicate ${label} alias: ${alias}.`);
        }
        seen.add(alias);

        const target = expected[alias];
        if (!target) {
            throw new Error(`Unexpected ${label} alias: ${alias}.`);
        }
        assertEqual(dataUri, nativeIcons.get(target), `${label} alias ${alias} -> ${target}`);
    }

    for (const [alias] of expectedEntries) {
        if (!seen.has(alias)) {
            throw new Error(`Missing ${label} alias: ${alias}.`);
        }
    }
}

async function validateCoreLess(file, mapping, nativeIcons) {
    const less = await readFile(file, 'utf8').catch((error) => {
        throw new Error(`Unable to read ${file}: ${error.message}`);
    });
    const header =
        `// Tabler Icons ${TABLER_VERSION} Outline; source SHA-256: ` +
        EXPECTED_TABLER_SOURCE_SHA256;
    if (
        !less.includes('// Generated by build/fork/generate-tabler-icons.js. Do not edit by hand.')
    ) {
        throw new Error(`The generated core Tabler Less header is missing.`);
    }
    if (!less.includes(header)) {
        throw new Error(`The generated core Tabler Less source marker is invalid.`);
    }
    const marker = readMarker(less, 'tabler-core');
    assertMarkerKeys(marker, ['version', 'variant', 'targets', 'source-sha256'], 'Core Tabler');
    assertEqual(marker.version, TABLER_VERSION, 'Core Tabler marker version');
    assertEqual(marker.variant, 'outline', 'Core Tabler marker variant');
    assertEqual(marker.targets, String(EXPECTED_CORE_TARGET_COUNT), 'Core Tabler target count');
    assertEqual(marker['source-sha256'], EXPECTED_TABLER_SOURCE_SHA256, 'Core Tabler source hash');
    if (!less.includes('MIT License') || !less.includes('Copyright (c)')) {
        throw new Error(`The generated core Tabler Less must retain the MIT license notice.`);
    }
    if (/https?:|src\/images|\.svg(?:["')]|$)/i.test(less)) {
        throw new Error(`The core Tabler Less must contain embedded masks only.`);
    }

    const expectedTargets = Object.fromEntries(
        [
            ...new Set([
                ...Object.values(mapping.internal),
                ...Object.values(mapping.backgrounds),
                ...Object.values(mapping.stateTargets),
            ]),
        ]
            .sort()
            .map((target) => [target, target]),
    );
    assertEqual(
        Object.keys(expectedTargets).length,
        EXPECTED_CORE_TARGET_COUNT,
        'Core Tabler target count',
    );

    const customPropertyPattern =
        /"--drk-tabler-icon-([a-z0-9]+(?:-[a-z0-9]+)*)": "url\(\\"(data:image\/svg\+xml,[^"\\]+)\\"\)"/g;
    const customProperties = collectRuleMap(
        [...less.matchAll(customPropertyPattern)],
        'core Tabler custom property',
    );
    assertSameKeys(customProperties, expectedTargets, 'Core Tabler custom properties');
    for (const target of Object.keys(expectedTargets)) {
        const expectedUri = nativeIcons
            .get(target)
            ?.replace('stroke%3D%22black%22', 'stroke%3D%22%23000%22');
        assertEqual(customProperties[target], expectedUri, `Core Tabler custom property ${target}`);
    }

    const aliasPattern =
        /"\.drk-ti\.drk-icon-alias-([a-z0-9]+(?:-[a-z0-9]+)*)":\s*\{\s*"--drk-ti-mask":\s*"var\(--drk-tabler-icon-([a-z0-9]+(?:-[a-z0-9]+)*)\)"\s*\}/g;
    const aliases = collectRuleMap([...less.matchAll(aliasPattern)], 'core Drake alias');
    assertRuleTargets(aliases, mapping.internal, 'Core Drake aliases');

    const rtlPattern =
        /":dir\(rtl\)\.drk-ti\.drk-icon-alias-([a-z0-9]+(?:-[a-z0-9]+)*)":\s*\{\s*"--drk-ti-mask":\s*"var\(--drk-tabler-icon-([a-z0-9]+(?:-[a-z0-9]+)*)\)"\s*\}/g;
    const rtlAliases = collectRuleMap([...less.matchAll(rtlPattern)], 'core RTL Drake alias');
    assertRuleTargets(rtlAliases, expectedRtlAliases(mapping.internal), 'Core RTL Drake aliases');

    assertEqual(
        [...less.matchAll(/data:image\/svg\+xml,/g)].length,
        EXPECTED_CORE_TARGET_COUNT,
        'Core embedded mask count',
    );
}

async function validateStyleSources() {
    const roots = [join(PROJECT_ROOT, 'src/styles')];
    const violations = [];
    const historicalReference =
        /(?:src\/|(?:\.\.\/)+)?images\/(?:backgrounds|components|icons)|(?:^|[^a-z-])svg-fill\s*\(|data-uri\(\s*['"]image\/svg\+xml|url\([^)]*\.svg(?:[?#)][^)]*)?\)/i;

    for (const root of roots) {
        await walkStyleFiles(root, async (file) => {
            const source = await readFile(file, 'utf8');
            const lines = source.split(/\r?\n/);
            lines.forEach((line, index) => {
                if (historicalReference.test(line)) {
                    violations.push(`${file}:${index + 1}`);
                }
            });
        });
    }

    if (violations.length) {
        throw new Error(
            `Historical SVG icon references remain in style sources: ${violations
                .slice(0, 10)
                .join(', ')}`,
        );
    }

    const [coreIndex, themeIndex] = await Promise.all([
        readFile(join(PROJECT_ROOT, 'src/styles/core/index.ts'), 'utf8'),
        readFile(join(PROJECT_ROOT, 'src/styles/theme/index.ts'), 'utf8'),
    ]);
    if (!coreIndex.includes("from '../tabler'")) {
        throw new Error(`The core style graph does not import the generated Tabler masks.`);
    }
    if (!themeIndex.includes("from '../tabler'")) {
        throw new Error(`The theme style graph does not import the generated Tabler masks.`);
    }
}

async function walkStyleFiles(directory, visit) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        const file = join(directory, entry.name);
        if (entry.isDirectory()) {
            await walkStyleFiles(file, visit);
        } else if (/\.ts$/i.test(entry.name)) {
            await visit(file);
        }
    }
}

function collectRuleMap(matches, label) {
    const rules = {};
    for (const [, name, value] of matches) {
        if (Object.hasOwn(rules, name)) {
            throw new Error(`Duplicate ${label}: ${name}.`);
        }
        rules[name] = value;
    }
    return rules;
}

function assertRuleTargets(actual, expected, label) {
    assertSameKeys(actual, expected, label);
    for (const [alias, target] of Object.entries(expected)) {
        assertEqual(actual[alias], target, `${label} ${alias}`);
    }
}

function assertSameKeys(actual, expected, label) {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    if (
        actualKeys.length !== expectedKeys.length ||
        actualKeys.some((key, index) => key !== expectedKeys[index])
    ) {
        throw new Error(`${label} do not match the canonical mapping.`);
    }
}

function expectedRtlAliases(aliases) {
    const rtl = {};
    for (const alias of Object.keys(aliases)) {
        const counterpart = swapDirectionalAlias(alias);
        if (counterpart !== alias && aliases[counterpart]) {
            rtl[alias] = aliases[counterpart];
        }
    }
    return rtl;
}

function swapDirectionalAlias(value) {
    return swapWords(swapWords(value, 'left', 'right'), 'previous', 'next');
}

function swapWords(value, first, second) {
    const placeholder = '\0';
    return value
        .replaceAll(first, placeholder)
        .replaceAll(second, first)
        .replaceAll(placeholder, second);
}

function isSafeIconName(name) {
    return typeof name === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}

async function validateInterCss(file) {
    const css = await readFile(file, 'utf8').catch((error) => {
        throw new Error(`Unable to read ${file}: ${error.message}`);
    });
    const marker = readMarker(css, 'inter');

    assertEqual(marker.version, INTER_VERSION, 'Inter marker version');
    assertEqual(marker.faces, '2', 'Inter marker face count');
    assertMarkerKeys(marker, ['version', 'faces', 'normal-sha256', 'italic-sha256'], 'Inter');
    assertEqual(
        marker['normal-sha256'],
        EXPECTED_INTER_FACES.normal.sha256,
        'Inter normal marker hash',
    );
    assertEqual(
        marker['italic-sha256'],
        EXPECTED_INTER_FACES.italic.sha256,
        'Inter italic marker hash',
    );
    if (
        !css.includes('SIL OPEN FONT LICENSE Version 1.1') ||
        !css.includes('Inter Project Authors')
    ) {
        throw new Error(`The generated Inter CSS must contain the complete OFL notice.`);
    }

    rejectExternalOrUnexpectedCss(css, 'Inter');
    const blocks = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => match[1]);
    if (blocks.length !== 3) {
        throw new Error(`Expected exactly three @font-face rules in the Inter CSS.`);
    }
    const variableBlocks = blocks.filter(
        (block) => unquote(readDeclaration(block, 'font-family')) === 'InterVariable',
    );
    if (variableBlocks.length !== 2) {
        throw new Error(`Expected exactly two InterVariable @font-face rules.`);
    }

    const styles = new Set();
    for (const block of variableBlocks) {
        const style = readDeclaration(block, 'font-style');
        if (!EXPECTED_INTER_FACES[style] || styles.has(style)) {
            throw new Error(`Unexpected or duplicate InterVariable style: ${style}`);
        }
        styles.add(style);
        assertDeclarationNames(
            block,
            ['font-family', 'font-style', 'font-weight', 'font-display', 'src'],
            `Inter ${style}`,
        );

        assertEqual(readDeclaration(block, 'font-weight'), '100 900', `Inter ${style} weight`);
        assertEqual(readDeclaration(block, 'font-display'), 'swap', `Inter ${style} display`);

        const source = readDeclaration(block, 'src');
        const match = source?.match(
            /^url\("data:font\/woff2;base64,([A-Za-z0-9+/]+={0,2})"\) format\("woff2"\)$/,
        );
        if (!match) {
            throw new Error(`Inter ${style} is not an embedded WOFF2 data URI.`);
        }

        const encoded = match[1];
        const buffer = Buffer.from(encoded, 'base64');
        if (buffer.toString('base64') !== encoded) {
            throw new Error(`Inter ${style} contains invalid base64.`);
        }
        validateWoff2(buffer, style);
    }

    const fallbackBlocks = blocks.filter(
        (block) => unquote(readDeclaration(block, 'font-family')) === 'Inter Fallback',
    );
    if (fallbackBlocks.length !== 1) {
        throw new Error(`Expected one metric-compatible Inter Fallback @font-face rule.`);
    }
    assertDeclarationNames(
        fallbackBlocks[0],
        [
            'font-family',
            'font-style',
            'font-weight',
            'src',
            'size-adjust',
            'ascent-override',
            'descent-override',
            'line-gap-override',
        ],
        'Inter fallback',
    );
    validateFallback(fallbackBlocks[0]);

    const urls = readCssUrls(css);
    if (
        urls.length !== 2 ||
        urls.some((url) => !/^data:font\/woff2;base64,[A-Za-z0-9+/]+={0,2}$/.test(url))
    ) {
        throw new Error(`The Inter CSS contains a non-embedded URL.`);
    }
}

// Variante fichiers (D-022) : feuille unicode-range + quatre WOFF2 subsettés épinglés.
async function validateInterFilesCss(file, fontsDirectory) {
    const css = await readFile(file, 'utf8');
    const marker = readMarker(css, 'inter-files');
    assertEqual(marker.version, INTER_VERSION, 'Inter files variant version');
    assertEqual(
        marker.files,
        String(Object.keys(EXPECTED_INTER_FONT_FILES).length),
        'Inter files count',
    );

    rejectExternalOrUnexpectedCss(css, 'Inter files variant');
    const blocks = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => match[1]);
    if (blocks.length !== 5) {
        throw new Error(`Expected exactly five @font-face rules in the Inter files CSS.`);
    }

    const seen = new Set();
    for (const block of blocks.filter(
        (candidate) => unquote(readDeclaration(candidate, 'font-family')) === 'InterVariable',
    )) {
        assertDeclarationNames(
            block,
            ['font-family', 'font-style', 'font-weight', 'font-display', 'src', 'unicode-range'],
            'Inter files face',
        );
        assertEqual(readDeclaration(block, 'font-weight'), '100 900', 'Inter files weight');
        assertEqual(readDeclaration(block, 'font-display'), 'swap', 'Inter files display');
        if (!/^U\+[0-9A-F]/i.test(readDeclaration(block, 'unicode-range') ?? '')) {
            throw new Error(`Inter files face is missing its unicode-range.`);
        }

        const source = readDeclaration(block, 'src');
        const match = source?.match(/^url\("\.\.\/fonts\/([^"]+)"\) format\("woff2"\)$/);
        const expected = match && EXPECTED_INTER_FONT_FILES[match[1]];
        if (!expected || seen.has(match[1])) {
            throw new Error(`Unexpected or duplicate Inter files source: ${source}`);
        }
        seen.add(match[1]);
        assertEqual(marker[`${match[1]}-sha256`], expected.sha256, `${match[1]} marker hash`);

        const buffer = await readFile(join(fontsDirectory, match[1]));
        const actualHash = createHash('sha256').update(buffer).digest('hex');
        if (
            buffer.length !== expected.size ||
            buffer.subarray(0, 4).toString('ascii') !== 'wOF2' ||
            actualHash !== expected.sha256
        ) {
            throw new Error(`${match[1]} failed WOFF2 integrity verification.`);
        }
    }
    if (seen.size !== Object.keys(EXPECTED_INTER_FONT_FILES).length) {
        throw new Error(`The Inter files CSS does not reference every pinned subset.`);
    }

    const fallbackBlocks = blocks.filter(
        (block) => unquote(readDeclaration(block, 'font-family')) === 'Inter Fallback',
    );
    if (fallbackBlocks.length !== 1) {
        throw new Error(`Expected one metric-compatible Inter Fallback rule (files variant).`);
    }
    validateFallback(fallbackBlocks[0]);

    const urls = readCssUrls(css);
    if (
        urls.length !== seen.size ||
        urls.some((url) => !EXPECTED_INTER_FONT_FILES[url.replace(/^\.\.\/fonts\//, '')])
    ) {
        throw new Error(`The Inter files CSS references an unexpected URL.`);
    }

    // Aucun autre fichier que les subsets épinglés dans dist/fonts.
    for (const entry of await readdir(fontsDirectory)) {
        if (!EXPECTED_INTER_FONT_FILES[entry]) {
            throw new Error(`Unexpected file in dist/fonts: ${entry}`);
        }
    }
}

function validateWoff2(buffer, style) {
    const expected = EXPECTED_INTER_FACES[style];
    const actualHash = createHash('sha256').update(buffer).digest('hex');

    if (
        buffer.length !== expected.size ||
        buffer.subarray(0, 4).toString('ascii') !== 'wOF2' ||
        buffer.readUInt32BE(8) !== buffer.length ||
        actualHash !== expected.sha256
    ) {
        throw new Error(`Inter ${style} failed WOFF2 integrity verification.`);
    }
}

function validateFallback(block) {
    assertEqual(readDeclaration(block, 'font-style'), 'normal', 'Inter fallback style');
    assertEqual(readDeclaration(block, 'font-weight'), '100 900', 'Inter fallback weight');
    assertEqual(
        readDeclaration(block, 'src'),
        'local("Arial"), local("Liberation Sans"), local("Helvetica")',
        'Inter fallback sources',
    );
    assertEqual(readDeclaration(block, 'size-adjust'), '107%', 'Inter fallback size-adjust');
    assertEqual(readDeclaration(block, 'ascent-override'), '90%', 'Inter fallback ascent');
    assertEqual(readDeclaration(block, 'descent-override'), '22%', 'Inter fallback descent');
    assertEqual(readDeclaration(block, 'line-gap-override'), '0%', 'Inter fallback line gap');
}

async function validateDistFiles(dist) {
    const prohibited = [];
    await walk(dist, prohibited);

    if (prohibited.length) {
        throw new Error(
            `Prohibited legacy or standalone assets in dist: ${prohibited.slice(0, 10).join(', ')}`,
        );
    }
}

async function validateBuiltCoreCss(dist) {
    for (const name of [
        'drake.css',
        'drake.min.css',
        'drake-rtl.css',
        'drake-rtl.min.css',
        'drake-core.css',
        'drake-core.min.css',
        'drake-core-rtl.css',
        'drake-core-rtl.min.css',
    ]) {
        const file = join(dist, 'css', name);
        const css = await readFile(file, 'utf8').catch((error) => {
            throw new Error(`Unable to read ${file}: ${error.message}`);
        });
        if (
            !css.includes(`Tabler Icons ${TABLER_VERSION}`) ||
            !css.includes('MIT License') ||
            !css.includes('Copyright (c)') ||
            !css.includes('@drake-fork-asset tabler-core')
        ) {
            throw new Error(`The built core stylesheet lacks its Tabler legal notice: ${file}.`);
        }
    }
}

async function validateDistManifest() {
    await execFileAsync(process.execPath, ['build/fork/dist-manifest.js', '--check'], {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
    });
}

async function validatePackageContents() {
    const cacheDirectory = await mkdtemp(join(tmpdir(), 'drake-ts-npm-pack-'));

    try {
        const { stdout } = await execFileAsync(
            'npm',
            ['pack', '--dry-run', '--ignore-scripts', '--json', '--cache', cacheDirectory],
            {
                cwd: PROJECT_ROOT,
                encoding: 'utf8',
                maxBuffer: 4 * 1024 * 1024,
            },
        );
        const reports = JSON.parse(stdout);
        const files = reports?.[0]?.files?.map(({ path }) => path) ?? [];

        if (!files.length) {
            throw new Error('npm pack returned no package file list.');
        }

        const prohibited = files.filter(
            (file) =>
                /(?:^|\/)\.cache\/fork-assets\//.test(file) ||
                /(?:^|\/)reports\//.test(file) ||
                /\.metrics\.json$/i.test(file) ||
                (/\.(?:svg|woff2?)$/i.test(file) &&
                    !Object.keys(EXPECTED_INTER_FONT_FILES).some(
                        (name) => file === `dist/fonts/${name}`,
                    )) ||
                /^src\/images\/(?:backgrounds|components|icons)\/.*\.svg$/i.test(file) ||
                /(?:^|\/)uikit-icons(?:-[^/]+)?(?:\.min)?\.js(?:\.map)?$/i.test(file),
        );
        if (prohibited.length) {
            throw new Error(
                `Prohibited standalone or transient assets in npm package: ${prohibited
                    .slice(0, 10)
                    .join(', ')}`,
            );
        }

        // npm pack empaquette le répertoire de travail, pas l'arbre git : un artefact
        // généré mais non versionné satisferait la packlist sans être livrable par
        // aucun canal git (tarball de release, install git, CDN). Tout fichier
        // empaqueté DOIT être suivi.
        const { stdout: trackedRaw } = await execFileAsync('git', ['ls-files', '-z'], {
            cwd: PROJECT_ROOT,
            maxBuffer: 16 * 1024 * 1024,
        });
        const tracked = new Set(trackedRaw.split('\0'));
        const untracked = files.filter((file) => !tracked.has(file));
        if (untracked.length) {
            throw new Error(
                `Packed but not git-tracked (undeliverable by git channels): ${untracked
                    .slice(0, 10)
                    .join(', ')}`,
            );
        }

        const requiredFiles = [
            'LICENSE.md',
            'THIRD_PARTY_NOTICES.md',
            'licenses/Inter-OFL-1.1.txt',
            'licenses/Tabler-Icons-MIT.txt',
            'dist/fork-manifest.json',
            'dist/css/drake-core.css',
            'dist/css/drake-core.min.css',
            'dist/css/drake-core-rtl.css',
            'dist/css/drake-core-rtl.min.css',
            'dist/css/drake-inter.css',
            'dist/css/drake-inter-files.css',
            ...Object.keys(EXPECTED_INTER_FONT_FILES).map((name) => `dist/fonts/${name}`),
            'dist/css/drake-tabler-icons.css',
            'dist/css/drake.css',
            'dist/css/drake.min.css',
            'dist/css/drake-rtl.css',
            'dist/css/drake-rtl.min.css',
            'dist/js/drake-core.js',
            'dist/js/drake-core.min.js',
            'dist/js/drake.js',
            'dist/js/drake.min.js',
            ...EXPECTED_COMPONENT_BUNDLES.flatMap((name) => [
                `dist/js/components/${name}.js`,
                `dist/js/components/${name}.min.js`,
            ]),
        ];
        for (const required of requiredFiles) {
            if (!files.includes(required)) {
                throw new Error(`Required npm package asset is missing: ${required}.`);
            }
        }
    } finally {
        await rm(cacheDirectory, { force: true, recursive: true });
    }
}

async function walk(directory, prohibited) {
    const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
        throw new Error(`Unable to inspect ${directory}: ${error.message}`);
    });

    for (const entry of entries) {
        const file = join(directory, entry.name);
        const isPinnedFontFile =
            EXPECTED_INTER_FONT_FILES[entry.name] && file.endsWith(join('dist/fonts', entry.name));
        if (
            !isPinnedFontFile &&
            (/\.(?:svg|woff2?)$/i.test(entry.name) ||
                /^uikit-icons(?:-[^/]+)?(?:\.min)?\.js(?:\.map)?$/i.test(entry.name))
        ) {
            prohibited.push(file);
        }
        if (entry.isDirectory()) {
            await walk(file, prohibited);
        }
    }
}

function readMarker(css, asset) {
    const matches = [
        ...css.matchAll(new RegExp(`/\\*!? @drake-fork-asset ${asset} ([^*]+)\\*/`, 'g')),
    ];
    if (matches.length !== 1) {
        throw new Error(`Expected one ${asset} asset marker, found ${matches.length}.`);
    }

    const parts = matches[0][1].trim().split(/\s+/);
    const entries = parts.map((part) => {
        // Les clés portent aussi des noms de fichiers (D-022) : casse et points admis.
        const match = part.match(/^([A-Za-z][A-Za-z0-9.-]*)=([^=\s]+)$/);
        if (!match) {
            throw new Error(`Malformed ${asset} asset marker field: ${part}.`);
        }
        return [match[1], match[2]];
    });
    if (new Set(entries.map(([key]) => key)).size !== entries.length) {
        throw new Error(`Duplicate ${asset} asset marker field.`);
    }

    return Object.fromEntries(entries);
}

function assertMarkerKeys(marker, expected, label) {
    const actual = Object.keys(marker).sort();
    const wanted = [...expected].sort();
    if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
        throw new Error(`${label} marker contains unexpected or duplicate fields.`);
    }
}

function assertObjectKeys(object, expected, label) {
    if (!object || Object.getPrototypeOf(object) !== Object.prototype) {
        throw new Error(`${label} must be an object.`);
    }

    const actual = Object.keys(object).sort();
    const wanted = [...expected].sort();
    if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
        throw new Error(`${label} contains unexpected or missing fields.`);
    }
}

function assertDeclarationNames(block, expected, label) {
    const names = [...block.matchAll(/(?:^|;)\s*([a-z-]+)\s*:/gi)].map((match) =>
        match[1].toLowerCase(),
    );
    const wanted = [...expected].sort();
    const actual = [...names].sort();

    if (actual.length !== wanted.length || actual.some((name, index) => name !== wanted[index])) {
        throw new Error(`${label} contains unexpected or duplicate CSS declarations.`);
    }
}

function readCssUrls(css) {
    const tokenCount = countMatches(css, /\burl\s*\(/gi);
    const matches = [...css.matchAll(/\burl\(\s*(?:(["'])(.*?)\1|([^"'()]*))\s*\)/gis)];
    if (matches.length !== tokenCount) {
        throw new Error(`The generated CSS contains a malformed or unsupported URL token.`);
    }

    return matches.map((match) => (match[2] ?? match[3]).trim());
}

function rejectExternalOrUnexpectedCss(css, label) {
    if (/@(?:import|namespace|charset|supports|media|layer|container|keyframes)\b/i.test(css)) {
        throw new Error(`${label} CSS contains an unexpected at-rule.`);
    }

    if (label === 'Inter') {
        const remainder = css
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/@font-face\s*\{[^}]*\}/g, '')
            .trim();
        if (remainder) {
            throw new Error(`Inter CSS contains unexpected rules outside @font-face.`);
        }
    }
}

function readDeclaration(block, property) {
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = new RegExp(`\\b${escaped}\\s*:`, 'i').exec(block);
    if (!match) {
        return null;
    }

    const start = match.index + match[0].length;
    let quote = null;
    let parentheses = 0;

    for (let index = start; index < block.length; index++) {
        const character = block[index];

        if (quote) {
            if (character === '\\') {
                index++;
            } else if (character === quote) {
                quote = null;
            }
            continue;
        }
        if (character === '"' || character === "'") {
            quote = character;
        } else if (character === '(') {
            parentheses++;
        } else if (character === ')') {
            parentheses--;
        } else if (character === ';' && parentheses === 0) {
            return block.slice(start, index).trim().replace(/\s+/g, ' ');
        }
    }

    return block.slice(start).trim().replace(/\s+/g, ' ');
}

function unquote(value) {
    return value?.replace(/^(['"])(.*)\1$/, '$2');
}

function assertEqual(actual, expected, label) {
    if (actual !== expected) {
        throw new Error(`${label}: expected ${expected}, received ${actual ?? 'none'}.`);
    }
}

function countMatches(value, pattern) {
    return [...value.matchAll(pattern)].length;
}
