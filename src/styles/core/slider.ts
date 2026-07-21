// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · slider.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-slider": {
        "-webkit-tap-highlight-color": "transparent"
    },
    ".drk-slider-container": {
        "overflow-x": "hidden"
    }
},
{
    ".drk-slider-container": {
        "overflow-x": "clip"
    }
},
{
    ".drk-slider-container-offset": {
        "margin-left": "-25px",
        "margin-right": "-25px",
        "padding-left": "25px",
        "padding-right": "25px"
    },
    ".drk-slider-items": {
        "will-change": "transform",
        "position": "relative",
        "touch-action": "pan-y"
    },
    ".drk-slider-items:not(.drk-grid)": {
        "display": "flex",
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none",
        "-webkit-touch-callout": "none"
    },
    ".drk-slider-items.drk-grid": {
        "flex-wrap": "nowrap"
    },
    ".drk-slider-items > *": {
        "flex": "none !important",
        "box-sizing": "border-box",
        "max-width": "100%",
        "position": "relative"
    }
},
];
