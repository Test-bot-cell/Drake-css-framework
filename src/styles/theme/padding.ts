// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · padding.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-padding": {
        "padding": "30px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-padding": {
            "padding": "40px"
        }
    }
},
{
    ".drk-padding-small": {
        "padding": "15px"
    },
    ".drk-padding-large": {
        "padding": "40px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-padding-large": {
            "padding": "70px"
        }
    }
},
{
    ".drk-padding-remove": {
        "padding": "0 !important"
    },
    ".drk-padding-remove-top": {
        "padding-top": "0 !important"
    },
    ".drk-padding-remove-bottom": {
        "padding-bottom": "0 !important"
    },
    ".drk-padding-remove-left": {
        "padding-left": "0 !important"
    },
    ".drk-padding-remove-right": {
        "padding-right": "0 !important"
    },
    ".drk-padding-remove-vertical": {
        "padding-top": "0 !important",
        "padding-bottom": "0 !important"
    },
    ".drk-padding-remove-horizontal": {
        "padding-left": "0 !important",
        "padding-right": "0 !important"
    }
},
];
