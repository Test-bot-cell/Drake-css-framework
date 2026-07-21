// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · label.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-label": {
        "display": "inline-block",
        "padding": "0 10px",
        "background": palette.primary,
        "line-height": 1.5,
        "font-size": "0.875rem",
        "color": "#fff",
        "vertical-align": "middle",
        "white-space": "nowrap"
    },
    ".drk-label-success": {
        "background-color": palette.success,
        "color": "#fff"
    },
    ".drk-label-warning": {
        "background-color": palette.warning,
        "color": "#fff"
    },
    ".drk-label-danger": {
        "background-color": palette.danger,
        "color": "#fff"
    }
},
];
