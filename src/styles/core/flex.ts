// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · flex.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-flex": {
        "display": "flex"
    },
    ".drk-flex-inline": {
        "display": "inline-flex"
    },
    ".drk-flex-left": {
        "justify-content": "flex-start"
    },
    ".drk-flex-center": {
        "justify-content": "center"
    },
    ".drk-flex-right": {
        "justify-content": "flex-end"
    },
    ".drk-flex-between": {
        "justify-content": "space-between"
    },
    ".drk-flex-around": {
        "justify-content": "space-around"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-left\\40 s": {
            "justify-content": "flex-start"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-center\\40 s": {
            "justify-content": "center"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-right\\40 s": {
            "justify-content": "flex-end"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-between\\40 s": {
            "justify-content": "space-between"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-around\\40 s": {
            "justify-content": "space-around"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-left\\40 m": {
            "justify-content": "flex-start"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-center\\40 m": {
            "justify-content": "center"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-right\\40 m": {
            "justify-content": "flex-end"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-between\\40 m": {
            "justify-content": "space-between"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-around\\40 m": {
            "justify-content": "space-around"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-left\\40 l": {
            "justify-content": "flex-start"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-center\\40 l": {
            "justify-content": "center"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-right\\40 l": {
            "justify-content": "flex-end"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-between\\40 l": {
            "justify-content": "space-between"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-around\\40 l": {
            "justify-content": "space-around"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-left\\40 xl": {
            "justify-content": "flex-start"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-center\\40 xl": {
            "justify-content": "center"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-right\\40 xl": {
            "justify-content": "flex-end"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-between\\40 xl": {
            "justify-content": "space-between"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-around\\40 xl": {
            "justify-content": "space-around"
        }
    }
},
{
    ".drk-flex-stretch": {
        "align-items": "stretch"
    },
    ".drk-flex-top": {
        "align-items": "flex-start"
    },
    ".drk-flex-middle": {
        "align-items": "center"
    },
    ".drk-flex-bottom": {
        "align-items": "flex-end"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-stretch\\40 s": {
            "align-items": "stretch"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-top\\40 s": {
            "align-items": "flex-start"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-middle\\40 s": {
            "align-items": "center"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-bottom\\40 s": {
            "align-items": "flex-end"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-stretch\\40 m": {
            "align-items": "stretch"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-top\\40 m": {
            "align-items": "flex-start"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-middle\\40 m": {
            "align-items": "center"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-bottom\\40 m": {
            "align-items": "flex-end"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-stretch\\40 l": {
            "align-items": "stretch"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-top\\40 l": {
            "align-items": "flex-start"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-middle\\40 l": {
            "align-items": "center"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-bottom\\40 l": {
            "align-items": "flex-end"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-stretch\\40 xl": {
            "align-items": "stretch"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-top\\40 xl": {
            "align-items": "flex-start"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-middle\\40 xl": {
            "align-items": "center"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-bottom\\40 xl": {
            "align-items": "flex-end"
        }
    }
},
{
    ".drk-flex-row": {
        "flex-direction": "row"
    },
    ".drk-flex-row-reverse": {
        "flex-direction": "row-reverse"
    },
    ".drk-flex-column": {
        "flex-direction": "column"
    },
    ".drk-flex-column-reverse": {
        "flex-direction": "column-reverse"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-row\\40 s": {
            "flex-direction": "row"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-column\\40 s": {
            "flex-direction": "column"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-row\\40 m": {
            "flex-direction": "row"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-column\\40 m": {
            "flex-direction": "column"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-row\\40 l": {
            "flex-direction": "row"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-column\\40 l": {
            "flex-direction": "column"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-row\\40 xl": {
            "flex-direction": "row"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-column\\40 xl": {
            "flex-direction": "column"
        }
    }
},
{
    ".drk-flex-nowrap": {
        "flex-wrap": "nowrap"
    },
    ".drk-flex-wrap": {
        "flex-wrap": "wrap"
    },
    ".drk-flex-wrap-reverse": {
        "flex-wrap": "wrap-reverse"
    },
    ".drk-flex-wrap-stretch": {
        "align-content": "stretch"
    },
    ".drk-flex-wrap-top": {
        "align-content": "flex-start"
    },
    ".drk-flex-wrap-middle": {
        "align-content": "center"
    },
    ".drk-flex-wrap-bottom": {
        "align-content": "flex-end"
    },
    ".drk-flex-wrap-between": {
        "align-content": "space-between"
    },
    ".drk-flex-wrap-around": {
        "align-content": "space-around"
    },
    ".drk-flex-first": {
        "order": -1
    },
    ".drk-flex-last": {
        "order": 99
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-first\\40 s": {
            "order": -1
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-last\\40 s": {
            "order": 99
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-first\\40 m": {
            "order": -1
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-last\\40 m": {
            "order": 99
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-first\\40 l": {
            "order": -1
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-last\\40 l": {
            "order": 99
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-first\\40 xl": {
            "order": -1
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-last\\40 xl": {
            "order": 99
        }
    }
},
{
    ".drk-flex-initial": {
        "flex": "initial"
    },
    ".drk-flex-none": {
        "flex": "none"
    },
    ".drk-flex-auto": {
        "flex": "auto"
    },
    ".drk-flex-1": {
        "flex": 1
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-initial\\40 s": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-none\\40 s": {
            "flex": "none"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-flex-1\\40 s": {
            "flex": 1
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-initial\\40 m": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-none\\40 m": {
            "flex": "none"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-flex-1\\40 m": {
            "flex": 1
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-initial\\40 l": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-none\\40 l": {
            "flex": "none"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-flex-1\\40 l": {
            "flex": 1
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-initial\\40 xl": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-none\\40 xl": {
            "flex": "none"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-flex-1\\40 xl": {
            "flex": 1
        }
    }
},
];
