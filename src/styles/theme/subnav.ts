// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · subnav.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-subnav": {
        "display": "flex",
        "flex-wrap": "wrap",
        "align-items": "center",
        "margin-left": "-20px",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-subnav > *": {
        "flex": "none",
        "padding-left": "20px",
        "position": "relative"
    },
    ".drk-subnav > * > :first-child": {
        "display": "flex",
        "align-items": "center",
        "column-gap": "0.25em",
        "color": palette.muted,
        "font-size": "0.875rem",
        "text-transform": "uppercase",
        "transition": "0.1s ease-in-out"
    }
},
{
    ".drk-subnav > * > :first-child": {
        "transition-property": "color, background-color"
    }
},
{
    ".drk-subnav > * > a:hover": {
        "color": palette.text,
        "text-decoration": "none"
    },
    ".drk-subnav > .drk-active > a": {
        "color": palette.emphasis
    },
    ".drk-subnav-divider": {
        "margin-left": "-41px"
    },
    ".drk-subnav-divider > *": {
        "display": "flex",
        "align-items": "center"
    },
    ".drk-subnav-divider > ::before": {
        "content": "\"\"",
        "height": "1.5em",
        "margin-left": "0px",
        "margin-right": "20px",
        "border-left": "1px solid transparent"
    },
    ".drk-subnav-divider > :nth-child(n+2):not(.drk-first-column)::before": {
        "border-left-color": "#e5e5e5"
    },
    ".drk-subnav-pill": {
        "margin-left": "-20px"
    },
    ".drk-subnav-pill > *": {
        "padding-left": "20px"
    },
    ".drk-subnav-pill > * > :first-child": {
        "padding": "5px 10px",
        "background": "transparent",
        "color": palette.muted
    },
    ".drk-subnav-pill > * > a:hover": {
        "background-color": palette.mutedBackground,
        "color": palette.text
    },
    ".drk-subnav-pill > * > a:active": {
        "background-color": palette.mutedBackground,
        "color": palette.text
    },
    ".drk-subnav-pill > .drk-active > a": {
        "background-color": palette.primary,
        "color": "#fff"
    },
    ".drk-subnav > .drk-disabled > :first-child": {
        "color": palette.muted
    }
},
];
