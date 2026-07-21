// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · visibility.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    "[hidden], .drk-hidden, .drk-hidden-empty:empty": {
        "display": "none !important"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-hidden\\40 s": {
            "display": "none !important"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-hidden\\40 m": {
            "display": "none !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-hidden\\40 l": {
            "display": "none !important"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-hidden\\40 xl": {
            "display": "none !important"
        }
    }
},
{
    "@media (max-width: 639px)": {
        ".drk-visible\\40 s": {
            "display": "none !important"
        }
    }
},
{
    "@media (max-width: 959px)": {
        ".drk-visible\\40 m": {
            "display": "none !important"
        }
    }
},
{
    "@media (max-width: 1199px)": {
        ".drk-visible\\40 l": {
            "display": "none !important"
        }
    }
},
{
    "@media (max-width: 1599px)": {
        ".drk-visible\\40 xl": {
            "display": "none !important"
        }
    }
},
{
    ".drk-invisible": {
        "visibility": "hidden !important"
    },
    ".drk-hidden-visually:not(:focus):not(:active):not(:focus-within), .drk-visible-toggle:not(:hover):not(:focus) .drk-hidden-hover:not(:focus-visible):not(:has(:focus-visible)), .drk-visible-toggle:not(:hover):not(:focus) .drk-hidden-hover:not(:focus-within)": {
        "position": "absolute !important",
        "width": "0 !important",
        "height": "0 !important",
        "padding": "0 !important",
        "border-width": "0 !important",
        "margin": "0 !important",
        "overflow": "hidden !important"
    },
    ".drk-visible-toggle:not(:hover):not(:focus) .drk-invisible-hover:not(:focus-within)": {
        "opacity": "0 !important"
    }
},
{
    "@media (hover: none)": {
        ".drk-hidden-touch": {
            "display": "none !important"
        }
    }
},
{
    "@media (hover)": {
        ".drk-hidden-notouch": {
            "display": "none !important"
        }
    }
},
];
