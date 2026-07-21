// Émission des déclarations publiques consommateur (phase 6, gate G4 via `pnpm compile`).
// tsc --emitDeclarationOnly (tsconfig.types.json) vers dist/types/, puis :
// - réécriture de l'alias interne `drake-util` en chemin relatif consommable (tsc ne
//   réécrit pas les `paths`) ;
// - génération de l'entrée globale `drake-global.d.ts` pour les intégrations UMD
//   (`window.Drake` via <script>).
// Le répertoire est vidé avant émission : aucun fichier périmé ne survit (G9).
import { execa } from 'execa';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from './util.js';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = join(PROJECT_ROOT, 'dist/types');
const UTIL_ENTRY = join(OUTPUT, 'util/index');

await rm(OUTPUT, { recursive: true, force: true });
await execa('tsc', ['-p', 'tsconfig.types.json'], {
    cwd: PROJECT_ROOT,
    preferLocal: true,
    stdio: 'inherit',
});

const declarations = await glob(`${OUTPUT}/**/*.d.ts`);
let rewritten = 0;
for (const file of declarations) {
    const source = await readFile(file, 'utf8');
    if (!source.includes("'drake-util'")) {
        continue;
    }
    let relativeUtil = relative(dirname(file), UTIL_ENTRY).split(sep).join('/');
    if (!relativeUtil.startsWith('.')) {
        relativeUtil = `./${relativeUtil}`;
    }
    await writeFile(file, source.replaceAll("'drake-util'", `'${relativeUtil}'`));
    rewritten++;
}

await writeFile(
    join(OUTPUT, 'drake-global.d.ts'),
    `// Généré par build/types.js : entrée globale pour les intégrations UMD (<script>).
import Drake from './drake';

declare global {
    interface Window {
        Drake: typeof Drake;
    }
}

export {};
`,
);

console.log(
    `Consumer declarations written: ${declarations.length} files in dist/types ` +
        `(${rewritten} drake-util rewrite(s), global entry drake-global.d.ts).`,
);
