import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const TABLER_VERSION = '3.45.0';
const INTER_VERSION = '4.1';
const EXPECTED_ICON_COUNT = 5112;
const EXPECTED_TABLER_SOURCE_SHA256 =
    '02f2036fdca959639f74ac3827e283110b3232bb8f2dc5f4241f4b57d757afdc';
// Deliberately update this only after reviewing an intentional Tabler asset refresh.
const EXPECTED_TABLER_CSS_SHA256 =
    '7a9b619655112d4743f4a9750d7ce6afcb960ecd7741b34b8ab7b476e53b6470';
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
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

const options = parseArguments(process.argv.slice(2));

if (options.help) {
    printHelp();
    process.exit(0);
}

try {
    const dist = resolve(options.dist || join(PROJECT_ROOT, 'dist'));
    const iconsFile = resolve(options.iconsCss || join(dist, 'css/uikit-tabler-icons.css'));
    const interFile = resolve(options.interCss || join(dist, 'css/uikit-inter.css'));

    await validatePackageVersion();
    await validateTablerCss(iconsFile);
    await validateInterCss(interFile);
    await validateDistFiles(dist);

    console.log(
        `Asset checks passed: ${EXPECTED_ICON_COUNT} Tabler outline masks, ` +
            `two Inter ${INTER_VERSION} variable faces, no distributed SVG/WOFF files.`,
    );
} catch (error) {
    console.error(`Asset check failed: ${error.message}`);
    process.exitCode = 1;
}

function parseArguments(argv) {
    const result = { dist: null, help: false, iconsCss: null, interCss: null };

    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];

        if (argument === '-h' || argument === '--help') {
            result.help = true;
            continue;
        }

        const [name, inlineValue] = argument.split('=', 2);
        if (!['--dist', '--icons-css', '--inter-css'].includes(name)) {
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

async function validateTablerCss(file) {
    const css = await readFile(file, 'utf8').catch((error) => {
        throw new Error(`Unable to read ${file}: ${error.message}`);
    });
    const marker = readMarker(css, 'tabler-icons');

    assertEqual(marker.version, TABLER_VERSION, 'Tabler marker version');
    assertEqual(marker.variant, 'outline', 'Tabler marker variant');
    assertEqual(marker.count, String(EXPECTED_ICON_COUNT), 'Tabler marker count');
    assertMarkerKeys(marker, ['version', 'variant', 'count', 'source-sha256'], 'Tabler');
    assertEqual(
        marker['source-sha256'],
        EXPECTED_TABLER_SOURCE_SHA256,
        'Tabler canonical source hash',
    );
    if (!css.includes('MIT License') || !css.includes('Copyright (c)')) {
        throw new Error(`The generated Tabler CSS must retain the MIT license notice.`);
    }
    if (!/\.uk-ti\s*\{[\s\S]*?mask-image:\s*var\(--uk-ti-mask\)/.test(css)) {
        throw new Error(`The .uk-ti mask base class is missing.`);
    }
    if (/tabler-icons-filled|icons\/filled/i.test(css)) {
        throw new Error(`The generated Tabler CSS contains a filled icon asset.`);
    }

    const rulePattern =
        /^\.uk-ti-([a-z0-9]+(?:-[a-z0-9]+)*) \{ --uk-ti-mask: url\("(data:image\/svg\+xml,[^"]+)"\); \}$/gm;
    const matches = [...css.matchAll(rulePattern)];
    if (matches.length !== EXPECTED_ICON_COUNT) {
        throw new Error(
            `Expected ${EXPECTED_ICON_COUNT} Tabler mask rules in ${basename(file)}, found ${matches.length}.`,
        );
    }

    const names = new Set();
    for (const [, name, dataUri] of matches) {
        if (names.has(name)) {
            throw new Error(`Duplicate Tabler CSS class: uk-ti-${name}`);
        }
        names.add(name);

        let svg;
        try {
            svg = decodeURIComponent(dataUri.slice(dataUri.indexOf(',') + 1));
        } catch {
            throw new Error(`Invalid SVG data URI for uk-ti-${name}.`);
        }

        if (
            !/^<svg\b[\s\S]*<\/svg>$/.test(svg) ||
            !/\bstroke="black"/.test(svg) ||
            !/\bfill=(['"])none\1/.test(svg) ||
            /<(?:script|style|foreignObject|image|use)\b/i.test(svg) ||
            /\b(?:href|xlink:href)\s*=/i.test(svg)
        ) {
            throw new Error(`Unsafe or non-outline SVG mask for uk-ti-${name}.`);
        }
    }

    const urls = readCssUrls(css);
    if (
        urls.length !== EXPECTED_ICON_COUNT ||
        urls.some((url) => !url.startsWith('data:image/svg+xml,'))
    ) {
        throw new Error(`Every Tabler URL must be an embedded SVG mask.`);
    }
    rejectExternalOrUnexpectedCss(css, 'Tabler');

    const cssHash = createHash('sha256').update(css).digest('hex');
    assertEqual(cssHash, EXPECTED_TABLER_CSS_SHA256, 'Tabler canonical CSS hash');
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
            `Prohibited standalone font/SVG files in dist: ${prohibited.slice(0, 10).join(', ')}`,
        );
    }
}

async function walk(directory, prohibited) {
    const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
        throw new Error(`Unable to inspect ${directory}: ${error.message}`);
    });

    for (const entry of entries) {
        const file = join(directory, entry.name);
        if (/\.(?:svg|woff2?)$/i.test(entry.name)) {
            prohibited.push(file);
        }
        if (entry.isDirectory()) {
            await walk(file, prohibited);
        }
    }
}

function readMarker(css, asset) {
    const matches = [
        ...css.matchAll(new RegExp(`/\\* @uikit-fork-asset ${asset} ([^*]+)\\*/`, 'g')),
    ];
    if (matches.length !== 1) {
        throw new Error(`Expected one ${asset} asset marker, found ${matches.length}.`);
    }

    const parts = matches[0][1].trim().split(/\s+/);
    const entries = parts.map((part) => {
        const match = part.match(/^([a-z][a-z0-9-]*)=([^=\s]+)$/);
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
