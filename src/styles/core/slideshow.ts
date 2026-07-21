// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · slideshow.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-slideshow": {
        "-webkit-tap-highlight-color": "transparent"
    },
    ".drk-slideshow-items": {
        "position": "relative",
        "z-index": 0,
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none",
        "overflow": "hidden",
        "-webkit-touch-callout": "none",
        "touch-action": "pan-y"
    },
    ".drk-slideshow-items > *": {
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "overflow": "hidden",
        "will-change": "transform, opacity"
    },
    ".drk-slideshow-items > :not(.drk-active)": {
        "display": "none"
    },
    ".drk-slideshow-items > :not(.drk-active) [class*=\"drk-animation-\"]": {
        "animation-name": "none"
    }
},
];
