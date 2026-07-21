// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · form-range.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-range": {
        "-webkit-appearance": "none",
        "box-sizing": "border-box",
        "margin": "__DRK_RAW__0__",
        "vertical-align": "middle",
        "max-width": "100%",
        "width": "100%",
        "background": "transparent"
    },
    ".drk-range:focus": {
        "outline": "none"
    },
    ".drk-range::-moz-focus-outer": {
        "border": "none"
    },
    ".drk-range:not(:disabled)::-webkit-slider-thumb": {
        "cursor": "pointer"
    },
    ".drk-range:not(:disabled)::-moz-range-thumb": {
        "cursor": "pointer"
    },
    ".drk-range::-webkit-slider-runnable-track": {
        "height": "3px",
        "background": "#ebebeb",
        "border-radius": "500px"
    },
    ".drk-range:focus::-webkit-slider-runnable-track, .drk-range:active::-webkit-slider-runnable-track": {
        "background": "#dedede"
    },
    ".drk-range::-moz-range-track": {
        "height": "3px",
        "background": "#ebebeb",
        "border-radius": "500px"
    },
    ".drk-range:focus::-moz-range-track": {
        "background": "#dedede"
    },
    ".drk-range::-webkit-slider-thumb": {
        "-webkit-appearance": "none",
        "margin-top": "-7px",
        "height": "15px",
        "width": "15px",
        "border-radius": "500px",
        "background": "#fff"
    }
},
{
    ".drk-range::-webkit-slider-thumb": {
        "border": "1px solid #cccccc"
    }
},
{
    ".drk-range::-moz-range-thumb": {
        "border": "none",
        "height": "15px",
        "width": "15px",
        "margin-top": "-7px"
    }
},
{
    ".drk-range::-moz-range-thumb": {
        "border-radius": "500px",
        "background": "#fff"
    }
},
{
    ".drk-range::-moz-range-thumb": {
        "border": "1px solid #cccccc"
    }
},
];
