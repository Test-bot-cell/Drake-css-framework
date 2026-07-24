// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · alert.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-alert": {
        "position": "relative",
        "margin-bottom": "20px",
        "padding": "15px 29px 15px 15px",
        "background": palette.mutedBackground,
        "color": palette.text
    },
    "* + .drk-alert": {
        "margin-top": "20px"
    },
    ".drk-alert > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-alert-close": {
        "position": "absolute",
        "top": "20px",
        "right": "15px",
        "color": "inherit",
        "opacity": 0.4
    },
    ".drk-alert-close:first-child + *": {
        "margin-top": "__DRK_RAW__0__"
    },
    ".drk-alert-close:hover": {
        "color": "inherit",
        "opacity": 0.8
    },
    ".drk-alert-primary": {
        "background": "#d8eafc",
        "color": "#0d68c4"
    },
    ".drk-alert-success": {
        "background": "#edfbf6",
        "color": palette.successText
    },
    ".drk-alert-warning": {
        "background": "#fff6ee",
        "color": "#b45300"
    },
    ".drk-alert-danger": {
        "background": "#fef4f6",
        "color": "#dc1138"
    },
    ".drk-alert-primary a, .drk-alert-primary .drk-link": {
        "color": "#0d68c4"
    },
    ".drk-alert h1, .drk-alert h2, .drk-alert h3, .drk-alert h4, .drk-alert h5, .drk-alert h6": {
        "color": "inherit"
    },
    ".drk-alert a:not([class])": {
        "color": "inherit",
        "text-decoration": "underline"
    },
    ".drk-alert a:not([class]):hover": {
        "color": "inherit",
        "text-decoration": "underline"
    }
},
];
