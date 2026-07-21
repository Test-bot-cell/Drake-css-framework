// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · progress.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-progress": {
        "vertical-align": "baseline",
        "display": "block",
        "width": "100%",
        "border": "__DRK_RAW__0__",
        "background-color": palette.mutedBackground,
        "margin-bottom": "20px",
        "height": "15px"
    },
    "* + .drk-progress": {
        "margin-top": "20px"
    },
    ".drk-progress::-webkit-progress-bar": {
        "background-color": "transparent"
    },
    ".drk-progress::-webkit-progress-value": {
        "background-color": palette.primary,
        "transition": "width 0.6s ease"
    },
    ".drk-progress::-moz-progress-bar": {
        "background-color": palette.primary,
        "transition": "width 0.6s ease"
    }
},
];
