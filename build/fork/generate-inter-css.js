import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import subsetFont from 'subset-font';

const INTER_VERSION = '4.1';
const INTER_RELEASE_COMMIT = 'e3a3d4c57d5ecc01453a575621882a384c1995a3';
const OFFICIAL_CSS_URL = new URL(
    `https://raw.githubusercontent.com/rsms/inter/${INTER_RELEASE_COMMIT}/docs/inter.css`,
);
const OFFICIAL_CSS_SHA256 = '94d799da40fc859eb2017aadd454245b87f707ef326b4dcbbe9040e393d9a106';
const MAX_OFFICIAL_SOURCE_CSS_BYTES = 128 * 1024;
const MAX_CUSTOM_SOURCE_CSS_BYTES = 2 * 1024 * 1024;
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_OUTPUT = join(PROJECT_ROOT, 'dist/css/drake-inter.css');
const DEFAULT_FILES_OUTPUT = join(PROJECT_ROOT, 'dist/css/drake-inter-files.css');
const DEFAULT_FONTS_DIRECTORY = join(PROJECT_ROOT, 'dist/fonts');
const DEFAULT_CACHE = join(PROJECT_ROOT, '.cache/fork-assets/inter-4.1');
// Variante fichiers (D-022) : subsets latin et latin-ext, axes variables conservés.
// Les plages sont la source de vérité unique : elles alimentent à la fois le subsetter
// (via les codepoints) et la déclaration unicode-range émise.
const SUBSET_RANGES = {
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    'latin-ext':
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
};
const FONT_FILE_NAMES = {
    normal: { latin: 'InterVariable-latin.woff2', 'latin-ext': 'InterVariable-latin-ext.woff2' },
    italic: {
        latin: 'InterVariable-Italic-latin.woff2',
        'latin-ext': 'InterVariable-Italic-latin-ext.woff2',
    },
};
const FACE_DEFINITIONS = {
    normal: {
        fileName: 'InterVariable.woff2',
        sha256: '693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3',
        size: 352240,
    },
    italic: {
        fileName: 'InterVariable-Italic.woff2',
        sha256: 'e564f652916db6c139570fefb9524a77c4d48f30c92928de9db19b6b5c7a262a',
        size: 387976,
    },
};

const INTER_LICENSE = `Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION AND CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.`;

const options = parseArguments(process.argv.slice(2));

if (options.help) {
    printHelp();
    process.exit(0);
}

const cacheDirectory = resolve(options.cache || DEFAULT_CACHE);
const cssSource = await loadSourceCss(options.sourceCss, cacheDirectory, options.refresh);
const sourceText = cssSource.official
    ? cssSource.text.replaceAll('{{font_v}}', INTER_VERSION)
    : cssSource.text;
const faceSources = extractVariableFaces(sourceText, cssSource.baseUrl);
if (cssSource.official) {
    validateOfficialFaceSources(faceSources);
}
const faces = {};

for (const style of ['normal', 'italic']) {
    const definition = FACE_DEFINITIONS[style];
    const cacheFile = join(cacheDirectory, definition.fileName);
    let font = null;

    if (!options.refresh && existsSync(cacheFile)) {
        const cached = await readFile(cacheFile);
        if (validateFont(cached, definition, false)) {
            font = cached;
        }
    }

    if (!font) {
        font = await readResource(faceSources[style], {
            allowedOrigin: cssSource.official ? OFFICIAL_CSS_URL.origin : null,
            maxBytes: definition.size,
        });
        validateFont(font, definition, true);
        await writeAtomic(cacheFile, font);
    }

    faces[style] = font;
}

const output = resolve(options.output || DEFAULT_OUTPUT);
await writeAtomic(output, renderCss(faces));
console.log(`Generated Inter ${INTER_VERSION} variable roman and italic faces in ${output}`);

// Variante fichiers (D-022) : quatre WOFF2 subsettés + feuille unicode-range.
const fontsDirectory = resolve(options.fontsDir || DEFAULT_FONTS_DIRECTORY);
const filesOutput = resolve(options.filesOutput || DEFAULT_FILES_OUTPUT);
const subsetFiles = {};
for (const style of ['normal', 'italic']) {
    for (const subset of Object.keys(SUBSET_RANGES)) {
        const text = codepointsText(SUBSET_RANGES[subset]);
        const woff2 = await subsetFont(faces[style], text, { targetFormat: 'woff2' });
        const fileName = FONT_FILE_NAMES[style][subset];
        await writeAtomic(join(fontsDirectory, fileName), woff2);
        subsetFiles[fileName] = {
            sha256: createHash('sha256').update(woff2).digest('hex'),
            size: woff2.length,
            style,
            subset,
        };
    }
}
await writeAtomic(filesOutput, renderFilesCss(subsetFiles));
console.log(
    `Generated Inter ${INTER_VERSION} subsetted files variant in ${filesOutput}: ` +
        Object.entries(subsetFiles)
            .map(([name, meta]) => `${name} (${Math.round(meta.size / 1024)} KiB)`)
            .join(', '),
);

function parseArguments(argv) {
    const result = {
        cache: null,
        filesOutput: null,
        fontsDir: null,
        help: false,
        output: null,
        refresh: false,
        sourceCss: null,
    };

    for (let index = 0; index < argv.length; index++) {
        const argument = argv[index];

        if (argument === '-h' || argument === '--help') {
            result.help = true;
            continue;
        }
        if (argument === '--refresh') {
            result.refresh = true;
            continue;
        }

        const [name, inlineValue] = argument.split('=', 2);
        if (
            !['--source-css', '--output', '--cache', '--files-output', '--fonts-dir'].includes(name)
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
Embed the official Inter ${INTER_VERSION} variable roman and italic WOFF2 files in CSS.

Usage:
  node build/fork/generate-inter-css.js [options]

Options:
  --source-css <path|url>  Local or remote Inter CSS source
  --output <path>          Output CSS file (default: dist/css/drake-inter.css)
  --files-output <path>    Files-variant CSS (default: dist/css/drake-inter-files.css)
  --fonts-dir <path>       Subsetted WOFF2 directory (default: dist/fonts)
  --cache <path>           Verified download cache
  --refresh                Ignore valid cached sources and fetch again
  -h, --help               Show this help
`);
}

function toCamelCase(value) {
    return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

async function loadSourceCss(sourceOption, cacheDirectory, refresh) {
    if (sourceOption) {
        const sourceUrl = toResourceUrl(sourceOption);
        const text = (
            await readResource(sourceUrl, { maxBytes: MAX_CUSTOM_SOURCE_CSS_BYTES })
        ).toString('utf8');
        validateSourceCss(text, false);
        return { baseUrl: sourceUrl, official: false, text };
    }

    const cacheFile = join(cacheDirectory, 'inter.css');
    if (!refresh && existsSync(cacheFile)) {
        const text = await readFile(cacheFile, 'utf8');
        try {
            validateSourceCss(text, true);
            return { baseUrl: OFFICIAL_CSS_URL, official: true, text };
        } catch {
            // An invalid cache is replaced from the official source below.
        }
    }

    const text = (
        await readResource(OFFICIAL_CSS_URL, {
            allowedOrigin: OFFICIAL_CSS_URL.origin,
            maxBytes: MAX_OFFICIAL_SOURCE_CSS_BYTES,
        })
    ).toString('utf8');
    validateSourceCss(text, true);
    await writeAtomic(cacheFile, text);
    return { baseUrl: OFFICIAL_CSS_URL, official: true, text };
}

function validateSourceCss(css, requireVersion) {
    if (
        !/font-family\s*:\s*['"]?InterVariable['"]?/i.test(css) ||
        (requireVersion && createHash('sha256').update(css).digest('hex') !== OFFICIAL_CSS_SHA256)
    ) {
        throw new Error(`The source CSS is not the official Inter ${INTER_VERSION} stylesheet.`);
    }
}

function extractVariableFaces(css, baseUrl) {
    const faces = {};
    const blocks = css.matchAll(/@font-face\s*\{([^}]+)\}/g);

    for (const [, block] of blocks) {
        const family = readDeclaration(block, 'font-family')?.replace(/^['"]|['"]$/g, '');
        const style = readDeclaration(block, 'font-style');
        const weight = readDeclaration(block, 'font-weight')?.replace(/\s+/g, ' ');

        if (family !== 'InterVariable' || !['normal', 'italic'].includes(style)) {
            continue;
        }
        if (weight !== '100 900') {
            throw new Error(`InterVariable ${style} does not expose the 100–900 weight range.`);
        }
        if (faces[style]) {
            throw new Error(`Duplicate InterVariable ${style} face in the source CSS.`);
        }

        const source = readDeclaration(block, 'src');
        const urlMatch = source?.match(
            /url\(\s*(['"]?)(.*?)\1\s*\)\s*format\(\s*(['"])woff2\3\s*\)/,
        );
        if (!urlMatch) {
            throw new Error(`InterVariable ${style} does not reference a WOFF2 resource.`);
        }

        faces[style] = new URL(urlMatch[2], baseUrl);
    }

    if (!faces.normal || !faces.italic) {
        throw new Error(`The source CSS must define normal and italic InterVariable faces.`);
    }

    return faces;
}

function validateOfficialFaceSources(faces) {
    for (const style of ['normal', 'italic']) {
        const expected = new URL(
            `font-files/${FACE_DEFINITIONS[style].fileName}`,
            OFFICIAL_CSS_URL,
        );
        expected.searchParams.set('v', INTER_VERSION);
        if (faces[style].href !== expected.href) {
            throw new Error(
                `The official Inter ${style} face URL is unexpected: ${faces[style].href}`,
            );
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
            return block.slice(start, index).trim();
        }
    }

    return block.slice(start).trim();
}

function toResourceUrl(value) {
    if (/^https?:\/\//i.test(value) || value.startsWith('file:')) {
        return new URL(value);
    }
    return pathToFileURL(resolve(value));
}

async function readResource(resource, { allowedOrigin = null, maxBytes }) {
    if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
        throw new Error(`A positive resource size limit is required.`);
    }

    if (resource.protocol === 'file:') {
        const local = new URL(resource);
        local.search = '';
        local.hash = '';
        const file = fileURLToPath(local);
        const information = await stat(file);
        if (!information.isFile() || information.size > maxBytes) {
            throw new Error(`Resource exceeds the ${maxBytes}-byte limit: ${resource}`);
        }
        const buffer = await readFile(file);
        assertResourceSize(buffer.length, maxBytes, resource);
        return buffer;
    }
    if (resource.protocol === 'data:') {
        const match = resource.href.match(/^data:([^,]*),(.*)$/s);
        if (!match) {
            throw new Error(`Invalid data URL in the Inter source CSS.`);
        }

        const [, metadata, payload] = match;
        // Bound the encoded form before decoding it into another in-memory representation.
        if (payload.length > maxBytes * 4 + 16) {
            throw new Error(`Resource exceeds the ${maxBytes}-byte limit: data URL`);
        }
        const decoded = decodeURIComponent(payload);
        const buffer = metadata.split(';').includes('base64')
            ? Buffer.from(decoded, 'base64')
            : Buffer.from(decoded, 'utf8');
        assertResourceSize(buffer.length, maxBytes, 'data URL');
        return buffer;
    }
    if (!['http:', 'https:'].includes(resource.protocol)) {
        throw new Error(`Unsupported resource protocol: ${resource.protocol}`);
    }

    const response = await fetch(resource, {
        headers: { 'user-agent': `drake-fork-assets/${INTER_VERSION}` },
        redirect: 'follow',
        signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
        throw new Error(`Unable to fetch ${resource}: HTTP ${response.status}`);
    }
    const finalUrl = new URL(response.url);
    if (
        (resource.protocol === 'https:' && finalUrl.protocol !== 'https:') ||
        (allowedOrigin && finalUrl.origin !== allowedOrigin)
    ) {
        await response.body?.cancel();
        throw new Error(`Unexpected redirect while fetching ${resource}: ${finalUrl}`);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength !== null) {
        if (!/^\d+$/.test(contentLength)) {
            await response.body?.cancel();
            throw new Error(`Invalid Content-Length while fetching ${resource}.`);
        }
        assertResourceSize(Number(contentLength), maxBytes, resource);
    }
    if (!response.body) {
        throw new Error(`Unable to stream ${resource}.`);
    }

    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            total += value.byteLength;
            assertResourceSize(total, maxBytes, resource);
            chunks.push(Buffer.from(value));
        }
    } catch (error) {
        await reader.cancel().catch(() => {});
        throw error;
    }

    return Buffer.concat(chunks, total);
}

function assertResourceSize(size, maxBytes, resource) {
    if (!Number.isSafeInteger(size) || size > maxBytes) {
        throw new Error(`Resource exceeds the ${maxBytes}-byte limit: ${resource}`);
    }
}

function validateFont(buffer, definition, strict) {
    const actualHash = createHash('sha256').update(buffer).digest('hex');
    const valid =
        buffer.length === definition.size &&
        buffer.subarray(0, 4).toString('ascii') === 'wOF2' &&
        buffer.readUInt32BE(8) === buffer.length &&
        actualHash === definition.sha256;

    if (!valid && strict) {
        throw new Error(
            `${definition.fileName} failed integrity verification ` +
                `(expected ${definition.sha256}, received ${actualHash}).`,
        );
    }

    return valid;
}

function renderCss(faces) {
    const legal = INTER_LICENSE.split('\n')
        .map((line) => ` * ${line}`.trimEnd())
        .join('\n');
    const normal = faces.normal.toString('base64');
    const italic = faces.italic.toString('base64');

    return `/*!
 * Inter ${INTER_VERSION} variable roman and italic.
 * Generated from the official unmodified WOFF2 files; do not edit by hand.
${legal}
 */
/* @drake-fork-asset inter version=${INTER_VERSION} faces=2 normal-sha256=${FACE_DEFINITIONS.normal.sha256} italic-sha256=${FACE_DEFINITIONS.italic.sha256} */

@font-face {
    font-family: "InterVariable";
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url("data:font/woff2;base64,${normal}") format("woff2");
}

@font-face {
    font-family: "InterVariable";
    font-style: italic;
    font-weight: 100 900;
    font-display: swap;
    src: url("data:font/woff2;base64,${italic}") format("woff2");
}

@font-face {
    font-family: "Inter Fallback";
    font-style: normal;
    font-weight: 100 900;
    src: local("Arial"), local("Liberation Sans"), local("Helvetica");
    size-adjust: 107%;
    ascent-override: 90%;
    descent-override: 22%;
    line-gap-override: 0%;
}
`;
}

// Décode une déclaration unicode-range en texte de codepoints pour le subsetter.
function codepointsText(ranges) {
    const characters = [];
    for (const token of ranges.split(',').map((part) => part.trim())) {
        const match = token.match(/^U\+([0-9A-F]{1,6})(?:-([0-9A-F]{1,6}))?$/i);
        if (!match) {
            throw new Error(`Invalid unicode-range token: ${token}`);
        }
        const start = parseInt(match[1], 16);
        const end = match[2] ? parseInt(match[2], 16) : start;
        if (end < start) {
            throw new Error(`Descending unicode-range token: ${token}`);
        }
        for (let codepoint = start; codepoint <= end; codepoint++) {
            characters.push(String.fromCodePoint(codepoint));
        }
    }
    return characters.join('');
}

function renderFilesCss(subsetFiles) {
    const legal = INTER_LICENSE.split('\n')
        .map((line) => ` * ${line}`.trimEnd())
        .join('\n');
    const marker = Object.entries(subsetFiles)
        .map(([name, meta]) => `${name}-sha256=${meta.sha256}`)
        .join(' ');
    const blocks = Object.entries(subsetFiles)
        .map(
            ([name, meta]) => `@font-face {
    font-family: "InterVariable";
    font-style: ${meta.style};
    font-weight: 100 900;
    font-display: swap;
    src: url("../fonts/${name}") format("woff2");
    unicode-range: ${SUBSET_RANGES[meta.subset]};
}`,
        )
        .join('\n\n');

    return `/*!
 * Inter ${INTER_VERSION} variable roman and italic — subsetted files variant (D-022).
 * Modified Versions of the official WOFF2 files (latin and latin-ext subsets, variable
 * axes preserved); Inter declares no Reserved Font Name. Do not edit by hand.
${legal}
 */
/* @drake-fork-asset inter-files version=${INTER_VERSION} files=${Object.keys(subsetFiles).length} ${marker} */

${blocks}

@font-face {
    font-family: "Inter Fallback";
    font-style: normal;
    font-weight: 100 900;
    src: local("Arial"), local("Liberation Sans"), local("Helvetica");
    size-adjust: 107%;
    ascent-override: 90%;
    descent-override: 22%;
    line-gap-override: 0%;
}
`;
}

async function writeAtomic(file, contents) {
    await mkdir(dirname(file), { recursive: true });
    const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;

    try {
        await writeFile(temporary, contents, { mode: 0o644 });
        await rename(temporary, file);
    } finally {
        await unlink(temporary).catch(() => {});
    }
}
