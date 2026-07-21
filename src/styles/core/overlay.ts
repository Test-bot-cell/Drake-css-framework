// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · overlay.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-overlay": {
        "padding": "30px 30px"
    },
    ".drk-overlay > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-overlay-icon": {
        "--drk-icon-width": "40px",
        "--drk-icon-height": "40px"
    },
    ".drk-overlay-default": {
        "--drk-inverse": "dark",
        "background": "rgba(255, 255, 255, 0.9)"
    },
    ".drk-overlay-primary": {
        "--drk-inverse": "light",
        "background": "rgba(34, 34, 34, 0.9)"
    }
},
];
