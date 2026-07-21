import fs from 'node:fs';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import rtlcss from 'rtlcss';
import { args, banner, minify, read, renderLess, write } from './util.js';

const { rtl } = args;
const develop = args.develop || args.debug || args.d || args.nominify;
const sources = [
    { src: 'src/less/drake.less', dist: `dist/css/drake-core${rtl ? '-rtl' : ''}.css` },
    { src: 'src/less/drake.theme.less', dist: `dist/css/drake${rtl ? '-rtl' : ''}.css` },
];

const themes = fs.existsSync('themes.json') ? JSON.parse(await read('themes.json')) : {};

for await (const src of glob('custom/*.less')) {
    const theme = path.basename(src, '.less');
    const dist = `dist/css/drake.${theme}${rtl ? '-rtl' : ''}.css`;

    themes[theme] = { css: `../${dist}` };

    sources.push({ src, dist });
}

await Promise.all(sources.map(({ src, dist }) => compile(src, dist, develop, rtl)));

if (!rtl && (Object.keys(themes).length || !fs.existsSync('themes.json'))) {
    await write('themes.json', JSON.stringify(themes));
}

async function compile(file, dist, develop, rtl) {
    const less = await read(file);

    let output = (
        await renderLess(less, {
            rewriteUrls: 'all',
            rootpath: '../../',
            paths: ['src/less/', 'custom/'],
        })
    ).replace(/\.\.\/dist\//g, '');

    if (rtl) {
        output = rtlcss.process(
            output,
            {
                stringMap: [
                    {
                        name: 'previous-next',
                        priority: 100,
                        search: ['previous', 'Previous', 'PREVIOUS'],
                        replace: ['next', 'Next', 'NEXT'],
                        options: {
                            scope: '*',
                            ignoreCase: false,
                        },
                    },
                ],
            },
            [
                {
                    name: 'customNegate',
                    priority: 50,
                    directives: {
                        control: {},
                        value: [],
                    },
                    processors: [
                        {
                            expr: ['--drk-position-translate-x', 'stroke-dashoffset'].join('|'),
                            action(prop, value, context) {
                                return { prop, value: context.util.negate(value) };
                            },
                        },
                    ],
                },
            ],
            {
                pre(root, postcss) {
                    root.prepend(postcss.comment({ text: 'rtl:begin:rename' }));
                    root.append(postcss.comment({ text: 'rtl:end:rename' }));
                },
            },
        );
    }

    await write(dist, banner + output);

    if (!develop) {
        await minify(dist);
    }
}
