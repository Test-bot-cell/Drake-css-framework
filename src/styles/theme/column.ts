// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · column.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    "[class*=\"drk-column-\"]": {
        "column-gap": "30px"
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        "[class*=\"drk-column-\"]": {
            "column-gap": "40px"
        }
    }
},
{
    "[class*=\"drk-column-\"] img": {
        "transform": "translate3d(0, 0, 0)"
    },
    ".drk-column-divider": {
        "column-rule": "1px solid #e5e5e5",
        "column-gap": "60px"
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-column-divider": {
            "column-gap": "80px"
        }
    }
},
{
    ".drk-column-1-2": {
        "column-count": 2
    },
    ".drk-column-1-3": {
        "column-count": 3
    },
    ".drk-column-1-4": {
        "column-count": 4
    },
    ".drk-column-1-5": {
        "column-count": 5
    },
    ".drk-column-1-6": {
        "column-count": 6
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-column-1-2\\40 s": {
            "column-count": 2
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-column-1-3\\40 s": {
            "column-count": 3
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-column-1-4\\40 s": {
            "column-count": 4
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-column-1-5\\40 s": {
            "column-count": 5
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-column-1-6\\40 s": {
            "column-count": 6
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-column-1-2\\40 m": {
            "column-count": 2
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-column-1-3\\40 m": {
            "column-count": 3
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-column-1-4\\40 m": {
            "column-count": 4
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-column-1-5\\40 m": {
            "column-count": 5
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-column-1-6\\40 m": {
            "column-count": 6
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-column-1-2\\40 l": {
            "column-count": 2
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-column-1-3\\40 l": {
            "column-count": 3
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-column-1-4\\40 l": {
            "column-count": 4
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-column-1-5\\40 l": {
            "column-count": 5
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-column-1-6\\40 l": {
            "column-count": 6
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-column-1-2\\40 xl": {
            "column-count": 2
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-column-1-3\\40 xl": {
            "column-count": 3
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-column-1-4\\40 xl": {
            "column-count": 4
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-column-1-5\\40 xl": {
            "column-count": 5
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-column-1-6\\40 xl": {
            "column-count": 6
        }
    }
},
{
    ".drk-column-span": {
        "column-span": "all"
    }
},
];
