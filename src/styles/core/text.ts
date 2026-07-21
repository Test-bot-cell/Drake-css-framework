// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · text.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-text-lead": {
        "font-size": "1.5rem",
        "line-height": 1.5,
        "color": "#333"
    },
    ".drk-text-meta": {
        "font-size": "0.875rem",
        "line-height": 1.4,
        "color": "#999"
    },
    ".drk-text-small": {
        "font-size": "0.875rem",
        "line-height": 1.5
    },
    ".drk-text-large": {
        "font-size": "1.5rem",
        "line-height": 1.5
    },
    ".drk-text-default": {
        "font-size": "16px",
        "line-height": 1.5
    },
    ".drk-text-light": {
        "font-weight": 300
    },
    ".drk-text-normal": {
        "font-weight": 400
    },
    ".drk-text-bold": {
        "font-weight": 700
    },
    ".drk-text-lighter": {
        "font-weight": "lighter"
    },
    ".drk-text-bolder": {
        "font-weight": "bolder"
    },
    ".drk-text-italic": {
        "font-style": "italic"
    },
    ".drk-text-capitalize": {
        "text-transform": "capitalize !important"
    },
    ".drk-text-uppercase": {
        "text-transform": "uppercase !important"
    },
    ".drk-text-lowercase": {
        "text-transform": "lowercase !important"
    },
    ".drk-text-decoration-none": {
        "text-decoration": "none !important"
    },
    ".drk-text-muted": {
        "color": "#999 !important"
    },
    ".drk-text-emphasis": {
        "color": "#333 !important"
    },
    ".drk-text-primary": {
        "color": "#1e87f0 !important"
    },
    ".drk-text-secondary": {
        "color": "#222 !important"
    },
    ".drk-text-success": {
        "color": "#32d296 !important"
    },
    ".drk-text-warning": {
        "color": "#faa05a !important"
    },
    ".drk-text-danger": {
        "color": "#f0506e !important"
    },
    ".drk-text-background": {
        "-webkit-background-clip": "text",
        "color": "transparent !important",
        "display": "inline-block",
        "background-color": "#1e87f0"
    },
    ".drk-text-left": {
        "text-align": "left !important"
    },
    ".drk-text-right": {
        "text-align": "right !important"
    },
    ".drk-text-center": {
        "text-align": "center !important"
    },
    ".drk-text-justify": {
        "text-align": "justify !important"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-text-left\\40 s": {
            "text-align": "left !important"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-text-right\\40 s": {
            "text-align": "right !important"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-text-center\\40 s": {
            "text-align": "center !important"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-text-left\\40 m": {
            "text-align": "left !important"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-text-right\\40 m": {
            "text-align": "right !important"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-text-center\\40 m": {
            "text-align": "center !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-text-left\\40 l": {
            "text-align": "left !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-text-right\\40 l": {
            "text-align": "right !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-text-center\\40 l": {
            "text-align": "center !important"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-text-left\\40 xl": {
            "text-align": "left !important"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-text-right\\40 xl": {
            "text-align": "right !important"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-text-center\\40 xl": {
            "text-align": "center !important"
        }
    }
},
{
    ".drk-text-top": {
        "vertical-align": "top !important"
    },
    ".drk-text-middle": {
        "vertical-align": "middle !important"
    },
    ".drk-text-bottom": {
        "vertical-align": "bottom !important"
    },
    ".drk-text-baseline": {
        "vertical-align": "baseline !important"
    },
    ".drk-text-nowrap": {
        "white-space": "nowrap"
    },
    ".drk-text-truncate": {
        "max-width": "100%",
        "overflow": "hidden",
        "text-overflow": "ellipsis",
        "white-space": "nowrap"
    },
    "th.drk-text-truncate, td.drk-text-truncate": {
        "max-width": "__DRK_RAW__0__"
    },
    ".drk-text-break": {
        "overflow-wrap": "break-word"
    },
    "th.drk-text-break, td.drk-text-break": {
        "word-break": "break-word"
    },
    ".drk-text-stroke": {
        "-webkit-text-stroke": "calc(1.4px + 0.002em)",
        "-webkit-text-fill-color": "transparent"
    }
},
];
