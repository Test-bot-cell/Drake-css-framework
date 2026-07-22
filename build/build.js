import camelize from 'camelcase';
import path from 'node:path';
import pLimit from 'p-limit';
import { args, compile, compileModules, glob } from './util.js';

const limit = pLimit(Number(process.env.cpus || 2));

const bundles = getBundleTasks();
const components = await getComponentTasks();
const buildAll =
    args.all ||
    !Object.keys(args).filter((name) => !['d', 'debug', 'nominify', 'watch', '_'].includes(name))
        .length;

if (args.h || args.help) {
    console.log(`
        usage:

        build.js [componentA, componentB, ...] [-d|debug|nominify|watch]

        examples:

        build.js // builds all of drake and its components, including minification (implies 'all')
        build.js drake tests -d // builds drake and the test harness without minification
        build.js core lightbox -d // builds drake-core and the lightbox, skipping the minification

        available components:

        bundles: ${Object.keys(bundles).join(', ')}
        components: ${Object.keys(components).join(', ')}

    `);
    process.exit(0);
}

let tasks;
const allTasks = { ...bundles, ...components };
if (buildAll) {
    tasks = allTasks;
} else if (args.components) {
    tasks = components;
} else {
    tasks = Object.keys(args)
        .map((step) => allTasks[step])
        .filter((t) => t);
}

await Promise.all(Object.values(tasks).map((task) => limit(task)));

function getBundleTasks() {
    return {
        core: () =>
            compile('src/js/drake-core.ts', 'dist/js/drake-core', { formats: ['umd', 'es'] }),

        drake: () => compile('src/js/drake.ts', 'dist/js/drake', { formats: ['umd', 'es'] }),

        // Source ESM des utilitaires pour les composants (D-025 §1) : pas d'UMD,
        // `Drake.util` reste porté par les bundles historiques.
        'drake-util': () =>
            compile('src/js/util/index.ts', 'dist/js/drake-util', { formats: ['es'] }),

        // Arborescence de modules préservés (D-025 §1) : le tree-shaking réel.
        esm: () => compileModules(['src/js/drake.ts', 'src/js/drake-core.ts'], 'dist/esm'),

        tests: async () =>
            compile('tests/js/index.ts', 'dist/js/tests/test', {
                name: 'test',
                virtualModules: { 'virtual:tests': await getTestFiles() },
            }),
    };
}

async function getComponentTasks() {
    const components = {};

    const files = await glob('src/js/components/*.ts', ['**/index.ts']);

    for (const file of files) {
        const name = path.basename(file, path.extname(file));

        components[name] = () =>
            compile('src/js/component.ts', `dist/js/components/${name}`, {
                name,
                external: ['drake', 'drake-util'],
                globals: { drake: 'Drake', 'drake-util': 'Drake.util' },
                formats: ['umd', 'es'],
                // En ESM, les externes se résolvent en voisins de fichiers (D-025 §1) :
                // aucune seconde instance de Drake n'est embarquée dans les composants.
                esmPaths: { drake: './../drake.esm.js', 'drake-util': './../drake-util.esm.js' },
                aliases: { component: path.resolve('src/js/components', `${name}.ts`) },
                virtualModules: { 'virtual:name': `'${camelize(name)}'` },
            });
    }

    return components;
}

async function getTestFiles() {
    const files = await glob('tests/*.html', ['**/index.html']);
    return JSON.stringify(files.sort().map((file) => path.basename(file, '.html')));
}
