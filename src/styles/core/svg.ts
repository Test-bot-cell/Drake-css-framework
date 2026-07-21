// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · svg.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-svg, .drk-svg:not(.drk-preserve) [fill*=\"#\"]:not(.drk-preserve)": {
        "fill": "currentcolor"
    },
    ".drk-svg:not(.drk-preserve) [stroke*=\"#\"]:not(.drk-preserve)": {
        "stroke": "currentcolor"
    }
},
{
    ".drk-svg": {
        "transform": "translate(0, 0)"
    }
},
];
