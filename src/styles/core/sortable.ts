// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · sortable.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-sortable": {
        "position": "relative"
    },
    ".drk-sortable > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-sortable-drag": {
        "position": "fixed !important",
        "z-index": "1050 !important",
        "pointer-events": "none"
    },
    ".drk-sortable-placeholder": {
        "opacity": 0,
        "pointer-events": "none"
    },
    ".drk-sortable-empty": {
        "min-height": "50px"
    },
    ".drk-sortable-handle:hover": {
        "cursor": "move"
    }
},
];
