// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · height.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    "[class*=\"drk-height\"]": {
        "box-sizing": "border-box"
    },
    ".drk-height-1-1": {
        "height": "100%"
    },
    ".drk-height-viewport": {
        "min-height": "100vh"
    },
    ".drk-height-viewport-2": {
        "min-height": "200vh"
    },
    ".drk-height-viewport-3": {
        "min-height": "300vh"
    },
    ".drk-height-viewport-4": {
        "min-height": "400vh"
    },
    ".drk-height-small": {
        "height": "150px"
    },
    ".drk-height-medium": {
        "height": "300px"
    },
    ".drk-height-large": {
        "height": "450px"
    },
    ".drk-height-max-small": {
        "max-height": "150px"
    },
    ".drk-height-max-medium": {
        "max-height": "300px"
    },
    ".drk-height-max-large": {
        "max-height": "450px"
    }
},
];
