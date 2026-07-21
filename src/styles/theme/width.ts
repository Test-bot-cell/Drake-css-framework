// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · width.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    "[class*=\"drk-child-width\"] > *": {
        "box-sizing": "border-box",
        "width": "100%"
    },
    ".drk-child-width-1-2 > *": {
        "width": "50%"
    },
    ".drk-child-width-1-3 > *": {
        "width": "calc(100% / 3)"
    },
    ".drk-child-width-1-4 > *": {
        "width": "25%"
    },
    ".drk-child-width-1-5 > *": {
        "width": "20%"
    },
    ".drk-child-width-1-6 > *": {
        "width": "calc(100% / 6)"
    },
    ".drk-child-width-auto > *": {
        "width": "auto"
    },
    ".drk-child-width-expand > :not([class*=\"drk-width\"])": {
        "flex": 1,
        "min-width": "1px"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-child-width-1-1\\40 s > *": {
            "width": "100%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-child-width-1-2\\40 s > *": {
            "width": "50%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-child-width-1-3\\40 s > *": {
            "width": "calc(100% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-child-width-1-4\\40 s > *": {
            "width": "25%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-child-width-1-5\\40 s > *": {
            "width": "20%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-child-width-1-6\\40 s > *": {
            "width": "calc(100% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-child-width-auto\\40 s > *": {
            "width": "auto"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-child-width-expand\\40 s > :not([class*=\"drk-width\"])": {
            "flex": 1,
            "min-width": "1px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-child-width-1-1\\40 s > :not([class*=\"drk-width\"]), .drk-child-width-1-2\\40 s > :not([class*=\"drk-width\"]), .drk-child-width-1-3\\40 s > :not([class*=\"drk-width\"]), .drk-child-width-1-4\\40 s > :not([class*=\"drk-width\"]), .drk-child-width-1-5\\40 s > :not([class*=\"drk-width\"]), .drk-child-width-1-6\\40 s > :not([class*=\"drk-width\"]), .drk-child-width-auto\\40 s > :not([class*=\"drk-width\"])": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-child-width-1-1\\40 m > *": {
            "width": "100%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-child-width-1-2\\40 m > *": {
            "width": "50%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-child-width-1-3\\40 m > *": {
            "width": "calc(100% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-child-width-1-4\\40 m > *": {
            "width": "25%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-child-width-1-5\\40 m > *": {
            "width": "20%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-child-width-1-6\\40 m > *": {
            "width": "calc(100% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-child-width-auto\\40 m > *": {
            "width": "auto"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-child-width-expand\\40 m > :not([class*=\"drk-width\"])": {
            "flex": 1,
            "min-width": "1px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-child-width-1-1\\40 m > :not([class*=\"drk-width\"]), .drk-child-width-1-2\\40 m > :not([class*=\"drk-width\"]), .drk-child-width-1-3\\40 m > :not([class*=\"drk-width\"]), .drk-child-width-1-4\\40 m > :not([class*=\"drk-width\"]), .drk-child-width-1-5\\40 m > :not([class*=\"drk-width\"]), .drk-child-width-1-6\\40 m > :not([class*=\"drk-width\"]), .drk-child-width-auto\\40 m > :not([class*=\"drk-width\"])": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-child-width-1-1\\40 l > *": {
            "width": "100%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-child-width-1-2\\40 l > *": {
            "width": "50%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-child-width-1-3\\40 l > *": {
            "width": "calc(100% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-child-width-1-4\\40 l > *": {
            "width": "25%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-child-width-1-5\\40 l > *": {
            "width": "20%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-child-width-1-6\\40 l > *": {
            "width": "calc(100% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-child-width-auto\\40 l > *": {
            "width": "auto"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-child-width-expand\\40 l > :not([class*=\"drk-width\"])": {
            "flex": 1,
            "min-width": "1px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-child-width-1-1\\40 l > :not([class*=\"drk-width\"]), .drk-child-width-1-2\\40 l > :not([class*=\"drk-width\"]), .drk-child-width-1-3\\40 l > :not([class*=\"drk-width\"]), .drk-child-width-1-4\\40 l > :not([class*=\"drk-width\"]), .drk-child-width-1-5\\40 l > :not([class*=\"drk-width\"]), .drk-child-width-1-6\\40 l > :not([class*=\"drk-width\"]), .drk-child-width-auto\\40 l > :not([class*=\"drk-width\"])": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-child-width-1-1\\40 xl > *": {
            "width": "100%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-child-width-1-2\\40 xl > *": {
            "width": "50%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-child-width-1-3\\40 xl > *": {
            "width": "calc(100% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-child-width-1-4\\40 xl > *": {
            "width": "25%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-child-width-1-5\\40 xl > *": {
            "width": "20%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-child-width-1-6\\40 xl > *": {
            "width": "calc(100% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-child-width-auto\\40 xl > *": {
            "width": "auto"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-child-width-expand\\40 xl > :not([class*=\"drk-width\"])": {
            "flex": 1,
            "min-width": "1px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-child-width-1-1\\40 xl > :not([class*=\"drk-width\"]), .drk-child-width-1-2\\40 xl > :not([class*=\"drk-width\"]), .drk-child-width-1-3\\40 xl > :not([class*=\"drk-width\"]), .drk-child-width-1-4\\40 xl > :not([class*=\"drk-width\"]), .drk-child-width-1-5\\40 xl > :not([class*=\"drk-width\"]), .drk-child-width-1-6\\40 xl > :not([class*=\"drk-width\"]), .drk-child-width-auto\\40 xl > :not([class*=\"drk-width\"])": {
            "flex": "initial"
        }
    }
},
{
    "[class*=\"drk-width\"]": {
        "box-sizing": "border-box",
        "width": "100%",
        "max-width": "100%"
    },
    ".drk-width-1-2": {
        "width": "50%"
    },
    ".drk-width-1-3": {
        "width": "calc(100% / 3)"
    },
    ".drk-width-2-3": {
        "width": "calc(200% / 3)"
    },
    ".drk-width-1-4": {
        "width": "25%"
    },
    ".drk-width-3-4": {
        "width": "75%"
    },
    ".drk-width-1-5": {
        "width": "20%"
    },
    ".drk-width-2-5": {
        "width": "40%"
    },
    ".drk-width-3-5": {
        "width": "60%"
    },
    ".drk-width-4-5": {
        "width": "80%"
    },
    ".drk-width-1-6": {
        "width": "calc(100% / 6)"
    },
    ".drk-width-5-6": {
        "width": "calc(500% / 6)"
    },
    ".drk-width-small": {
        "width": "150px"
    },
    ".drk-width-medium": {
        "width": "300px"
    },
    ".drk-width-large": {
        "width": "450px"
    },
    ".drk-width-xlarge": {
        "width": "600px"
    },
    ".drk-width-2xlarge": {
        "width": "750px"
    },
    ".drk-width-auto": {
        "width": "auto"
    },
    ".drk-width-expand": {
        "flex": 1,
        "min-width": "1px"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-1-1\\40 s": {
            "width": "100%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-1-2\\40 s": {
            "width": "50%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-1-3\\40 s": {
            "width": "calc(100% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-2-3\\40 s": {
            "width": "calc(200% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-1-4\\40 s": {
            "width": "25%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-3-4\\40 s": {
            "width": "75%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-1-5\\40 s": {
            "width": "20%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-2-5\\40 s": {
            "width": "40%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-3-5\\40 s": {
            "width": "60%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-4-5\\40 s": {
            "width": "80%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-1-6\\40 s": {
            "width": "calc(100% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-5-6\\40 s": {
            "width": "calc(500% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-small\\40 s": {
            "width": "150px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-medium\\40 s": {
            "width": "300px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-large\\40 s": {
            "width": "450px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-xlarge\\40 s": {
            "width": "600px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-2xlarge\\40 s": {
            "width": "750px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-auto\\40 s": {
            "width": "auto"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-expand\\40 s": {
            "flex": 1,
            "min-width": "1px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-width-1-1\\40 s, .drk-width-1-2\\40 s, .drk-width-1-3\\40 s, .drk-width-2-3\\40 s, .drk-width-1-4\\40 s, .drk-width-3-4\\40 s, .drk-width-1-5\\40 s, .drk-width-2-5\\40 s, .drk-width-3-5\\40 s, .drk-width-4-5\\40 s, .drk-width-1-6\\40 s, .drk-width-5-6\\40 s, .drk-width-small\\40 s, .drk-width-medium\\40 s, .drk-width-large\\40 s, .drk-width-xlarge\\40 s, .drk-width-2xlarge\\40 s, .drk-width-auto\\40 s": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-1-1\\40 m": {
            "width": "100%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-1-2\\40 m": {
            "width": "50%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-1-3\\40 m": {
            "width": "calc(100% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-2-3\\40 m": {
            "width": "calc(200% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-1-4\\40 m": {
            "width": "25%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-3-4\\40 m": {
            "width": "75%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-1-5\\40 m": {
            "width": "20%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-2-5\\40 m": {
            "width": "40%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-3-5\\40 m": {
            "width": "60%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-4-5\\40 m": {
            "width": "80%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-1-6\\40 m": {
            "width": "calc(100% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-5-6\\40 m": {
            "width": "calc(500% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-small\\40 m": {
            "width": "150px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-medium\\40 m": {
            "width": "300px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-large\\40 m": {
            "width": "450px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-xlarge\\40 m": {
            "width": "600px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-2xlarge\\40 m": {
            "width": "750px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-auto\\40 m": {
            "width": "auto"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-expand\\40 m": {
            "flex": 1,
            "min-width": "1px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-width-1-1\\40 m, .drk-width-1-2\\40 m, .drk-width-1-3\\40 m, .drk-width-2-3\\40 m, .drk-width-1-4\\40 m, .drk-width-3-4\\40 m, .drk-width-1-5\\40 m, .drk-width-2-5\\40 m, .drk-width-3-5\\40 m, .drk-width-4-5\\40 m, .drk-width-1-6\\40 m, .drk-width-5-6\\40 m, .drk-width-small\\40 m, .drk-width-medium\\40 m, .drk-width-large\\40 m, .drk-width-xlarge\\40 m, .drk-width-2xlarge\\40 m, .drk-width-auto\\40 m": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-1-1\\40 l": {
            "width": "100%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-1-2\\40 l": {
            "width": "50%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-1-3\\40 l": {
            "width": "calc(100% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-2-3\\40 l": {
            "width": "calc(200% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-1-4\\40 l": {
            "width": "25%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-3-4\\40 l": {
            "width": "75%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-1-5\\40 l": {
            "width": "20%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-2-5\\40 l": {
            "width": "40%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-3-5\\40 l": {
            "width": "60%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-4-5\\40 l": {
            "width": "80%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-1-6\\40 l": {
            "width": "calc(100% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-5-6\\40 l": {
            "width": "calc(500% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-small\\40 l": {
            "width": "150px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-medium\\40 l": {
            "width": "300px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-large\\40 l": {
            "width": "450px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-xlarge\\40 l": {
            "width": "600px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-2xlarge\\40 l": {
            "width": "750px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-auto\\40 l": {
            "width": "auto"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-expand\\40 l": {
            "flex": 1,
            "min-width": "1px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-width-1-1\\40 l, .drk-width-1-2\\40 l, .drk-width-1-3\\40 l, .drk-width-2-3\\40 l, .drk-width-1-4\\40 l, .drk-width-3-4\\40 l, .drk-width-1-5\\40 l, .drk-width-2-5\\40 l, .drk-width-3-5\\40 l, .drk-width-4-5\\40 l, .drk-width-1-6\\40 l, .drk-width-5-6\\40 l, .drk-width-small\\40 l, .drk-width-medium\\40 l, .drk-width-large\\40 l, .drk-width-xlarge\\40 l, .drk-width-2xlarge\\40 l, .drk-width-auto\\40 l": {
            "flex": "initial"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-1-1\\40 xl": {
            "width": "100%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-1-2\\40 xl": {
            "width": "50%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-1-3\\40 xl": {
            "width": "calc(100% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-2-3\\40 xl": {
            "width": "calc(200% / 3)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-1-4\\40 xl": {
            "width": "25%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-3-4\\40 xl": {
            "width": "75%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-1-5\\40 xl": {
            "width": "20%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-2-5\\40 xl": {
            "width": "40%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-3-5\\40 xl": {
            "width": "60%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-4-5\\40 xl": {
            "width": "80%"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-1-6\\40 xl": {
            "width": "calc(100% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-5-6\\40 xl": {
            "width": "calc(500% / 6)"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-small\\40 xl": {
            "width": "150px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-medium\\40 xl": {
            "width": "300px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-large\\40 xl": {
            "width": "450px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-xlarge\\40 xl": {
            "width": "600px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-2xlarge\\40 xl": {
            "width": "750px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-auto\\40 xl": {
            "width": "auto"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-expand\\40 xl": {
            "flex": 1,
            "min-width": "1px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-width-1-1\\40 xl, .drk-width-1-2\\40 xl, .drk-width-1-3\\40 xl, .drk-width-2-3\\40 xl, .drk-width-1-4\\40 xl, .drk-width-3-4\\40 xl, .drk-width-1-5\\40 xl, .drk-width-2-5\\40 xl, .drk-width-3-5\\40 xl, .drk-width-4-5\\40 xl, .drk-width-1-6\\40 xl, .drk-width-5-6\\40 xl, .drk-width-small\\40 xl, .drk-width-medium\\40 xl, .drk-width-large\\40 xl, .drk-width-xlarge\\40 xl, .drk-width-2xlarge\\40 xl, .drk-width-auto\\40 xl": {
            "flex": "initial"
        }
    }
},
{
    ".drk-width-fit-content": {
        "width": "fit-content"
    },
    ".drk-width-max-content": {
        "width": "max-content"
    },
    ".drk-width-min-content": {
        "width": "min-content"
    }
},
];
