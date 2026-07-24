// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · navbar.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, fontFamilies, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-navbar": {
        "display": "flex",
        "position": "relative"
    },
    ".drk-navbar-container:not(.drk-navbar-transparent)": {
        "background": palette.mutedBackground
    },
    ".drk-navbar-left, .drk-navbar-right, [class*=\"drk-navbar-center\"]": {
        "display": "flex",
        "gap": "15px",
        "align-items": "stretch"
    }
},
{
    ".drk-navbar-right": {
        "margin-left": "auto"
    },
    ".drk-navbar-center:only-child": {
        "margin-left": "auto",
        "margin-right": "auto",
        "position": "relative"
    },
    ".drk-navbar-center:not(:only-child)": {
        "position": "absolute",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)",
        "width": "max-content",
        "box-sizing": "border-box",
        "z-index": 990,
        "height": "100%",
        "align-items": "stretch"
    },
    ".drk-navbar-center-left, .drk-navbar-center-right": {
        "height": "100%",
        "position": "absolute",
        "top": "__DRK_RAW__0__"
    }
},
{
    ".drk-navbar-center-left": {
        "right": "calc(100% + 15px)"
    },
    ".drk-navbar-center-right": {
        "left": "calc(100% + 15px)"
    },
    "[class*=\"drk-navbar-center-\"]": {
        "width": "max-content",
        "box-sizing": "border-box"
    },
    ".drk-navbar-nav": {
        "display": "flex",
        "gap": "15px",
        "align-items": "stretch",
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-navbar-left, .drk-navbar-right, .drk-navbar-center:only-child": {
        "flex-wrap": "wrap"
    },
    ".drk-navbar-nav > li > a, .drk-navbar-item, .drk-navbar-toggle": {
        "display": "flex",
        "justify-content": "center",
        "align-items": "center",
        "column-gap": "0.25em",
        "box-sizing": "border-box",
        "min-height": "80px",
        "font-size": "0.875rem",
        "font-family": fontFamilies.body,
        "text-decoration": "none"
    }
},
{
    ".drk-navbar-nav > li > a": {
        "height": "100%",
        "padding": "0 0",
        "color": palette.mutedText,
        "text-transform": "uppercase",
        "transition": "0.1s ease-in-out"
    }
},
{
    ".drk-navbar-nav > li > a": {
        "transition-property": "color, background-color"
    }
},
{
    ".drk-navbar-nav > li:hover > a, .drk-navbar-nav > li > a[aria-expanded=\"true\"]": {
        "color": palette.text
    },
    ".drk-navbar-nav > li > a:active": {
        "color": palette.emphasis
    },
    ".drk-navbar-nav > li.drk-active > a": {
        "color": palette.emphasis
    },
    ".drk-navbar-parent-icon": {
        "--drk-icon-width": "12px",
        "--drk-icon-height": "12px",
        "margin-left": "4px",
        "transition": "transform 0.3s ease-out"
    },
    ".drk-navbar-nav > li > a[aria-expanded=\"true\"] .drk-navbar-parent-icon": {
        "transform": "rotateX(180deg)"
    },
    ".drk-navbar-item": {
        "padding": "0 0",
        "color": palette.text
    },
    ".drk-navbar-item > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-navbar-toggle": {
        "padding": "0 0",
        "color": palette.mutedText
    },
    ".drk-navbar-toggle:hover, .drk-navbar-toggle[aria-expanded=\"true\"]": {
        "color": palette.text,
        "text-decoration": "none"
    },
    ".drk-navbar-toggle-icon": {
        "--drk-icon-width": "20px",
        "--drk-icon-height": "20px",
        "transition": "transform 0.2s ease-in-out"
    },
    ".drk-navbar-toggle-icon[aria-expanded=\"true\"], [aria-expanded=\"true\"] .drk-navbar-toggle-icon": {
        "--drk-ti-mask": "var(--drk-tabler-icon-x)",
        "transform": "rotate(90deg)"
    },
    ".drk-navbar-subtitle": {
        "font-size": "0.875rem"
    },
    ".drk-navbar-justify .drk-navbar-left, .drk-navbar-justify .drk-navbar-right, .drk-navbar-justify .drk-navbar-nav, .drk-navbar-justify .drk-navbar-nav > li, .drk-navbar-justify .drk-navbar-item, .drk-navbar-justify .drk-navbar-toggle": {
        "flex-grow": 1
    },
    ".drk-navbar-dropdown": {
        "--drk-position-offset": "15px",
        "--drk-position-shift-offset": 0,
        "--drk-position-viewport-offset": "15px",
        "--drk-inverse": "dark",
        "width": "200px",
        "padding": "25px",
        "background": "#fff",
        "color": palette.text,
        "box-shadow": "0 5px 12px rgba(0, 0, 0, 0.15)"
    },
    ".drk-navbar-dropdown > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-navbar-dropdown :focus-visible": {
        "outline-color": `${palette.emphasis} !important`
    },
    ".drk-navbar-dropdown .drk-drop-grid": {
        "margin-left": "-30px"
    },
    ".drk-navbar-dropdown .drk-drop-grid > *": {
        "padding-left": "30px"
    },
    ".drk-navbar-dropdown .drk-drop-grid > .drk-grid-margin": {
        "margin-top": "30px"
    },
    ".drk-navbar-dropdown-width-2:not(.drk-drop-stack)": {
        "width": "400px"
    },
    ".drk-navbar-dropdown-width-3:not(.drk-drop-stack)": {
        "width": "600px"
    },
    ".drk-navbar-dropdown-width-4:not(.drk-drop-stack)": {
        "width": "800px"
    },
    ".drk-navbar-dropdown-width-5:not(.drk-drop-stack)": {
        "width": "1000px"
    },
    ".drk-navbar-dropdown-large": {
        "--drk-position-shift-offset": 0,
        "padding": "40px"
    },
    ".drk-navbar-dropdown-dropbar": {
        "width": "auto",
        "background": "transparent",
        "padding": "25px 0 25px 0",
        "--drk-position-offset": 0,
        "--drk-position-shift-offset": 0,
        "--drk-position-viewport-offset": "15px",
        "box-shadow": "none"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-navbar-dropdown-dropbar": {
            "--drk-position-viewport-offset": "30px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-navbar-dropdown-dropbar": {
            "--drk-position-viewport-offset": "40px"
        }
    }
},
{
    ".drk-navbar-dropdown-dropbar-large": {
        "--drk-position-shift-offset": 0,
        "padding-top": "40px",
        "padding-bottom": "40px"
    },
    ".drk-navbar-dropdown-nav": {
        "font-size": "0.875rem"
    },
    ".drk-navbar-dropdown-nav > li > a": {
        "color": palette.mutedText
    },
    ".drk-navbar-dropdown-nav > li > a:hover": {
        "color": palette.text
    },
    ".drk-navbar-dropdown-nav > li.drk-active > a": {
        "color": palette.emphasis
    },
    ".drk-navbar-dropdown-nav .drk-nav-subtitle": {
        "font-size": "12px"
    },
    ".drk-navbar-dropdown-nav .drk-nav-header": {
        "color": palette.emphasis
    },
    ".drk-navbar-dropdown-nav .drk-nav-divider": {
        "border-top": "1px solid #e5e5e5"
    },
    ".drk-navbar-dropdown-nav .drk-nav-sub a": {
        "color": palette.mutedText
    },
    ".drk-navbar-dropdown-nav .drk-nav-sub a:hover": {
        "color": palette.text
    },
    ".drk-navbar-dropdown-nav .drk-nav-sub li.drk-active > a": {
        "color": palette.emphasis
    },
    ".drk-navbar-container": {
        "transition": "0.1s ease-in-out"
    }
},
{
    ".drk-navbar-container": {
        "transition-property": "background-color"
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-navbar-left, .drk-navbar-right, [class*=\"drk-navbar-center\"]": {
            "gap": "30px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-navbar-center-left": {
            "right": "calc(100% + 30px)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-navbar-center-right": {
            "left": "calc(100% + 30px)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-navbar-nav": {
            "gap": "30px"
        }
    }
},
];
