// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · button.less) ; maintenue à la main désormais.
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
        "font-size": "16px",
        "line-height": "40px",
        "text-align": "center",
        "text-decoration": "none"
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
        "background-color": palette.mutedBackground,
        "color": palette.emphasis
    },
    ".drk-button-default:hover": {
        "background-color": "#ebebeb",
        "color": palette.emphasis
    },
    ".drk-button-default:active, .drk-button-default.drk-active": {
        "background-color": "#dfdfdf",
        "color": palette.emphasis
    },
    ".drk-button-primary": {
        "background-color": palette.primary,
        "color": "#fff"
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
        "color": "#fff"
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
        "color": "#fff"
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
        "background-color": palette.mutedBackground,
        "color": palette.mutedText
    },
    ".drk-button-small": {
        "padding": "0 15px",
        "line-height": "30px",
        "font-size": "0.875rem"
    },
    ".drk-button-large": {
        "padding": "0 40px",
        "line-height": "55px",
        "font-size": "1.25rem"
    },
    ".drk-button-text": {
        "padding": "3px 0 0",
        "margin-top": "-3px",
        "line-height": 1.5,
        "background": "none",
        "color": palette.emphasis
    },
    ".drk-button-text:hover": {
        "color": palette.mutedText
    },
    ".drk-button-text:disabled": {
        "color": palette.mutedText
    },
    ".drk-button-link": {
        "padding": "__DRK_RAW__0__",
        "line-height": 1.5,
        "background": "none",
        "color": palette.emphasis
    },
    ".drk-button-link:hover": {
        "color": palette.mutedText,
        "text-decoration": "none"
    },
    ".drk-button-link:disabled": {
        "color": palette.mutedText,
        "text-decoration": "none"
    },
    ".drk-button-group": {
        "display": "inline-flex",
        "vertical-align": "middle",
        "position": "relative"
    }
},
];
