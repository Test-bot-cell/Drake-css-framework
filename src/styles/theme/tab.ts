// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · tab.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-tab": {
        "display": "flex",
        "flex-wrap": "wrap",
        "margin-left": "-20px",
        "padding": "__DRK_RAW__0__",
        "list-style": "none",
        "position": "relative"
    },
    ".drk-tab::before": {
        "content": "\"\"",
        "position": "absolute",
        "bottom": "__DRK_RAW__0__",
        "left": "20px",
        "right": "__DRK_RAW__0__",
        "border-bottom": "1px solid #e5e5e5"
    },
    ".drk-tab > *": {
        "flex": "none",
        "padding-left": "20px",
        "position": "relative"
    },
    ".drk-tab > * > a": {
        "display": "flex",
        "align-items": "center",
        "column-gap": "0.25em",
        "justify-content": "center",
        "padding": "5px 10px",
        "color": "#999",
        "border-bottom": "1px solid transparent",
        "font-size": "0.875rem",
        "text-transform": "uppercase",
        "transition": "color 0.1s ease-in-out"
    },
    ".drk-tab > * > a:hover": {
        "color": "#666",
        "text-decoration": "none"
    },
    ".drk-tab > .drk-active > a": {
        "color": "#333",
        "border-color": "#1e87f0"
    },
    ".drk-tab > .drk-disabled > a": {
        "color": "#999"
    },
    ".drk-tab-bottom::before": {
        "top": "__DRK_RAW__0__",
        "bottom": "auto"
    },
    ".drk-tab-bottom > * > a": {
        "border-top": "1px solid transparent",
        "border-bottom": "none"
    },
    ".drk-tab-left, .drk-tab-right": {
        "flex-direction": "column",
        "margin-left": "__DRK_RAW__0__"
    },
    ".drk-tab-left > *, .drk-tab-right > *": {
        "padding-left": "__DRK_RAW__0__"
    },
    ".drk-tab-left::before": {
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "auto",
        "right": "__DRK_RAW__0__",
        "border-left": "1px solid #e5e5e5",
        "border-bottom": "none"
    },
    ".drk-tab-right::before": {
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "right": "auto",
        "border-left": "1px solid #e5e5e5",
        "border-bottom": "none"
    },
    ".drk-tab-left > * > a": {
        "justify-content": "left",
        "border-right": "1px solid transparent",
        "border-bottom": "none"
    },
    ".drk-tab-right > * > a": {
        "justify-content": "left",
        "border-left": "1px solid transparent",
        "border-bottom": "none"
    },
    ".drk-tab .drk-dropdown": {
        "margin-left": "30px"
    }
},
];
