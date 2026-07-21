// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · slidenav.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-slidenav": {
        "--drk-icon-width": "14px",
        "--drk-icon-height": "24px",
        "padding": "5px 10px",
        "color": "rgba(102, 102, 102, 0.5)"
    },
    ".drk-slidenav:hover": {
        "color": "rgba(102, 102, 102, 0.9)"
    },
    ".drk-slidenav:active": {
        "color": "rgba(102, 102, 102, 0.5)"
    },
    ".drk-slidenav-large": {
        "--drk-icon-width": "25px",
        "--drk-icon-height": "40px",
        "padding": "10px 10px"
    },
    ".drk-slidenav-container": {
        "display": "flex"
    }
},
];
