import alias from '@rollup/plugin-alias';
import { transform } from 'lightningcss';
import minimist from 'minimist';
import fs from 'node:fs/promises';
import path from 'node:path';
import { styleText } from 'node:util';
import pLimit from 'p-limit';
import { rollup, watch as rollupWatch } from 'rollup';
import { default as esbuild, minify as esbuildMinify } from 'rollup-plugin-esbuild';
import { optimize } from 'svgo';

const limit = pLimit(Number(process.env.cpus || 2));
const COPYRIGHT_END_YEAR = 2026;

// Keep generated output byte-for-byte stable. A reviewed legal update may advance this year.
export const banner = `/*! Drake.css framework ${await getVersion()} | MIT License | based on UIkit, (c) 2014 - ${COPYRIGHT_END_YEAR} YOOtheme (https://getuikit.com) */\n`;

const argv = minimist(process.argv.slice(2));

argv._.forEach((arg) => {
    const tokens = arg.split('=');
    argv[tokens[0]] = tokens[1] || true;
});

export const args = argv;

export function read(file) {
    return fs.readFile(file, 'utf8');
}

export async function write(dest, data) {
    await fs.mkdir(path.dirname(dest), { recursive: true });

    await fs.writeFile(dest, data);
    await logFile(dest);

    return dest;
}

export async function glob(pattern, exclude = []) {
    return Array.fromAsync(fs.glob(pattern, { exclude }));
}

export async function logFile(file) {
    const { size } = await fs.stat(file);
    console.log(`${styleText(['cyan', 'bold'], file)} ${formatSize(size)}`);
}

export async function minify(file) {
    const styles = await limit(async () => {
        const source = await read(file);
        // Lightning CSS supprime tous les commentaires : les bannières légales de tête
        // (/*! … */) sont extraites puis re-préfixées à la sortie minifiée (D-015).
        const banners = source.match(/^(?:\/\*![\s\S]*?\*\/\s*)+/)?.[0] ?? '';
        const { code } = transform({
            filename: file,
            code: Buffer.from(source),
            minify: true,
        });
        return `${banners.trimEnd()}${banners ? '\n' : ''}${code.toString()}`;
    });

    await write(`${path.join(path.dirname(file), path.basename(file, '.css'))}.min.css`, styles);

    return styles;
}

export async function compile(
    file,
    dest,
    { external, globals, name, aliases, virtualModules, formats = ['umd'], esmPaths } = {},
) {
    const minify = !args.nominify;
    const debug = args.d || args.debug;
    const log = args.l || args.log;
    const watch = args.w || args.watch;

    name = (name || '').replace(/\W/g, '_');

    const inputOptions = {
        external,
        input: file,
        plugins: [
            virtualModulesPlugin({
                'virtual:version': `'${await getVersion()}'`,
                'virtual:log': String(!!log),
                ...virtualModules,
            }),

            alias({
                entries: {
                    'drake-util': path.resolve('./src/js/util/index.ts'),
                    ...aliases,
                },
            }),

            svgPlugin(),

            esbuild({
                target: 'safari12',
                sourceMap: !!debug,
                minify: false,
                supported: { 'template-literal': true, destructuring: true },
            }),

            !debug && trimWhitespacePlugin(),
        ],
    };

    const outputOptions = {
        globals,
        banner,
        format: 'umd',
        amd: { id: `Drake${name}`.toLowerCase() },
        name: `Drake${ucfirst(name)}`,
        sourcemap: debug ? 'inline' : false,
    };

    const output = [];

    if (formats.includes('umd')) {
        output.push({
            ...outputOptions,
            file: `${dest}.js`,
        });

        if (minify) {
            output.push({
                ...outputOptions,
                file: `${dest}.min.js`,
                plugins: [minifyPlugin(debug)],
            });
        }
    }

    // Sortie ESM (D-025 §1) : même graphe, même bannière, format 'es'. `esmPaths`
    // réécrit les identifiants externes vers des fichiers voisins ; la variante
    // minifiée pointe vers les voisins minifiés pour qu'une page ne charge jamais
    // deux exemplaires (min + non-min) du même module.
    if (formats.includes('es')) {
        const esmOutputOptions = {
            banner,
            format: 'es',
            sourcemap: debug ? 'inline' : false,
        };

        output.push({
            ...esmOutputOptions,
            file: `${dest}.esm.js`,
            paths: esmPaths,
        });

        if (minify) {
            output.push({
                ...esmOutputOptions,
                file: `${dest}.esm.min.js`,
                paths: minifiedPaths(esmPaths),
                plugins: [minifyPlugin(debug)],
            });
        }
    }

    if (!watch) {
        const bundle = await rollup(inputOptions);

        for (const options of output) {
            await limit(() => bundle.write(options));
            logFile(options.file);
        }

        await bundle.close();
    } else {
        console.log('Drake is watching the files...');

        const watcher = rollupWatch({
            ...inputOptions,
            output,
        });

        watcher.on('event', ({ code, result, output, error }) => {
            if (result) {
                result.close();
            }
            if (code === 'BUNDLE_END' && output) {
                output.map(logFile);
            }
            if (error) {
                console.error(error);
            }
        });

        return watcher;
    }
}

// Modules préservés (D-025 §1) : un seul graphe Rollup multi-entrées, émis fichier
// par fichier (imports relatifs avec extension .js, compatibles Node), non minifié,
// bannière légale sur les entrées seulement.
export async function compileModules(files, dest) {
    const debug = args.d || args.debug;
    const log = args.l || args.log;
    const watch = args.w || args.watch;

    const inputOptions = {
        input: files,
        plugins: [
            virtualModulesPlugin({
                'virtual:version': `'${await getVersion()}'`,
                'virtual:log': String(!!log),
            }),

            alias({
                entries: {
                    'drake-util': path.resolve('./src/js/util/index.ts'),
                },
            }),

            svgPlugin(),

            esbuild({
                target: 'safari12',
                sourceMap: !!debug,
                minify: false,
                supported: { 'template-literal': true, destructuring: true },
            }),

            !debug && trimWhitespacePlugin(),

            {
                // Le champ type ne peut pas vivre à la racine du paquet (il ferait
                // interpréter les bundles UMD comme des modules ES) : ce manifeste
                // local rend dist/esm/ nativement ESM pour Node, sans re-parse.
                name: 'esm-package-type',
                generateBundle() {
                    this.emitFile({
                        type: 'asset',
                        fileName: 'package.json',
                        source: `${JSON.stringify({ type: 'module' }, null, 4)}\n`,
                    });
                },
            },
        ],
    };

    const output = [
        {
            dir: dest,
            format: 'es',
            preserveModules: true,
            preserveModulesRoot: 'src/js',
            entryFileNames: '[name].js',
            sourcemap: debug ? 'inline' : false,
            banner: (chunk) => (chunk.isEntry ? banner : ''),
        },
    ];

    if (!watch) {
        const bundle = await rollup(inputOptions);

        for (const options of output) {
            const { output: chunks } = await limit(() => bundle.write(options));
            for (const chunk of chunks) {
                if (chunk.isEntry) {
                    logFile(path.join(options.dir, chunk.fileName));
                }
            }
        }

        await bundle.close();
    } else {
        console.log('Drake is watching the files...');

        const watcher = rollupWatch({
            ...inputOptions,
            output,
        });

        watcher.on('event', ({ code, result, error }) => {
            if (result) {
                result.close();
            }
            if (code === 'BUNDLE_END') {
                console.log(`${styleText(['cyan', 'bold'], dest)} updated`);
            }
            if (error) {
                console.error(error);
            }
        });

        return watcher;
    }
}

function trimWhitespacePlugin() {
    return {
        name: 'trim-whitespace',
        transform(source) {
            return source.replaceAll(/(?<=>)\n\s+|\n\s+(?=<)/g, '  ');
        },
    };
}

function minifyPlugin(debug) {
    return debug
        ? undefined
        : esbuildMinify({
              target: 'safari12',
              supported: { 'template-literal': true, destructuring: true },
          });
}

function minifiedPaths(paths) {
    return (
        paths &&
        Object.fromEntries(
            Object.entries(paths).map(([id, target]) => [
                id,
                target.replace(/\.esm\.js$/, '.esm.min.js'),
            ]),
        )
    );
}

function ucfirst(str) {
    return str.length ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export async function getVersion() {
    return JSON.parse(await fs.readFile('package.json', 'utf8')).version;
}

export async function replaceInFile(file, fn) {
    await write(file, await fn(await read(file)));
}

function formatSize(bytes) {
    return `${(bytes / 1024).toFixed(2)}kb`;
}

async function optimizeSvg(svg) {
    const options = {
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        cleanupNumericValues: {
                            floatPrecision: 3,
                        },
                        convertPathData: false,
                        convertShapeToPath: false,
                        mergePaths: false,
                        minifyStyles: false,
                        removeUnknownsAndDefaults: false,
                        removeUselessStrokeAndFill: false,
                        sortAttrs: {
                            order: [
                                'id',
                                'width',
                                'height',
                                'fill',
                                'stroke',
                                'x',
                                'y',
                                'x1',
                                'y1',
                                'x2',
                                'y2',
                                'cx',
                                'cy',
                                'r',
                                'marker',
                                'd',
                                'points',
                            ],
                        },
                    },
                },
            },
            'removeXMLNS',
            'removeXlink',
            {
                name: 'removeAttributesBySelector',
                params: {
                    selector: 'svg',
                    attributes: ['id', 'version'],
                },
            },
            {
                name: 'removeAttributesBySelector',
                params: {
                    selector: '*',
                    attributes: ['data-name'],
                },
            },
        ],
    };

    return (await optimize(svg, options)).data;
}

// @see https:rollupjs.org/plugin-development/#conventions for the \0 prefix convention
function virtualModulesPlugin(map) {
    return {
        name: 'virtual-modules',

        resolveId(id) {
            if (id in map) {
                return '\0' + id;
            }
        },

        load(id) {
            if (id.startsWith('\0')) {
                const key = id.slice(1);
                if (key in map) {
                    return `export default ${map[key]};`;
                }
            }
        },
    };
}

function svgPlugin() {
    return {
        name: 'svg-import',

        transform: async (code, id) => {
            if (!id.endsWith('.svg')) {
                return;
            }

            return {
                code: `export default ${JSON.stringify(await optimizeSvg(code))};`,
                map: { mappings: '' },
            };
        },
    };
}
