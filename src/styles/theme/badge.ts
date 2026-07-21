// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · badge.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-badge": {
        "box-sizing": "border-box",
        "min-width": "18px",
        "height": "18px",
        "padding": "0 5px",
        "border-radius": "500px",
        "vertical-align": "middle",
        "background": palette.primary,
        "color": "#fff !important",
        "font-size": "11px",
        "display": "inline-flex",
        "justify-content": "center",
        "align-items": "center",
        "line-height": 0
    },
    ".drk-badge:hover": {
        "text-decoration": "none"
    }
},
];
