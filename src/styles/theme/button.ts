// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · button.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-button": {
        "margin": "__DRK_RAW__0__",
        "border": "none",
        "overflow": "visible",
        "font": "inherit",
        "color": "inherit",
        "text-transform": "none",
        "-webkit-appearance": "none"
    }
},
{
    ".drk-button": {
        "border-radius": "__DRK_RAW__0__",
        "display": "inline-block",
        "box-sizing": "border-box",
        "padding": "0 30px",
        "vertical-align": "middle",
        "font-size": "0.875rem",
        "line-height": "38px",
        "text-align": "center",
        "text-decoration": "none",
        "text-transform": "uppercase",
        "transition": "0.1s ease-in-out"
    }
},
{
    ".drk-button": {
        "transition-property": "color, background-color, border-color"
    }
},
{
    ".drk-button:not(:disabled)": {
        "cursor": "pointer"
    },
    ".drk-button::-moz-focus-inner": {
        "border": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__"
    },
    ".drk-button:hover": {
        "text-decoration": "none"
    },
    ".drk-button-default": {
        "background-color": "transparent",
        "color": palette.emphasis,
        "border": "1px solid #e5e5e5"
    },
    ".drk-button-default:hover": {
        "background-color": "transparent",
        "color": palette.emphasis,
        "border-color": "#b2b2b2"
    },
    ".drk-button-default:active, .drk-button-default.drk-active": {
        "background-color": "transparent",
        "color": palette.emphasis,
        "border-color": "#999999"
    },
    ".drk-button-primary": {
        "background-color": palette.primary,
        "color": "#fff",
        "border": "1px solid transparent"
    },
    ".drk-button-primary:hover": {
        "background-color": "#0f7ae5",
        "color": "#fff"
    },
    ".drk-button-primary:active, .drk-button-primary.drk-active": {
        "background-color": "#0e6dcd",
        "color": "#fff"
    },
    ".drk-button-secondary": {
        "background-color": palette.secondary,
        "color": "#fff",
        "border": "1px solid transparent"
    },
    ".drk-button-secondary:hover": {
        "background-color": "#151515",
        "color": "#fff"
    },
    ".drk-button-secondary:active, .drk-button-secondary.drk-active": {
        "background-color": "#080808",
        "color": "#fff"
    },
    ".drk-button-danger": {
        "background-color": palette.danger,
        "color": "#fff",
        "border": "1px solid transparent"
    },
    ".drk-button-danger:hover": {
        "background-color": "#ee395b",
        "color": "#fff"
    },
    ".drk-button-danger:active, .drk-button-danger.drk-active": {
        "background-color": "#ec2147",
        "color": "#fff"
    },
    ".drk-button-default:disabled, .drk-button-primary:disabled, .drk-button-secondary:disabled, .drk-button-danger:disabled": {
        "background-color": "transparent",
        "color": palette.muted,
        "border-color": "#e5e5e5"
    },
    ".drk-button-small": {
        "padding": "0 15px",
        "line-height": "28px",
        "font-size": "0.875rem"
    },
    ".drk-button-large": {
        "padding": "0 40px",
        "line-height": "53px",
        "font-size": "0.875rem"
    },
    ".drk-button-text": {
        "padding": "__DRK_RAW__0__",
        "line-height": 1.5,
        "background": "none",
        "color": palette.emphasis,
        "position": "relative"
    },
    ".drk-button-text::before": {
        "content": "\"\"",
        "position": "absolute",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "right": "100%",
        "border-bottom": "1px solid currentColor",
        "transition": "right 0.3s ease-out"
    },
    ".drk-button-text:hover": {
        "color": palette.emphasis
    },
    ".drk-button-text:hover::before": {
        "right": "__DRK_RAW__0__"
    },
    ".drk-button-text:disabled": {
        "color": palette.muted
    },
    ".drk-button-text:disabled::before": {
        "display": "none"
    },
    ".drk-button-link": {
        "padding": "__DRK_RAW__0__",
        "line-height": 1.5,
        "background": "none",
        "color": palette.emphasis
    },
    ".drk-button-link:hover": {
        "color": palette.muted,
        "text-decoration": "none"
    },
    ".drk-button-link:disabled": {
        "color": palette.muted,
        "text-decoration": "none"
    },
    ".drk-button-group": {
        "display": "inline-flex",
        "vertical-align": "middle",
        "position": "relative"
    },
    ".drk-button-group > .drk-button:nth-child(n+2), .drk-button-group > div:nth-child(n+2) .drk-button": {
        "margin-left": "-1px"
    },
    ".drk-button-group .drk-button:hover, .drk-button-group .drk-button:focus, .drk-button-group .drk-button:active, .drk-button-group .drk-button.drk-active": {
        "position": "relative",
        "z-index": 1
    }
},
];
