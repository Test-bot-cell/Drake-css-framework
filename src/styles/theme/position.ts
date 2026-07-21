// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · position.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ":root": {
        "--drk-position-margin-offset": "0px"
    },
    "[class*=\"drk-position-top\"], [class*=\"drk-position-bottom\"], [class*=\"drk-position-left\"], [class*=\"drk-position-right\"], [class*=\"drk-position-center\"]": {
        "position": "absolute !important",
        "max-width": "calc(100% - (var(--drk-position-margin-offset) * 2))",
        "box-sizing": "border-box"
    },
    ".drk-position-top": {
        "top": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__"
    },
    ".drk-position-bottom": {
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__"
    },
    ".drk-position-left": {
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__"
    },
    ".drk-position-right": {
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__"
    },
    ".drk-position-top-left": {
        "top": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__"
    },
    ".drk-position-top-right": {
        "top": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__"
    },
    ".drk-position-bottom-left": {
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__"
    },
    ".drk-position-bottom-right": {
        "bottom": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__"
    },
    ".drk-position-center": {
        "top": "calc(50% - var(--drk-position-margin-offset))",
        "left": "calc(50% - var(--drk-position-margin-offset))",
        "--drk-position-translate-x": "-50%",
        "--drk-position-translate-y": "-50%",
        "transform": "translate(var(--drk-position-translate-x), var(--drk-position-translate-y))",
        "width": "max-content"
    },
    "[class*=\"drk-position-center-left\"], [class*=\"drk-position-center-right\"], .drk-position-center-vertical": {
        "top": "calc(50% - var(--drk-position-margin-offset))",
        "--drk-position-translate-y": "-50%",
        "transform": "translate(0, var(--drk-position-translate-y))"
    },
    ".drk-position-center-left": {
        "left": "__DRK_RAW__0__"
    },
    ".drk-position-center-right": {
        "right": "__DRK_RAW__0__"
    }
},
{
    ".drk-position-center-vertical": {
        "left": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__"
    },
    ".drk-position-center-left-out": {
        "right": "100%",
        "width": "max-content"
    },
    ".drk-position-center-right-out": {
        "left": "100%",
        "width": "max-content"
    },
    ".drk-position-top-center, .drk-position-bottom-center, .drk-position-center-horizontal": {
        "left": "calc(50% - var(--drk-position-margin-offset))",
        "--drk-position-translate-x": "-50%",
        "transform": "translate(var(--drk-position-translate-x), 0)",
        "width": "max-content"
    }
},
{
    ".drk-position-top-center": {
        "top": "__DRK_RAW__0__"
    },
    ".drk-position-bottom-center": {
        "bottom": "__DRK_RAW__0__"
    },
    ".drk-position-center-horizontal": {
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__"
    },
    ".drk-position-cover": {
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__"
    },
    ".drk-position-small": {
        "margin": "15px",
        "--drk-position-margin-offset": "15px"
    },
    ".drk-position-medium": {
        "margin": "30px",
        "--drk-position-margin-offset": "30px"
    },
    ".drk-position-large": {
        "margin": "30px",
        "--drk-position-margin-offset": "30px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-position-large": {
            "margin": "50px",
            "--drk-position-margin-offset": "50px"
        }
    }
},
{
    ".drk-position-relative": {
        "position": "relative !important"
    },
    ".drk-position-absolute": {
        "position": "absolute !important"
    },
    ".drk-position-fixed": {
        "position": "fixed !important"
    },
    ".drk-position-sticky": {
        "position": "sticky !important"
    },
    ".drk-position-z-index": {
        "z-index": 1
    },
    ".drk-position-z-index-zero": {
        "z-index": 0
    },
    ".drk-position-z-index-negative": {
        "z-index": -1
    },
    ".drk-position-z-index-high": {
        "z-index": 990
    },
    ".drk-position-z-index-highest": {
        "z-index": 1060
    }
},
];
