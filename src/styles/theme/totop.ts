// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · totop.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-totop": {
        "--drk-icon-width": "18px",
        "--drk-icon-height": "10px",
        "padding": "5px",
        "color": "#999",
        "transition": "color 0.1s ease-in-out"
    },
    ".drk-totop:hover": {
        "color": "#666"
    },
    ".drk-totop:active": {
        "color": "#333"
    }
},
];
