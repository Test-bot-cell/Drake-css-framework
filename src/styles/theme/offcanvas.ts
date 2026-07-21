// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · offcanvas.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-offcanvas": {
        "display": "none",
        "position": "fixed",
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "z-index": 1000
    },
    ".drk-offcanvas-flip .drk-offcanvas": {
        "right": "__DRK_RAW__0__",
        "left": "auto"
    },
    ".drk-offcanvas-bar": {
        "--drk-inverse": "light",
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "-270px",
        "box-sizing": "border-box",
        "width": "270px",
        "padding": "20px 20px",
        "background": palette.secondary,
        "overflow-y": "auto"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-offcanvas-bar": {
            "left": "-350px",
            "width": "350px",
            "padding": "30px 30px"
        }
    }
},
{
    ".drk-offcanvas-flip .drk-offcanvas-bar": {
        "left": "auto",
        "right": "-270px"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-offcanvas-flip .drk-offcanvas-bar": {
            "right": "-350px"
        }
    }
},
{
    ".drk-open > .drk-offcanvas-bar": {
        "left": "__DRK_RAW__0__"
    },
    ".drk-offcanvas-flip .drk-open > .drk-offcanvas-bar": {
        "left": "auto",
        "right": "__DRK_RAW__0__"
    },
    ".drk-offcanvas-bar-animation": {
        "transition": "left 0.3s ease-out"
    },
    ".drk-offcanvas-flip .drk-offcanvas-bar-animation": {
        "transition-property": "right"
    },
    ".drk-offcanvas-reveal": {
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "width": "__DRK_RAW__0__",
        "overflow": "hidden",
        "transition": "width 0.3s ease-out"
    },
    ".drk-offcanvas-reveal .drk-offcanvas-bar": {
        "left": "__DRK_RAW__0__"
    },
    ".drk-offcanvas-flip .drk-offcanvas-reveal .drk-offcanvas-bar": {
        "left": "auto",
        "right": "__DRK_RAW__0__"
    },
    ".drk-open > .drk-offcanvas-reveal": {
        "width": "270px"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-open > .drk-offcanvas-reveal": {
            "width": "350px"
        }
    }
},
{
    ".drk-offcanvas-flip .drk-offcanvas-reveal": {
        "right": "__DRK_RAW__0__",
        "left": "auto"
    },
    ".drk-offcanvas-close": {
        "position": "absolute",
        "z-index": 1000,
        "top": "5px",
        "right": "5px",
        "padding": "5px"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-offcanvas-close": {
            "top": "10px",
            "right": "10px"
        }
    }
},
{
    ".drk-offcanvas-close:first-child + *": {
        "margin-top": "__DRK_RAW__0__"
    },
    ".drk-offcanvas-overlay": {
        "width": "100vw",
        "touch-action": "none"
    },
    ".drk-offcanvas-overlay::before": {
        "content": "\"\"",
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__",
        "background": "rgba(0, 0, 0, 0.1)",
        "opacity": 0,
        "transition": "opacity 0.15s linear"
    },
    ".drk-offcanvas-overlay.drk-open::before": {
        "opacity": 1
    },
    ".drk-offcanvas-page, .drk-offcanvas-container": {
        "overflow-x": "hidden"
    }
},
{
    ".drk-offcanvas-page, .drk-offcanvas-container": {
        "overflow-x": "clip"
    }
},
{
    ".drk-offcanvas-container": {
        "position": "relative",
        "left": "__DRK_RAW__0__",
        "transition": "left 0.3s ease-out",
        "box-sizing": "border-box",
        "width": "100%"
    },
    ":not(.drk-offcanvas-flip).drk-offcanvas-container-animation": {
        "left": "270px"
    },
    ".drk-offcanvas-flip.drk-offcanvas-container-animation": {
        "left": "-270px"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ":not(.drk-offcanvas-flip).drk-offcanvas-container-animation": {
            "left": "350px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-offcanvas-flip.drk-offcanvas-container-animation": {
            "left": "-350px"
        }
    }
},
];
