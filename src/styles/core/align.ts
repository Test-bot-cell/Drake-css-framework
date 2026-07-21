// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · align.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    "[class*=\"drk-align\"]": {
        "display": "block",
        "margin-bottom": "30px"
    },
    "* + [class*=\"drk-align\"]": {
        "margin-top": "30px"
    },
    ".drk-align-center": {
        "margin-left": "auto",
        "margin-right": "auto"
    },
    ".drk-align-left": {
        "margin-top": "__DRK_RAW__0__",
        "margin-right": "30px",
        "float": "left"
    },
    ".drk-align-right": {
        "margin-top": "__DRK_RAW__0__",
        "margin-left": "30px",
        "float": "right"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-align-left\\40 s": {
            "margin-top": "__DRK_RAW__0__",
            "margin-right": "30px",
            "float": "left"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-align-right\\40 s": {
            "margin-top": "__DRK_RAW__0__",
            "margin-left": "30px",
            "float": "right"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-align-left\\40 m": {
            "margin-top": "__DRK_RAW__0__",
            "margin-right": "30px",
            "float": "left"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-align-right\\40 m": {
            "margin-top": "__DRK_RAW__0__",
            "margin-left": "30px",
            "float": "right"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-align-left\\40 l": {
            "margin-top": "__DRK_RAW__0__",
            "float": "left"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-align-right\\40 l": {
            "margin-top": "__DRK_RAW__0__",
            "float": "right"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-align-left, .drk-align-left\\40 s, .drk-align-left\\40 m, .drk-align-left\\40 l": {
            "margin-right": "40px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.l})`]: {
        ".drk-align-right, .drk-align-right\\40 s, .drk-align-right\\40 m, .drk-align-right\\40 l": {
            "margin-left": "40px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-align-left\\40 xl": {
            "margin-top": "__DRK_RAW__0__",
            "margin-right": "40px",
            "float": "left"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.xl})`]: {
        ".drk-align-right\\40 xl": {
            "margin-top": "__DRK_RAW__0__",
            "margin-left": "40px",
            "float": "right"
        }
    }
},
];
