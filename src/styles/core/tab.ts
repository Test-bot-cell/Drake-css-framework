// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · tab.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-tab": {
        "display": "flex",
        "flex-wrap": "wrap",
        "margin-left": "-20px",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-tab > *": {
        "flex": "none",
        "padding-left": "20px",
        "position": "relative"
    },
    ".drk-tab > * > a": {
        "display": "flex",
        "align-items": "center",
        "column-gap": "0.25em",
        "justify-content": "center",
        "padding": "5px 10px",
        "color": palette.mutedText
    },
    ".drk-tab > * > a:hover": {
        "color": palette.text,
        "text-decoration": "none"
    },
    ".drk-tab > .drk-active > a": {
        "color": palette.emphasis
    },
    ".drk-tab > .drk-disabled > a": {
        "color": palette.mutedText
    },
    ".drk-tab-left, .drk-tab-right": {
        "flex-direction": "column",
        "margin-left": "__DRK_RAW__0__"
    },
    ".drk-tab-left > *, .drk-tab-right > *": {
        "padding-left": "__DRK_RAW__0__"
    },
    ".drk-tab-left > * > a": {
        "justify-content": "left"
    },
    ".drk-tab-right > * > a": {
        "justify-content": "left"
    }
},
];
