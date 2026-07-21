// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · section.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-section": {
        "display": "flow-root",
        "box-sizing": "border-box",
        "padding-top": "40px",
        "padding-bottom": "40px"
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-section": {
            "padding-top": "70px",
            "padding-bottom": "70px"
        }
    }
},
{
    ".drk-section > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-section-xsmall": {
        "padding-top": "20px",
        "padding-bottom": "20px"
    },
    ".drk-section-xsmall-top": {
        "padding-top": "20px"
    },
    ".drk-section-xsmall-bottom": {
        "padding-bottom": "20px"
    },
    ".drk-section-small": {
        "padding-top": "40px",
        "padding-bottom": "40px"
    },
    ".drk-section-small-top": {
        "padding-top": "40px"
    },
    ".drk-section-small-bottom": {
        "padding-bottom": "40px"
    },
    ".drk-section-medium-top": {
        "padding-top": "40px"
    },
    ".drk-section-medium-bottom": {
        "padding-bottom": "40px"
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-section-medium-top": {
            "padding-top": "70px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-section-medium-bottom": {
            "padding-bottom": "70px"
        }
    }
},
{
    ".drk-section-large": {
        "padding-top": "70px",
        "padding-bottom": "70px"
    },
    ".drk-section-large-top": {
        "padding-top": "70px"
    },
    ".drk-section-large-bottom": {
        "padding-bottom": "70px"
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-section-large": {
            "padding-top": "140px",
            "padding-bottom": "140px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-section-large-top": {
            "padding-top": "140px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-section-large-bottom": {
            "padding-bottom": "140px"
        }
    }
},
{
    ".drk-section-xlarge": {
        "padding-top": "140px",
        "padding-bottom": "140px"
    },
    ".drk-section-xlarge-top": {
        "padding-top": "140px"
    },
    ".drk-section-xlarge-bottom": {
        "padding-bottom": "140px"
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-section-xlarge": {
            "padding-top": "210px",
            "padding-bottom": "210px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-section-xlarge-top": {
            "padding-top": "210px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-section-xlarge-bottom": {
            "padding-bottom": "210px"
        }
    }
},
{
    ".drk-section-default": {
        "--drk-inverse": "dark",
        "background": "#fff"
    },
    ".drk-section-muted": {
        "--drk-inverse": "dark",
        "background": palette.mutedBackground
    },
    ".drk-section-primary": {
        "--drk-inverse": "light",
        "background": palette.primary
    },
    ".drk-section-secondary": {
        "--drk-inverse": "light",
        "background": palette.secondary
    }
},
];
