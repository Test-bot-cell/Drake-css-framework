// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · pagination.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

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
        "color": palette.muted,
        "transition": "color 0.1s ease-in-out",
        "box-sizing": "border-box",
        "min-height": "24px",
        "min-width": "24px"
    },
    ".drk-pagination > * > :hover": {
        "color": palette.text,
        "text-decoration": "none"
    },
    ".drk-pagination > .drk-active > *": {
        "color": palette.text
    },
    ".drk-pagination > .drk-disabled > *": {
        "color": palette.muted
    },
    ".drk-pagination-next, .drk-pagination-previous": {
        "--drk-icon-width": "7px",
        "--drk-icon-height": "12px"
    }
},
];
