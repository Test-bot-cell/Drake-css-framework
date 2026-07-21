// Gate G7 — matrice de compatibilité C0-C3 (D-012).
// Orchestre : snapshots structurels du catalogue (C0/C1, LTR+RTL), scénarios
// d'interaction (C2) et boucle API programmatique (C3).
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));

const stages = [
    { label: 'Sans runtime — attentes du HTML initial', script: 'build/fork/compat-noruntime.js' },
    { label: 'C0/C1 — snapshots du catalogue (LTR/RTL)', script: 'build/fork/compat-snapshot.js' },
    { label: 'C2 — scénarios d’interaction', script: 'build/fork/compat-scenarios.js' },
    { label: 'C3 — boucle API programmatique', script: 'build/fork/compat-api.js' },
];

let failed = false;
for (const { label, script } of stages) {
    try {
        const { stdout, stderr } = await execFileAsync(process.execPath, [script], {
            cwd: PROJECT_ROOT,
            encoding: 'utf8',
            maxBuffer: 16 * 1024 * 1024,
        });
        const summary = `${stdout}\n${stderr}`.trim().split('\n').filter(Boolean).at(-1);
        console.log(`G7 ${label}: ${summary}`);
    } catch (error) {
        failed = true;
        console.error(`G7 ${label}: ÉCHEC`);
        console.error((error.stdout || '') + (error.stderr || error.message));
    }
}

if (failed) {
    console.error('Compat matrix check failed (G7).');
    process.exit(1);
}
console.log('Compat matrix check passed (G7): C0-C3 conformes à la référence D-012.');
