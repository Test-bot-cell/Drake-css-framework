// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · thumbnav.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-thumbnav": {
        "display": "flex",
        "flex-wrap": "wrap",
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    }
},
{
    ".drk-thumbnav": {
        "margin-left": "-15px"
    }
},
{
    ".drk-thumbnav > *": {
        "padding-left": "15px"
    },
    ".drk-thumbnav > * > *": {
        "display": "inline-block",
        "min-width": "24px",
        "min-height": "24px"
    },
    ".drk-thumbnav-vertical": {
        "flex-direction": "column",
        "margin-left": "__DRK_RAW__0__",
        "margin-top": "-15px"
    },
    ".drk-thumbnav-vertical > *": {
        "padding-left": "__DRK_RAW__0__",
        "padding-top": "15px"
    }
},
];
