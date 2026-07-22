import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = fileURLToPath(new URL('../..', import.meta.url));

// Outil d'entrée du rituel de synchronisation amont (docs/fork/UPSTREAM.md, D-023).
// Donné deux références amont, produit l'inventaire du diff classé par destination
// dans l'arbre du fork. Le classement porte exclusivement sur les CHEMINS : aucun
// contenu amont n'est lu, aucun identifiant public hérité n'est embarqué ici.
//
// Dispositions :
// - porter          : changement de source à traduire (D-012) et porter (D-013) ;
//   la ou les destinations listées existent déjà ou sont à créer (`exists`).
// - sans-objet      : artefact ou miroir que le fork ne consomme pas (dist/ amont
//   régénéré chez nous, miroir SCSS supprimé par D-013).
// - archiver        : journal amont, archivé tel quel dans docs/fork/.
// - revue-manuelle  : politique propre au fork (CI, packaging, gabarits) — décision
//   humaine requise, jamais de report automatique.

function classify(path) {
    if (path.startsWith('src/js/')) {
        return {
            disposition: 'porter',
            destinations: [path.replace(/\.js$/, '.ts')],
            motif: 'source runtime : contrepartie TypeScript stricte du fork',
        };
    }
    if (path.startsWith('src/less/components/')) {
        const name = basename(path, '.less');
        return {
            disposition: 'porter',
            destinations: [`src/styles/core/${name}.ts`, `src/styles/theme/${name}.ts`],
            motif: 'source de styles : fragments Panda core et theme du composant (D-013)',
        };
    }
    if (path.startsWith('src/less/')) {
        return {
            disposition: 'porter',
            destinations: ['src/styles/'],
            motif: 'source de styles hors composant : localisation manuelle dans src/styles/ (D-013)',
        };
    }
    if (path.startsWith('src/scss/')) {
        return {
            disposition: 'sans-objet',
            destinations: [],
            motif: 'miroir SCSS supprimé par D-013',
        };
    }
    if (path.startsWith('dist/')) {
        return {
            disposition: 'sans-objet',
            destinations: [],
            motif: 'artefact amont : le fork régénère ses propres artefacts (G9)',
        };
    }
    if (path.startsWith('tests/')) {
        return {
            disposition: 'porter',
            destinations: [path],
            motif: 'page de test : même chemin, contenu traduit par la table D-012',
        };
    }
    if (path === 'CHANGELOG.md') {
        return {
            disposition: 'archiver',
            destinations: ['docs/fork/CHANGELOG-uikit-amont.md'],
            motif: 'journal amont archivé intégralement',
        };
    }
    if (path.startsWith('.github/')) {
        return {
            disposition: 'revue-manuelle',
            destinations: [],
            motif: 'CI et gabarits propres au fork (workflow verify consolidé)',
        };
    }
    if (path === 'package.json' || path === 'pnpm-lock.yaml') {
        return {
            disposition: 'revue-manuelle',
            destinations: [],
            motif: 'packaging du fork indépendant ; dépendances épinglées (D-008)',
        };
    }
    return {
        disposition: 'revue-manuelle',
        destinations: [],
        motif: 'hors règles de classement : décision humaine requise',
    };
}

async function main() {
    const args = process.argv.slice(2);
    const outputIndex = args.indexOf('--output');
    let outputPath = null;
    if (outputIndex !== -1) {
        outputPath = args[outputIndex + 1];
        if (!outputPath) {
            throw new Error('--output exige un chemin de fichier.');
        }
        args.splice(outputIndex, 2);
    }
    const [baseRef, targetRef] = args;
    if (!baseRef || !targetRef) {
        throw new Error(
            'Usage : node build/fork/sync-scout.js <référence amont base> <référence amont cible> [--output <fichier>]',
        );
    }

    for (const ref of [baseRef, targetRef]) {
        await execFileAsync('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], {
            cwd: PROJECT_ROOT,
        }).catch(() => {
            throw new Error(`Référence introuvable localement : ${ref} (git fetch requis).`);
        });
    }

    const { stdout } = await execFileAsync(
        'git',
        ['diff', '--name-status', `${baseRef}..${targetRef}`],
        { cwd: PROJECT_ROOT, maxBuffer: 16 * 1024 * 1024 },
    );

    const entries = stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => {
            const [status, ...paths] = line.split('\t');
            const path = paths[paths.length - 1];
            const rule = classify(path);
            return {
                status,
                path,
                disposition: rule.disposition,
                motif: rule.motif,
                destinations: rule.destinations.map((destination) => ({
                    path: destination,
                    exists: existsSync(join(PROJECT_ROOT, destination)),
                })),
            };
        });

    const summary = {};
    for (const entry of entries) {
        summary[entry.disposition] = (summary[entry.disposition] ?? 0) + 1;
    }

    const report = {
        schemaVersion: 1,
        outil: 'build/fork/sync-scout.js (D-023)',
        fenetre: { base: baseRef, cible: targetRef },
        resume: summary,
        entrees: entries,
    };

    const serialized = `${JSON.stringify(report, null, 4)}\n`;
    if (outputPath) {
        await writeFile(join(PROJECT_ROOT, outputPath), serialized);
        console.log(
            `Sync scout: ${entries.length} chemins classés (${Object.entries(summary)
                .map(([key, count]) => `${key}: ${count}`)
                .join(', ')}) -> ${outputPath}`,
        );
    } else {
        process.stdout.write(serialized);
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
