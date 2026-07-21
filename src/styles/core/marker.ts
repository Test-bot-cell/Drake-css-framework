// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · marker.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-marker": {
        "--drk-icon-width": "20px",
        "--drk-icon-height": "20px",
        "padding": "5px",
        "background": palette.secondary,
        "color": "#fff"
    },
    ".drk-marker:hover": {
        "color": "#fff"
    }
},
];
