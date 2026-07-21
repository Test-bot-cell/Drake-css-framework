import { loadConfigAndCreateContext } from '@pandacss/node';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import postcss from 'postcss';
import rtlcss from 'rtlcss';
import { args, banner, minify, write } from './util.js';

const { rtl } = args;
const develop = args.develop || args.debug || args.d || args.nominify;

const sources = [
    { entry: 'src/styles/core/index.ts', dist: `dist/css/drake-core${rtl ? '-rtl' : ''}.css` },
    { entry: 'src/styles/theme/index.ts', dist: `dist/css/drake${rtl ? '-rtl' : ''}.css` },
];

await build({
    entryPoints: sources.map(({ entry }) => entry),
    outdir: '.cache/panda-build',
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    entryNames: '[dir]',
    outExtension: { '.js': '.mjs' },
});

const ctx = await loadConfigAndCreateContext({ cwd: process.cwd() });

for (const { entry, dist } of sources) {
    const variant = entry.split('/')[2];
    const { styles, tablerBanner } = await import(
        pathToFileURL(`.cache/panda-build/${variant}.mjs`).href
    );

    const sheet = ctx.createSheet();
    for (const fragment of styles) {
        sheet.processGlobalCss(fragment);
    }

    // getLayerCss('base') sérialise la couche sans le tri global des media queries de
    // toCss(), qui déplacerait les @media en fin de feuille et altérerait la cascade.
    let output = unwrapBaseLayer(sheet.getLayerCss('base'));
    // Sentinelle des valeurs sans unité hors liste « unitless » du sérialiseur
    // (voir src/styles) : restitue la valeur nue, sans « px » ajouté.
    output = output.replace(/__DRK_RAW__(-?[\d.]+)__(?:px)?/g, '$1');
    // Restitue la forme historique « \@ » des breakpoints échappés (voir src/styles).
    output = output.replace(/\\40 /g, '\\@');

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

    // La bannière légale Tabler (masques embarqués) doit survivre dans chaque feuille.
    await write(dist, banner + tablerBanner + output);

    if (!develop) {
        await minify(dist);
    }
}

// La cascade Drake vit entière dans une seule couche : le wrapper @layer base du
// sérialiseur Panda est retiré pour conserver la spécificité de la feuille historique.
function unwrapBaseLayer(css) {
    const root = postcss.parse(css);
    root.walkAtRules('layer', (atRule) => {
        if (atRule.params === 'base') {
            if (atRule.nodes?.length) {
                atRule.replaceWith(...atRule.nodes);
            } else {
                atRule.remove();
            }
        }
    });
    // globalVars est ré-émis par fragment : une seule déclaration @property par propriété.
    const seenProperties = new Set();
    root.walkAtRules('property', (atRule) => {
        if (seenProperties.has(atRule.params)) {
            atRule.remove();
        } else {
            seenProperties.add(atRule.params);
        }
    });
    return root.toString();
}
