// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · tooltip.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-tooltip": {
        "display": "none",
        "position": "absolute",
        "z-index": 1030,
        "--drk-position-offset": "10px",
        "--drk-position-viewport-offset": 10,
        "top": "__DRK_RAW__0__",
        "box-sizing": "border-box",
        "max-width": "200px",
        "padding": "3px 6px",
        "background": "#666",
        "border-radius": "2px",
        "color": "#fff",
        "font-size": "12px"
    },
    ".drk-tooltip.drk-active": {
        "display": "block"
    }
},
];
