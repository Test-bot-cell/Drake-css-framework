// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · marker.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-marker": {
        "--drk-icon-width": "20px",
        "--drk-icon-height": "20px",
        "padding": "5px",
        "background": "#222",
        "color": "#fff"
    },
    ".drk-marker:hover": {
        "color": "#fff"
    }
},
];
