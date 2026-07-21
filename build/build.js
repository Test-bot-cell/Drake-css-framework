import camelize from 'camelcase';
import path from 'node:path';
import pLimit from 'p-limit';
import { args, compile, glob } from './util.js';

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

        build.js // builds all of uikit and its components, including minification (implies 'all')
        build.js uikit tests -d // builds uikit and the test harness without minification
        build.js core lightbox -d // builds uikit-core and the lightbox, skipping the minification

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
        core: () => compile('src/js/uikit-core.ts', 'dist/js/uikit-core'),

        uikit: () => compile('src/js/uikit.ts', 'dist/js/uikit'),

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
                external: ['uikit', 'uikit-util'],
                globals: { uikit: 'UIkit', 'uikit-util': 'UIkit.util' },
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
