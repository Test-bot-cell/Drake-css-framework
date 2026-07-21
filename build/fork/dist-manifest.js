import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST_ROOT = join(PROJECT_ROOT, 'dist');
const OUTPUT = join(DIST_ROOT, 'fork-manifest.json');
const check = process.argv.slice(2).includes('--check');
const unknown = process.argv.slice(2).filter((argument) => argument !== '--check');

if (unknown.length) {
    throw new Error(`Unknown argument: ${unknown[0]}`);
}

const files = (await walk(DIST_ROOT))
    .filter(
        (file) =>
            ['.css', '.js', '.woff2'].includes(extname(file)) &&
            !relative(PROJECT_ROOT, file).startsWith('dist/js/tests/'),
    )
    .sort((left, right) => left.localeCompare(right, 'en'));
const entries = [];

for (const file of files) {
    const contents = await readFile(file);
    entries.push({
        path: relative(PROJECT_ROOT, file),
        bytes: contents.byteLength,
        sha256: createHash('sha256').update(contents).digest('hex'),
    });
}

const output = `${JSON.stringify({ schemaVersion: 1, files: entries }, null, 4)}\n`;

if (check) {
    const current = await readFile(OUTPUT, 'utf8').catch(() => '');
    if (current !== output) {
        throw new Error('dist/fork-manifest.json does not match the generated package outputs.');
    }
    console.log(`Distribution manifest check passed: ${entries.length} files.`);
} else {
    await writeFile(OUTPUT, output, 'utf8');
    console.log(`Distribution manifest written: ${entries.length} files.`);
}

async function walk(directory) {
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await walk(file)));
        } else if (entry.isFile()) {
            files.push(file);
        }
    }
    return files;
}
