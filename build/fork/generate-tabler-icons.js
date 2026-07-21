import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const TABLER_VERSION = '3.45.0';
const EXPECTED_ICON_COUNT = 5112;
const EXPECTED_PUBLIC_ALIAS_COUNT = 162;
const EXPECTED_INTERNAL_ALIAS_COUNT = 22;
const EXPECTED_BACKGROUND_COUNT = 7;
const EXPECTED_SOURCE_SHA256 = '02f2036fdca959639f74ac3827e283110b3232bb8f2dc5f4241f4b57d757afdc';
const CLASS_PREFIX = 'drk-ti';
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_OUTPUT = join(PROJECT_ROOT, 'dist/css/drake-tabler-icons.css');
const DEFAULT_CORE_OUTPUT = join(PROJECT_ROOT, 'src/styles/tabler.ts');
const DEFAULT_MAPPING = join(PROJECT_ROOT, 'src/icons/drake-tabler.json');

const options = parseArguments(process.argv.slice(2));

if (options.help) {
    printHelp();
    process.exit(0);
}

const { iconDirectory, packageRoot } = await resolveSource(options.source);
const iconFiles = (await readdir(iconDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.svg'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'));

if (iconFiles.length !== EXPECTED_ICON_COUNT) {
    throw new Error(
        `Expected ${EXPECTED_ICON_COUNT} Tabler outline icons, found ${iconFiles.length} in ${iconDirectory}.`,
    );
}

const license = loadPackageLicense(packageRoot);
const sourceHash = createHash('sha256');
const names = new Set();
const iconData = new Map();

for (const fileName of iconFiles) {
    const name = fileName.slice(0, -4);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
        throw new Error(`Unsafe Tabler icon name: ${fileName}`);
    }
    if (names.has(name)) {
        throw new Error(`Duplicate Tabler icon name: ${name}`);
    }

    names.add(name);
    const source = await readFile(join(iconDirectory, fileName), 'utf8');
    sourceHash.update(fileName).update('\0').update(source).update('\0');

    const svg = normalizeOutlineSvg(source, fileName);
    const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    iconData.set(name, { dataUri, svg });
}

const mapping = await loadCompatibilityMapping(options.mapping || DEFAULT_MAPPING, names);
const aliases = { ...mapping.public, ...mapping.internal };
const aliasesByTarget = {};
for (const [alias, target] of Object.entries(aliases)) {
    (aliasesByTarget[target] ||= []).push(alias);
}
const rules = [...iconData].map(([name, { dataUri }]) => {
    const selectors = [
        `.${CLASS_PREFIX}-${name}`,
        ...(aliasesByTarget[name] || []).map((alias) => `.${CLASS_PREFIX}.drk-icon-alias-${alias}`),
    ];

    return `${selectors.join(',\n')} { --drk-ti-mask: url("${dataUri}"); }`;
});
const rtlAliasRules = renderRtlAliasRules(aliases, iconData);

const output = resolve(options.output || DEFAULT_OUTPUT);
const sourceDigest = sourceHash.digest('hex');
// Deliberately update this constant only after reviewing an intentional package refresh.
if (sourceDigest !== EXPECTED_SOURCE_SHA256) {
    throw new Error(
        `The @tabler/icons ${TABLER_VERSION} outline sources are not canonical ` +
            `(expected ${EXPECTED_SOURCE_SHA256}, received ${sourceDigest}).`,
    );
}

const css = renderCss({
    license,
    mapping,
    rtlAliasRules,
    rules,
    sourceHash: sourceDigest,
});

const coreOutput = resolve(options.coreOutput || DEFAULT_CORE_OUTPUT);
const coreStyles = renderCoreStyles(mapping, iconData, sourceDigest, license);

await writeAtomic(output, css);
await writeAtomic(coreOutput, coreStyles);
console.log(
    `Generated ${iconFiles.length} Tabler outline masks and ${Object.keys(aliases).length} ` +
        `Drake CSS aliases in ${output}; internal masks in ${coreOutput}`,
);

function parseArguments(argv) {
    const result = { coreOutput: null, help: false, mapping: null, output: null, source: null };

    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];

        if (argument === '-h' || argument === '--help') {
            result.help = true;
            continue;
        }

        const [name, inlineValue] = argument.split('=', 2);
        if (!['--core-output', '--mapping', '--output', '--source'].includes(name)) {
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
Build the complete Tabler Icons ${TABLER_VERSION} outline set as CSS masks.

Usage:
  node build/fork/generate-tabler-icons.js [options]

Options:
  --source <path>       @tabler/icons package root or icons/outline directory
  --mapping <path>      Drake compatibility mapping JSON
  --output <path>       Complete CSS catalogue output
  --core-output <path>  Generated internal Less output
  -h, --help            Show this help
`);
}

function toCamelCase(value) {
    return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

async function resolveSource(sourceOption) {
    let sourcePath;

    if (sourceOption) {
        sourcePath = resolve(sourceOption);
    } else {
        const require = createRequire(import.meta.url);
        let entry;

        try {
            entry = require.resolve('@tabler/icons/package.json');
        } catch {
            try {
                entry = require.resolve('@tabler/icons/outline/activity.svg');
            } catch {
                throw new Error(
                    `@tabler/icons ${TABLER_VERSION} is not installed. Install dependencies or pass --source.`,
                );
            }
        }

        const located = findPackageManifest(dirname(entry));
        if (!located) {
            throw new Error(`Could not locate the @tabler/icons package root from ${entry}.`);
        }
        sourcePath = located.root;
    }

    const candidates = [join(sourcePath, 'icons/outline'), join(sourcePath, 'outline'), sourcePath];
    let iconDirectory;

    for (const candidate of candidates) {
        if (!existsSync(candidate)) {
            continue;
        }
        const entries = await readdir(candidate, { withFileTypes: true });
        if (entries.some((entry) => entry.isFile() && entry.name.endsWith('.svg'))) {
            iconDirectory = candidate;
            break;
        }
    }

    if (!iconDirectory) {
        throw new Error(`Could not find an outline SVG directory below ${sourcePath}.`);
    }

    const located = findPackageManifest(iconDirectory);
    if (!located || located.manifest.name !== '@tabler/icons') {
        throw new Error(`The source must belong to the @tabler/icons npm package.`);
    }
    if (located.manifest.version !== TABLER_VERSION) {
        throw new Error(
            `Expected @tabler/icons ${TABLER_VERSION}, found ${located.manifest.version}.`,
        );
    }

    return {
        iconDirectory,
        packageRoot: located.root,
        manifest: located.manifest,
    };
}

function findPackageManifest(start) {
    let current = resolve(start);

    while (true) {
        const file = join(current, 'package.json');
        if (existsSync(file)) {
            try {
                const manifest = JSON.parse(readFileSync(file, 'utf8'));
                if (manifest.name === '@tabler/icons') {
                    return { manifest, root: current };
                }
            } catch {
                // Keep walking; a parent package may own the supplied directory.
            }
        }

        const parent = dirname(current);
        if (parent === current) {
            return null;
        }
        current = parent;
    }
}

function loadPackageLicense(packageRoot) {
    for (const name of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) {
        const file = join(packageRoot, name);
        if (!existsSync(file)) {
            continue;
        }

        const license = readFileSync(file, 'utf8').trim();
        if (!license.includes('MIT License')) {
            throw new Error(`Unexpected Tabler license text in ${file}.`);
        }
        return license;
    }

    throw new Error(`The @tabler/icons package does not contain its MIT license.`);
}

function normalizeOutlineSvg(source, fileName) {
    let svg = source
        .replace(/^\uFEFF/, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .trim();

    if (
        /<(?:script|style|foreignObject|image|use|animate(?:Motion|Transform)?|set)\b/i.test(svg) ||
        /\b(?:href|xlink:href|on[a-z][a-z0-9_-]*)\s*=/i.test(svg) ||
        /<\?|<!|&(?:#\d+|#x[a-f0-9]+|[a-z][a-z0-9]+);/i.test(svg)
    ) {
        throw new Error(`External or executable SVG content in ${fileName}.`);
    }
    validateSvgStructure(svg, fileName);

    svg = svg
        .replace(/\s+class=(['"])[\s\S]*?\1/g, '')
        .replace(/\bstroke=(['"])currentColor\1/g, 'stroke="black"')
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .trim();

    return svg;
}

function validateSvgStructure(svg, fileName) {
    const tagPattern = /<(\/)?([A-Za-z][A-Za-z0-9:-]*)([^<>]*?)(\/?)>/g;
    let cursor = 0;
    let rootOpen = false;
    let rootClosed = false;
    let pathCount = 0;
    let match;

    while ((match = tagPattern.exec(svg))) {
        if (svg.slice(cursor, match.index).trim()) {
            throw new Error(`Unexpected text in ${fileName}.`);
        }
        cursor = tagPattern.lastIndex;

        const [, closing, tag, rawAttributes, selfClosing] = match;
        if (!['svg', 'path'].includes(tag)) {
            throw new Error(`Unexpected <${tag}> element in ${fileName}.`);
        }

        if (closing) {
            if (tag !== 'svg' || !rootOpen || rootClosed || rawAttributes.trim() || selfClosing) {
                throw new Error(`Invalid closing element in ${fileName}.`);
            }
            rootClosed = true;
            continue;
        }

        const attributes = parseSvgAttributes(rawAttributes, fileName);
        if (tag === 'svg') {
            if (rootOpen || rootClosed || selfClosing) {
                throw new Error(`Invalid SVG root in ${fileName}.`);
            }
            rootOpen = true;
            validateRootAttributes(attributes, fileName);
            continue;
        }

        if (!rootOpen || rootClosed || !selfClosing) {
            throw new Error(`Tabler paths must be self-closing children in ${fileName}.`);
        }
        validatePathAttributes(attributes, fileName);
        pathCount++;
    }

    if (svg.slice(cursor).trim() || !rootOpen || !rootClosed || pathCount === 0) {
        throw new Error(`Invalid SVG document structure in ${fileName}.`);
    }
}

function parseSvgAttributes(source, fileName) {
    const attributes = new Map();
    let rest = source;

    while (rest.trim()) {
        const leading = rest.match(/^\s+/);
        if (!leading) {
            throw new Error(`Malformed SVG attributes in ${fileName}.`);
        }
        rest = rest.slice(leading[0].length);

        const match = rest.match(/^([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(["'])([\s\S]*?)\2/);
        if (!match) {
            throw new Error(`Malformed SVG attributes in ${fileName}.`);
        }

        const [, name, , value] = match;
        if (attributes.has(name) || /^on/i.test(name)) {
            throw new Error(`Unsafe or duplicate SVG attribute ${name} in ${fileName}.`);
        }
        attributes.set(name, value);
        rest = rest.slice(match[0].length);
    }

    return attributes;
}

function validateRootAttributes(attributes, fileName) {
    const iconName = fileName.slice(0, -4);
    const expected = new Map([
        ['xmlns', 'http://www.w3.org/2000/svg'],
        ['width', '24'],
        ['height', '24'],
        ['viewBox', '0 0 24 24'],
        ['fill', 'none'],
        ['stroke', 'currentColor'],
        ['stroke-width', '2'],
        ['stroke-linecap', 'round'],
        ['stroke-linejoin', 'round'],
        ['class', `icon icon-tabler icons-tabler-outline icon-tabler-${iconName}`],
    ]);
    assertSvgAttributes(attributes, expected, 'root', fileName);
}

function validatePathAttributes(attributes, fileName) {
    const allowed = new Set(['d', 'fill', 'stroke', 'opacity']);
    if ([...attributes.keys()].some((name) => !allowed.has(name))) {
        throw new Error(`Unexpected path attribute in ${fileName}.`);
    }

    const path = attributes.get('d');
    if (!path || !/^[0-9HMachlmqstvz.\s-]+$/.test(path)) {
        throw new Error(`Invalid path data in ${fileName}.`);
    }

    // A few canonical outline glyphs use currentColor for tiny solid details (for example,
    // dots). No arbitrary color, paint server, or other non-outline fill is accepted.
    if (attributes.has('fill') && !['none', 'currentColor'].includes(attributes.get('fill'))) {
        throw new Error(`Unexpected non-outline fill in ${fileName}.`);
    }
    if (attributes.has('stroke') && attributes.get('stroke') !== 'none') {
        throw new Error(`Unexpected path stroke override in ${fileName}.`);
    }
    if (attributes.has('opacity') && attributes.get('opacity') !== '.5') {
        throw new Error(`Unexpected path opacity in ${fileName}.`);
    }
}

function assertSvgAttributes(actual, expected, element, fileName) {
    if (
        actual.size !== expected.size ||
        [...expected].some(([name, value]) => actual.get(name) !== value)
    ) {
        throw new Error(`Unexpected ${element} attributes in ${fileName}.`);
    }
}

async function loadCompatibilityMapping(file, tablerNames) {
    const source = await readFile(resolve(file), 'utf8').catch((error) => {
        throw new Error(`Unable to read Drake icon mapping ${file}: ${error.message}`);
    });
    let mapping;

    try {
        mapping = JSON.parse(source);
    } catch (error) {
        throw new Error(`Invalid Drake icon mapping JSON in ${file}: ${error.message}`, {
            cause: error,
        });
    }

    if (mapping.version !== 1 || mapping.tablerVersion !== TABLER_VERSION) {
        throw new Error(`Unexpected Drake icon mapping schema or Tabler version in ${file}.`);
    }

    validateMappingGroup(mapping.public, EXPECTED_PUBLIC_ALIAS_COUNT, 'public', tablerNames);
    validateMappingGroup(mapping.internal, EXPECTED_INTERNAL_ALIAS_COUNT, 'internal', tablerNames);
    validateMappingGroup(mapping.backgrounds, EXPECTED_BACKGROUND_COUNT, 'background', tablerNames);
    validateMappingGroup(mapping.stateTargets, 2, 'state', tablerNames);

    const aliases = new Set([...Object.keys(mapping.public), ...Object.keys(mapping.internal)]);
    if (aliases.size !== EXPECTED_PUBLIC_ALIAS_COUNT + EXPECTED_INTERNAL_ALIAS_COUNT) {
        throw new Error(`Public and internal Drake icon aliases must not overlap.`);
    }

    for (const [name, target] of Object.entries(mapping.brandDivergences || {})) {
        if (mapping.public[name] !== target) {
            throw new Error(`Invalid documented brand divergence ${name} -> ${target}.`);
        }
    }

    return mapping;
}

function validateMappingGroup(group, expectedCount, label, tablerNames) {
    if (!group || Object.getPrototypeOf(group) !== Object.prototype) {
        throw new Error(`The ${label} Drake icon mapping must be an object.`);
    }

    const entries = Object.entries(group);
    if (entries.length !== expectedCount) {
        throw new Error(
            `Expected ${expectedCount} ${label} Drake icon mappings, found ${entries.length}.`,
        );
    }

    for (const [alias, target] of entries) {
        if (!isSafeIconName(alias) || !isSafeIconName(target)) {
            throw new Error(`Unsafe ${label} Drake icon mapping ${alias} -> ${target}.`);
        }
        if (!tablerNames.has(target)) {
            throw new Error(`Unknown Tabler target for ${label} Drake icon ${alias}: ${target}.`);
        }
    }
}

function isSafeIconName(name) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}

function renderRtlAliasRules(aliases, iconData) {
    const rules = [];

    for (const [alias] of Object.entries(aliases)) {
        const rtlAlias = swapDirection(swapDirection(alias, 'left', 'right'), 'previous', 'next');
        if (rtlAlias === alias || !aliases[rtlAlias]) {
            continue;
        }

        const { dataUri } = iconData.get(aliases[rtlAlias]);
        rules.push(
            `:dir(rtl).${CLASS_PREFIX}.drk-icon-alias-${alias} { --drk-ti-mask: url("${dataUri}"); }`,
        );
    }

    return rules;
}

function swapDirection(value, first, second) {
    const placeholder = '\0';
    return value
        .replaceAll(first, placeholder)
        .replaceAll(second, first)
        .replaceAll(placeholder, second);
}

function renderCoreStyles(mapping, iconData, sourceHash, license) {
    const targets = new Set([
        ...Object.values(mapping.internal),
        ...Object.values(mapping.backgrounds),
        ...Object.values(mapping.stateTargets),
    ]);

    const rootProperties = {};
    for (const target of [...targets].sort((left, right) => left.localeCompare(right, 'en'))) {
        const { svg } = iconData.get(target);
        const colorableSvg = svg.replace('stroke="black"', 'stroke="#000"');
        rootProperties[`--drk-tabler-icon-${target}`] =
            `url("data:image/svg+xml,${encodeURIComponent(colorableSvg)}")`;
    }

    // Un seul fragment : les clés sont toutes distinctes et sans chevauchement d'atomes,
    // l'ordre d'insertion est donc préservé par le sérialiseur Panda.
    const fragment = { ':root': rootProperties };
    for (const [alias, target] of Object.entries(mapping.internal)) {
        fragment[`.${CLASS_PREFIX}.drk-icon-alias-${alias}`] = {
            '--drk-ti-mask': `var(--drk-tabler-icon-${target})`,
        };
    }
    for (const [alias] of Object.entries(mapping.internal)) {
        const rtlAlias = swapDirection(swapDirection(alias, 'left', 'right'), 'previous', 'next');
        if (rtlAlias === alias || !mapping.internal[rtlAlias]) {
            continue;
        }
        fragment[`:dir(rtl).${CLASS_PREFIX}.drk-icon-alias-${alias}`] = {
            '--drk-ti-mask': `var(--drk-tabler-icon-${mapping.internal[rtlAlias]})`,
        };
    }

    const legal = license
        .split(/\r?\n/)
        .map((line) => ` * ${line}`.trimEnd())
        .join('\n');

    const licenseHeader = `/*!
 * Tabler Icons ${TABLER_VERSION}, outline set used by Drake core.
 * Generated from @tabler/icons; do not edit by hand.
${legal}
 */`;
    const marker = `/*! @drake-fork-asset tabler-core version=${TABLER_VERSION} variant=outline targets=${targets.size} source-sha256=${sourceHash} */`;

    return `${licenseHeader}
// Generated by build/fork/generate-tabler-icons.js. Do not edit by hand.
// Tabler Icons ${TABLER_VERSION} Outline; source SHA-256: ${sourceHash}
import type { GlobalStyleObject } from '@pandacss/types';

// Bannière légale embarquée par build/panda.js dans chaque feuille distribuée.
export const banner: string = ${JSON.stringify(`${licenseHeader}\n${marker}\n`)};

export const fragments: GlobalStyleObject[] = [
${JSON.stringify(fragment, null, 4)},
];
`;
}

function renderCss({ license, mapping, rtlAliasRules, rules, sourceHash }) {
    const legal = license
        .split(/\r?\n/)
        .map((line) => ` * ${line}`.trimEnd())
        .join('\n');

    return `/*!
 * Tabler Icons ${TABLER_VERSION}, outline set.
 * Generated from @tabler/icons; do not edit by hand.
${legal}
 */
/* @drake-fork-asset tabler-icons version=${TABLER_VERSION} variant=outline count=${EXPECTED_ICON_COUNT} public-aliases=${Object.keys(mapping.public).length} internal-aliases=${Object.keys(mapping.internal).length} source-sha256=${sourceHash} */

.${CLASS_PREFIX} {
    display: inline-block;
    flex: none;
    width: 1em;
    height: 1em;
    color: inherit;
    vertical-align: -0.125em;
    background-color: currentColor;
    -webkit-mask-image: var(--drk-ti-mask);
    mask-image: var(--drk-ti-mask);
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
}

/* Native Tabler classes and inherited compatibility aliases (D-012). */
${rules.join('\n')}

/* Match Drake's historical left/right and previous/next behavior in RTL. */
${rtlAliasRules.join('\n')}
`;
}

async function writeAtomic(file, contents) {
    await mkdir(dirname(file), { recursive: true });
    const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;

    try {
        await writeFile(temporary, contents, { encoding: 'utf8', mode: 0o644 });
        await rename(temporary, file);
    } finally {
        await unlink(temporary).catch(() => {});
    }
}
