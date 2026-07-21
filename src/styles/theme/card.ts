// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · card.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-card": {
        "position": "relative",
        "box-sizing": "border-box",
        "transition": "box-shadow 0.1s ease-in-out"
    },
    ".drk-card-body": {
        "display": "flow-root",
        "padding": "30px 30px"
    },
    ".drk-card-header": {
        "display": "flow-root",
        "padding": "15px 30px"
    },
    ".drk-card-footer": {
        "display": "flow-root",
        "padding": "15px 30px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-body": {
            "padding": "40px 40px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-header": {
            "padding": "20px 40px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-footer": {
            "padding": "20px 40px"
        }
    }
},
{
    ".drk-card-body > :last-child, .drk-card-header > :last-child, .drk-card-footer > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-card-title": {
        "font-size": "1.5rem",
        "line-height": 1.4
    },
    ".drk-card-badge": {
        "position": "absolute",
        "top": "15px",
        "right": "15px",
        "z-index": 1,
        "height": "22px",
        "padding": "0 10px",
        "background": "#1e87f0",
        "color": "#fff",
        "font-size": "0.875rem",
        "display": "flex",
        "justify-content": "center",
        "align-items": "center",
        "line-height": 0,
        "border-radius": "2px",
        "text-transform": "uppercase"
    },
    ".drk-card-badge:first-child + *": {
        "margin-top": "__DRK_RAW__0__"
    },
    ".drk-card-hover:not(.drk-card-default, .drk-card-primary, .drk-card-secondary, .drk-card-overlay):hover": {
        "background-color": "#fff",
        "box-shadow": "0 14px 25px rgba(0, 0, 0, 0.16)"
    },
    ".drk-card-default": {
        "--drk-inverse": "dark",
        "background-color": "#fff",
        "color": "#666",
        "box-shadow": "0 5px 15px rgba(0, 0, 0, 0.08)"
    },
    ".drk-card-default .drk-card-title": {
        "color": "#333"
    },
    ".drk-card-default.drk-card-hover:hover": {
        "background-color": "#fff",
        "box-shadow": "0 14px 25px rgba(0, 0, 0, 0.16)"
    },
    ".drk-card-default .drk-card-header": {
        "border-bottom": "1px solid #e5e5e5"
    },
    ".drk-card-default .drk-card-footer": {
        "border-top": "1px solid #e5e5e5"
    }
},
{
    ".drk-card-primary": {
        "--drk-inverse": "light",
        "background-color": "#1e87f0",
        "color": "#fff",
        "box-shadow": "0 5px 15px rgba(0, 0, 0, 0.08)"
    },
    ".drk-card-primary .drk-card-title": {
        "color": "#fff"
    },
    ".drk-card-primary.drk-card-hover:hover": {
        "background-color": "#1e87f0",
        "box-shadow": "0 14px 25px rgba(0, 0, 0, 0.16)"
    },
    ".drk-card-secondary": {
        "--drk-inverse": "light",
        "background-color": "#222",
        "color": "#fff",
        "box-shadow": "0 5px 15px rgba(0, 0, 0, 0.08)"
    },
    ".drk-card-secondary .drk-card-title": {
        "color": "#fff"
    },
    ".drk-card-secondary.drk-card-hover:hover": {
        "background-color": "#222",
        "box-shadow": "0 14px 25px rgba(0, 0, 0, 0.16)"
    },
    ".drk-card-overlay": {
        "--drk-inverse": "dark",
        "background-color": "rgba(255, 255, 255, 0.9)",
        "color": "#666",
        "box-shadow": "0 5px 15px rgba(0, 0, 0, 0.08)"
    },
    ".drk-card-overlay .drk-card-title": {
        "color": "#333"
    },
    ".drk-card-overlay.drk-card-hover:hover": {
        "background-color": "#ffffff",
        "box-shadow": "0 14px 25px rgba(0, 0, 0, 0.16)"
    },
    ".drk-card-small.drk-card-body, .drk-card-small .drk-card-body": {
        "padding": "20px 20px"
    },
    ".drk-card-small .drk-card-header": {
        "padding": "13px 20px"
    },
    ".drk-card-small .drk-card-footer": {
        "padding": "13px 20px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-large.drk-card-body, .drk-card-large .drk-card-body": {
            "padding": "70px 70px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-large .drk-card-header": {
            "padding": "35px 70px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-large .drk-card-footer": {
            "padding": "35px 70px"
        }
    }
},
{
    ".drk-card-body > .drk-nav-default": {
        "margin-left": "-30px",
        "margin-right": "-30px"
    },
    ".drk-card-body > .drk-nav-default:only-child": {
        "margin-top": "-15px",
        "margin-bottom": "-15px"
    },
    ".drk-card-body > .drk-nav-default > li > a, .drk-card-body > .drk-nav-default .drk-nav-header, .drk-card-body > .drk-nav-default .drk-nav-divider": {
        "padding-left": "30px",
        "padding-right": "30px"
    },
    ".drk-card-body > .drk-nav-default .drk-nav-sub": {
        "padding-left": "45px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-body > .drk-nav-default": {
            "margin-left": "-40px",
            "margin-right": "-40px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-body > .drk-nav-default:only-child": {
            "margin-top": "-25px",
            "margin-bottom": "-25px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-body > .drk-nav-default > li > a, .drk-card-body > .drk-nav-default .drk-nav-header, .drk-card-body > .drk-nav-default .drk-nav-divider": {
            "padding-left": "40px",
            "padding-right": "40px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-body > .drk-nav-default .drk-nav-sub": {
            "padding-left": "55px"
        }
    }
},
{
    ".drk-card-small > .drk-nav-default": {
        "margin-left": "-20px",
        "margin-right": "-20px"
    },
    ".drk-card-small > .drk-nav-default:only-child": {
        "margin-top": "-5px",
        "margin-bottom": "-5px"
    },
    ".drk-card-small > .drk-nav-default > li > a, .drk-card-small > .drk-nav-default .drk-nav-header, .drk-card-small > .drk-nav-default .drk-nav-divider": {
        "padding-left": "20px",
        "padding-right": "20px"
    },
    ".drk-card-small > .drk-nav-default .drk-nav-sub": {
        "padding-left": "35px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-large > .drk-nav-default": {
            "margin": "__DRK_RAW__0__"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-large > .drk-nav-default:only-child": {
            "margin": "__DRK_RAW__0__"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-large > .drk-nav-default > li > a, .drk-card-large > .drk-nav-default .drk-nav-header, .drk-card-large > .drk-nav-default .drk-nav-divider": {
            "padding-left": "__DRK_RAW__0__",
            "padding-right": "__DRK_RAW__0__"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-card-large > .drk-nav-default .drk-nav-sub": {
            "padding-left": "15px"
        }
    }
},
];
