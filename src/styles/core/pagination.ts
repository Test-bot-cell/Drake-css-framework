// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · pagination.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-pagination": {
        "display": "flex",
        "flex-wrap": "wrap",
        "align-items": "center",
        "margin-left": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-pagination > *": {
        "flex": "none",
        "padding-left": "__DRK_RAW__0__",
        "position": "relative"
    },
    ".drk-pagination > * > *": {
        "display": "flex",
        "align-items": "center",
        "column-gap": "0.25em",
        "padding": "5px 10px",
        "color": "#999"
    },
    ".drk-pagination > * > :hover": {
        "color": "#666",
        "text-decoration": "none"
    },
    ".drk-pagination > .drk-active > *": {
        "color": "#666"
    },
    ".drk-pagination > .drk-disabled > *": {
        "color": "#999"
    },
    ".drk-pagination-next, .drk-pagination-previous": {
        "--drk-icon-width": "7px",
        "--drk-icon-height": "12px"
    }
},
];
