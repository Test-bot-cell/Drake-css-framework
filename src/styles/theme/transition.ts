// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · transition.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ":where(.drk-transition-fade), :where([class*=\"drk-transition-scale\"]), :where([class*=\"drk-transition-slide\"])": {
        "--drk-position-translate-x": 0,
        "--drk-position-translate-y": 0
    },
    ".drk-transition-fade, [class*=\"drk-transition-scale\"], [class*=\"drk-transition-slide\"]": {
        "--drk-translate-x": 0,
        "--drk-translate-y": 0,
        "--drk-scale-x": 1,
        "--drk-scale-y": 1,
        "transform": "translate(var(--drk-position-translate-x), var(--drk-position-translate-y)) translate(var(--drk-translate-x), var(--drk-translate-y)) scale(var(--drk-scale-x), var(--drk-scale-y))",
        "transition": "0.3s ease-out"
    }
},
{
    ".drk-transition-fade, [class*=\"drk-transition-scale\"], [class*=\"drk-transition-slide\"]": {
        "transition-property": "opacity, transform, filter",
        "opacity": 0
    }
},
{
    ".drk-transition-toggle:hover .drk-transition-fade, .drk-transition-toggle:focus .drk-transition-fade, .drk-transition-toggle:focus-within .drk-transition-fade, .drk-transition-active.drk-active .drk-transition-fade": {
        "opacity": 1
    },
    "[class*=\"drk-transition-scale\"]": {
        "-webkit-backface-visibility": "hidden"
    },
    ".drk-transition-scale-up": {
        "--drk-scale-x": 1,
        "--drk-scale-y": 1
    },
    ".drk-transition-scale-down": {
        "--drk-scale-x": 1.03,
        "--drk-scale-y": 1.03
    },
    ".drk-transition-toggle:hover .drk-transition-scale-up, .drk-transition-toggle:focus .drk-transition-scale-up, .drk-transition-toggle:focus-within .drk-transition-scale-up, .drk-transition-active.drk-active .drk-transition-scale-up": {
        "--drk-scale-x": 1.03,
        "--drk-scale-y": 1.03,
        "opacity": 1
    },
    ".drk-transition-toggle:hover .drk-transition-scale-down, .drk-transition-toggle:focus .drk-transition-scale-down, .drk-transition-toggle:focus-within .drk-transition-scale-down, .drk-transition-active.drk-active .drk-transition-scale-down": {
        "--drk-scale-x": 1,
        "--drk-scale-y": 1,
        "opacity": 1
    },
    ".drk-transition-slide-top": {
        "--drk-translate-y": "-100%"
    },
    ".drk-transition-slide-bottom": {
        "--drk-translate-y": "100%"
    },
    ".drk-transition-slide-left": {
        "--drk-translate-x": "-100%"
    },
    ".drk-transition-slide-right": {
        "--drk-translate-x": "100%"
    },
    ".drk-transition-slide-top-small": {
        "--drk-translate-y": "calc(-1 * 10px)"
    },
    ".drk-transition-slide-bottom-small": {
        "--drk-translate-y": "10px"
    },
    ".drk-transition-slide-left-small": {
        "--drk-translate-x": "calc(-1 * 10px)"
    },
    ".drk-transition-slide-right-small": {
        "--drk-translate-x": "10px"
    },
    ".drk-transition-slide-top-medium": {
        "--drk-translate-y": "calc(-1 * 50px)"
    },
    ".drk-transition-slide-bottom-medium": {
        "--drk-translate-y": "50px"
    },
    ".drk-transition-slide-left-medium": {
        "--drk-translate-x": "calc(-1 * 50px)"
    },
    ".drk-transition-slide-right-medium": {
        "--drk-translate-x": "50px"
    },
    ".drk-transition-toggle:hover [class*=\"drk-transition-slide\"], .drk-transition-toggle:focus [class*=\"drk-transition-slide\"], .drk-transition-toggle:focus-within [class*=\"drk-transition-slide\"], .drk-transition-active.drk-active [class*=\"drk-transition-slide\"]": {
        "--drk-translate-x": 0,
        "--drk-translate-y": 0,
        "opacity": 1
    },
    ".drk-transition-opaque": {
        "opacity": 1
    },
    ".drk-transition-slow": {
        "transition-duration": "0.7s"
    },
    ".drk-transition-disable, .drk-transition-disable *": {
        "transition": "none !important"
    }
},
];
