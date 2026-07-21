// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · background.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-background-default": {
        "background-color": "#fff"
    },
    ".drk-background-muted": {
        "background-color": palette.mutedBackground
    },
    ".drk-background-primary": {
        "background-color": palette.primary
    },
    ".drk-background-secondary": {
        "background-color": palette.secondary
    },
    ".drk-background-cover, .drk-background-contain, .drk-background-width-1-1, .drk-background-height-1-1": {
        "background-position": "50% 50%",
        "background-repeat": "no-repeat"
    }
},
{
    ".drk-background-cover": {
        "background-size": "cover"
    },
    ".drk-background-contain": {
        "background-size": "contain"
    },
    ".drk-background-width-1-1": {
        "background-size": "100%"
    },
    ".drk-background-height-1-1": {
        "background-size": "auto 100%"
    },
    ".drk-background-top-left": {
        "background-position": "0 0"
    },
    ".drk-background-top-center": {
        "background-position": "50% 0"
    },
    ".drk-background-top-right": {
        "background-position": "100% 0"
    },
    ".drk-background-center-left": {
        "background-position": "0 50%"
    },
    ".drk-background-center-center": {
        "background-position": "50% 50%"
    },
    ".drk-background-center-right": {
        "background-position": "100% 50%"
    },
    ".drk-background-bottom-left": {
        "background-position": "0 100%"
    },
    ".drk-background-bottom-center": {
        "background-position": "50% 100%"
    },
    ".drk-background-bottom-right": {
        "background-position": "100% 100%"
    },
    ".drk-background-norepeat": {
        "background-repeat": "no-repeat"
    },
    ".drk-background-fixed": {
        "background-attachment": "fixed"
    }
},
{
    "@media (pointer: coarse)": {
        ".drk-background-fixed": {
            "background-attachment": "scroll"
        }
    }
},
{
    "@media (max-width: 639px)": {
        ".drk-background-image\\40 s": {
            "background-image": "none !important"
        }
    }
},
{
    "@media (max-width: 959px)": {
        ".drk-background-image\\40 m": {
            "background-image": "none !important"
        }
    }
},
{
    "@media (max-width: 1199px)": {
        ".drk-background-image\\40 l": {
            "background-image": "none !important"
        }
    }
},
{
    "@media (max-width: 1599px)": {
        ".drk-background-image\\40 xl": {
            "background-image": "none !important"
        }
    }
},
{
    ".drk-background-blend-multiply": {
        "background-blend-mode": "multiply"
    },
    ".drk-background-blend-screen": {
        "background-blend-mode": "screen"
    },
    ".drk-background-blend-overlay": {
        "background-blend-mode": "overlay"
    },
    ".drk-background-blend-darken": {
        "background-blend-mode": "darken"
    },
    ".drk-background-blend-lighten": {
        "background-blend-mode": "lighten"
    },
    ".drk-background-blend-color-dodge": {
        "background-blend-mode": "color-dodge"
    },
    ".drk-background-blend-color-burn": {
        "background-blend-mode": "color-burn"
    },
    ".drk-background-blend-hard-light": {
        "background-blend-mode": "hard-light"
    },
    ".drk-background-blend-soft-light": {
        "background-blend-mode": "soft-light"
    },
    ".drk-background-blend-difference": {
        "background-blend-mode": "difference"
    },
    ".drk-background-blend-exclusion": {
        "background-blend-mode": "exclusion"
    },
    ".drk-background-blend-hue": {
        "background-blend-mode": "hue"
    },
    ".drk-background-blend-saturation": {
        "background-blend-mode": "saturation"
    },
    ".drk-background-blend-color": {
        "background-blend-mode": "color"
    },
    ".drk-background-blend-luminosity": {
        "background-blend-mode": "luminosity"
    }
},
];
