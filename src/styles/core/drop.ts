// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · drop.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-drop": {
        "display": "none",
        "position": "absolute",
        "z-index": 1020,
        "--drk-position-offset": "20px",
        "--drk-position-viewport-offset": "15px",
        "box-sizing": "border-box",
        "width": "300px"
    },
    ".drk-drop.drk-open": {
        "display": "block"
    },
    ".drk-drop-stack .drk-drop-grid > *": {
        "width": "100% !important"
    },
    ".drk-drop-parent-icon": {
        "margin-left": "0.25em",
        "transition": "transform 0.3s ease-out"
    },
    "[aria-expanded=\"true\"] > .drk-drop-parent-icon": {
        "transform": "rotateX(180deg)"
    }
},
];
