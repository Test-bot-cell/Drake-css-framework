import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const TABLER_VERSION = '3.45.0';
const EXPECTED_ICON_COUNT = 5112;
const EXPECTED_SOURCE_SHA256 = '02f2036fdca959639f74ac3827e283110b3232bb8f2dc5f4241f4b57d757afdc';
const CLASS_PREFIX = 'uk-ti';
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_OUTPUT = join(PROJECT_ROOT, 'dist/css/uikit-tabler-icons.css');

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
const rules = [];
const names = new Set();

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
    rules.push(`.${CLASS_PREFIX}-${name} { --uk-ti-mask: url("${dataUri}"); }`);
}

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
    rules,
    sourceHash: sourceDigest,
});

await writeAtomic(output, css);
console.log(`Generated ${iconFiles.length} Tabler outline masks in ${output}`);

function parseArguments(argv) {
    const result = { help: false, output: null, source: null };

    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];

        if (argument === '-h' || argument === '--help') {
            result.help = true;
            continue;
        }

        const [name, inlineValue] = argument.split('=', 2);
        if (name !== '--source' && name !== '--output') {
            throw new Error(`Unknown argument: ${argument}`);
        }

        const value = inlineValue ?? argv[++index];
        if (!value || value.startsWith('--')) {
            throw new Error(`Missing value for ${name}`);
        }

        result[name.slice(2)] = value;
    }

    return result;
}

function printHelp() {
    console.log(`
Build the complete Tabler Icons ${TABLER_VERSION} outline set as CSS masks.

Usage:
  node build/fork/generate-tabler-icons.js [options]

Options:
  --source <path>  @tabler/icons package root or icons/outline directory
  --output <path>  Output CSS file (default: dist/css/uikit-tabler-icons.css)
  -h, --help       Show this help
`);
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

function renderCss({ license, rules, sourceHash }) {
    const legal = license
        .split(/\r?\n/)
        .map((line) => ` * ${line}`.trimEnd())
        .join('\n');

    return `/*!
 * Tabler Icons ${TABLER_VERSION}, outline set.
 * Generated from @tabler/icons; do not edit by hand.
${legal}
 */
/* @uikit-fork-asset tabler-icons version=${TABLER_VERSION} variant=outline count=${EXPECTED_ICON_COUNT} source-sha256=${sourceHash} */

.${CLASS_PREFIX} {
    display: inline-block;
    flex: none;
    width: 1em;
    height: 1em;
    color: inherit;
    vertical-align: -0.125em;
    background-color: currentColor;
    -webkit-mask-image: var(--uk-ti-mask);
    mask-image: var(--uk-ti-mask);
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
}

${rules.join('\n')}
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
