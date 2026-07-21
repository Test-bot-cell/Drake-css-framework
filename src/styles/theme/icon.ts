// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · icon.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-icon": {
        "margin": "__DRK_RAW__0__",
        "border": "none"
    }
},
{
    ".drk-icon": {
        "border-radius": "__DRK_RAW__0__",
        "overflow": "visible",
        "font": "inherit",
        "color": "inherit",
        "text-transform": "none",
        "padding": "__DRK_RAW__0__",
        "background-color": "transparent",
        "display": "inline-block",
        "line-height": 0
    }
},
{
    "button.drk-icon:not(:disabled)": {
        "cursor": "pointer"
    },
    ".drk-icon::-moz-focus-inner": {
        "border": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__"
    },
    ".drk-ti": {
        "display": "inline-block",
        "flex": "none",
        "width": "1em",
        "height": "1em",
        "color": "inherit",
        "vertical-align": "-0.125em",
        "background-color": "currentcolor",
        "-webkit-mask-image": "var(--drk-ti-mask)",
        "mask-image": "var(--drk-ti-mask)",
        "-webkit-mask-position": "center",
        "mask-position": "center",
        "-webkit-mask-repeat": "no-repeat",
        "mask-repeat": "no-repeat",
        "-webkit-mask-size": "100% 100%",
        "mask-size": "100% 100%"
    },
    ".drk-icon.drk-ti": {
        "width": "calc(var(--drk-icon-width, 20px) * var(--drk-icon-ratio, 1))",
        "height": "calc(var(--drk-icon-height, 20px) * var(--drk-icon-ratio, 1))",
        "vertical-align": "middle",
        "background-color": "currentcolor"
    },
    "a.drk-icon.drk-ti, button.drk-icon.drk-ti": {
        "min-width": "24px",
        "min-height": "24px",
        "-webkit-mask-size": "calc(var(--drk-icon-width, 20px) * var(--drk-icon-ratio, 1)) calc(var(--drk-icon-height, 20px) * var(--drk-icon-ratio, 1))",
        "mask-size": "calc(var(--drk-icon-width, 20px) * var(--drk-icon-ratio, 1)) calc(var(--drk-icon-height, 20px) * var(--drk-icon-ratio, 1))"
    }
},
{
    "@media (prefers-reduced-motion: reduce)": {
        ".drk-accordion-icon, .drk-nav-parent-icon, .drk-navbar-parent-icon, .drk-navbar-toggle-icon": {
            "transition": "none !important"
        }
    }
},
{
    ".drk-icon-image": {
        "width": "20px",
        "height": "20px",
        "background-position": "50% 50%",
        "background-repeat": "no-repeat",
        "background-size": "contain",
        "vertical-align": "middle",
        "object-fit": "scale-down",
        "max-width": "none"
    },
    ".drk-icon-link": {
        "color": palette.muted,
        "text-decoration": "none !important"
    },
    ".drk-icon-link:hover": {
        "color": palette.text
    },
    ".drk-icon-link:active, .drk-active > .drk-icon-link": {
        "color": "#595959"
    },
    ".drk-icon-button": {
        "box-sizing": "border-box",
        "width": "36px",
        "height": "36px",
        "border-radius": "500px",
        "background": palette.mutedBackground,
        "color": palette.muted,
        "vertical-align": "middle",
        "display": "inline-flex",
        "justify-content": "center",
        "align-items": "center",
        "transition": "0.1s ease-in-out"
    }
},
{
    ".drk-icon-button": {
        "transition-property": "color, background-color"
    }
},
{
    ".drk-icon-button:hover": {
        "background-color": "#ebebeb",
        "color": palette.text
    },
    ".drk-icon-button:active, .drk-active > .drk-icon-button": {
        "background-color": "#dfdfdf",
        "color": palette.text
    },
    ".drk-icon-overlay, a .drk-icon-overlay": {
        "color": "rgba(51, 51, 51, 0.6)",
        "transition": "0.1s ease-in-out"
    }
},
{
    ".drk-icon-overlay, a .drk-icon-overlay": {
        "transition-property": "color"
    }
},
{
    ".drk-icon-overlay:hover, a:hover .drk-icon-overlay": {
        "color": palette.emphasis
    }
},
];
