import { defineConfig } from '@pandacss/dev';

import { breakpoints, tokens } from './src/styles/tokens';

// Configuration Panda.css du framework Drake.css (D-013).
// La cascade est portée par les fragments ordonnés de src/styles/{core,theme} ;
// build/panda.js les sérialise via le moteur Panda pour produire dist/css/drake*.css.
export default defineConfig({
    preflight: false,
    eject: true,
    presets: [],
    include: [],
    outdir: '.cache/styled-system',
    theme: {
        breakpoints,
        tokens,
    },
    hooks: {
        // La cascade héritée exige une fidélité règle à règle : on neutralise la passe
        // d'optimisation (fusion de règles adjacentes, suppression de doublons) qui
        // altérerait l'ordre et la forme de la feuille historique.
        'css:optimize': ({ css }) => css,
    },
    globalVars: {
        '--drk-overflow-fade-start-opacity': {
            syntax: '<number>',
            inherits: false,
            initialValue: '0',
        },
        '--drk-overflow-fade-end-opacity': {
            syntax: '<number>',
            inherits: false,
            initialValue: '0',
        },
    },
});
