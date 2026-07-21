// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · thumbnav.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-thumbnav": {
        "display": "flex",
        "flex-wrap": "wrap",
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    }
},
{
    ".drk-thumbnav": {
        "margin-left": "-15px"
    }
},
{
    ".drk-thumbnav > *": {
        "padding-left": "15px"
    },
    ".drk-thumbnav > * > *": {
        "display": "inline-block",
        "min-width": "24px",
        "min-height": "24px",
        "position": "relative"
    },
    ".drk-thumbnav > * > *::after": {
        "content": "\"\"",
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__",
        "background-image": "linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.4))",
        "transition": "opacity 0.1s ease-in-out"
    },
    ".drk-thumbnav > * > :hover::after": {
        "opacity": 0
    },
    ".drk-thumbnav > .drk-active > *::after": {
        "opacity": 0
    },
    ".drk-thumbnav-vertical": {
        "flex-direction": "column",
        "margin-left": "__DRK_RAW__0__",
        "margin-top": "-15px"
    },
    ".drk-thumbnav-vertical > *": {
        "padding-left": "__DRK_RAW__0__",
        "padding-top": "15px"
    }
},
];
