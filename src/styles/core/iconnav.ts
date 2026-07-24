// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · iconnav.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-iconnav": {
        "display": "flex",
        "flex-wrap": "wrap",
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    }
},
{
    ".drk-iconnav": {
        "margin-left": "-10px"
    }
},
{
    ".drk-iconnav > *": {
        "padding-left": "10px"
    },
    ".drk-iconnav > * > a": {
        "display": "flex",
        "align-items": "center",
        "column-gap": "0.25em",
        "line-height": 0,
        "color": palette.mutedText,
        "text-decoration": "none",
        "box-sizing": "border-box",
        "min-width": "24px",
        "min-height": "24px"
    },
    ".drk-iconnav > * > a:hover": {
        "color": palette.text
    },
    ".drk-iconnav > .drk-active > a": {
        "color": palette.text
    },
    ".drk-iconnav-vertical": {
        "flex-direction": "column",
        "margin-left": "__DRK_RAW__0__",
        "margin-top": "-10px"
    },
    ".drk-iconnav-vertical > *": {
        "padding-left": "__DRK_RAW__0__",
        "padding-top": "10px"
    }
},
];
