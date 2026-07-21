// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · dropbar.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-dropbar": {
        "--drk-position-offset": 0,
        "--drk-position-shift-offset": 0,
        "--drk-position-viewport-offset": 0,
        "--drk-inverse": "dark",
        "width": "auto",
        "padding": "25px 15px 25px 15px",
        "background": "#fff",
        "color": palette.text
    },
    ".drk-dropbar > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-dropbar": {
            "padding-left": "30px",
            "padding-right": "30px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-dropbar": {
            "padding-left": "40px",
            "padding-right": "40px"
        }
    }
},
{
    ".drk-dropbar :focus-visible": {
        "outline-color": `${palette.emphasis} !important`
    },
    ".drk-dropbar-large": {
        "padding-top": "40px",
        "padding-bottom": "40px"
    },
    ".drk-dropbar-top": {
        "box-shadow": "0 12px 7px -6px rgba(0, 0, 0, 0.05)"
    },
    ".drk-dropbar-bottom": {
        "box-shadow": "0 -12px 7px -6px rgba(0, 0, 0, 0.05)"
    },
    ".drk-dropbar-left": {
        "box-shadow": "12px 0 7px -6px rgba(0, 0, 0, 0.05)"
    },
    ".drk-dropbar-right": {
        "box-shadow": "-12px 0 7px -6px rgba(0, 0, 0, 0.05)"
    }
},
];
