// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · sticky.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-sticky": {
        "position": "relative",
        "z-index": 980,
        "box-sizing": "border-box"
    },
    ".drk-sticky-fixed": {
        "margin": "0 !important"
    },
    ".drk-sticky[class*=\"drk-animation-\"]": {
        "animation-duration": "0.2s"
    },
    ".drk-sticky.drk-animation-reverse": {
        "animation-duration": "0.2s"
    },
    ".drk-sticky-placeholder": {
        "pointer-events": "none"
    }
},
];
