// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · label.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-label": {
        "display": "inline-block",
        "padding": "0 10px",
        "background": "#1e87f0",
        "line-height": 1.5,
        "font-size": "0.875rem",
        "color": "#fff",
        "vertical-align": "middle",
        "white-space": "nowrap",
        "border-radius": "2px",
        "text-transform": "uppercase"
    },
    ".drk-label-success": {
        "background-color": "#32d296",
        "color": "#fff"
    },
    ".drk-label-warning": {
        "background-color": "#faa05a",
        "color": "#fff"
    },
    ".drk-label-danger": {
        "background-color": "#f0506e",
        "color": "#fff"
    }
},
];
