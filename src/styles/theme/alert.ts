// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · alert.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-alert": {
        "position": "relative",
        "margin-bottom": "20px",
        "padding": "15px 29px 15px 15px",
        "background": "#f8f8f8",
        "color": "#666"
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
        "color": "#1e87f0"
    },
    ".drk-alert-success": {
        "background": "#edfbf6",
        "color": "#32d296"
    },
    ".drk-alert-warning": {
        "background": "#fff6ee",
        "color": "#faa05a"
    },
    ".drk-alert-danger": {
        "background": "#fef4f6",
        "color": "#f0506e"
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
