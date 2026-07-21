// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · dropbar.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-dropbar": {
        "--drk-position-offset": 0,
        "--drk-position-shift-offset": 0,
        "--drk-position-viewport-offset": 0,
        "--drk-inverse": "dark",
        "width": "auto",
        "padding": "15px 15px 15px 15px",
        "background": "#f8f8f8",
        "color": "#666"
    },
    ".drk-dropbar > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-dropbar": {
            "padding-left": "30px",
            "padding-right": "30px"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-dropbar": {
            "padding-left": "40px",
            "padding-right": "40px"
        }
    }
},
{
    ".drk-dropbar :focus-visible": {
        "outline-color": "#333 !important"
    },
    ".drk-dropbar-large": {
        "padding-top": "40px",
        "padding-bottom": "40px"
    }
},
];
