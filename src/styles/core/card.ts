// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · card.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-card": {
        "position": "relative",
        "box-sizing": "border-box"
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
        "line-height": 0
    },
    ".drk-card-badge:first-child + *": {
        "margin-top": "__DRK_RAW__0__"
    },
    ".drk-card-hover:not(.drk-card-default, .drk-card-primary, .drk-card-secondary, .drk-card-overlay):hover": {
        "background-color": "#f8f8f8"
    },
    ".drk-card-default": {
        "--drk-inverse": "dark",
        "background-color": "#f8f8f8",
        "color": "#666"
    },
    ".drk-card-default .drk-card-title": {
        "color": "#333"
    },
    ".drk-card-default.drk-card-hover:hover": {
        "background-color": "#ebebeb"
    }
},
{
    ".drk-card-primary": {
        "--drk-inverse": "light",
        "background-color": "#1e87f0",
        "color": "#fff"
    },
    ".drk-card-primary .drk-card-title": {
        "color": "#fff"
    },
    ".drk-card-primary.drk-card-hover:hover": {
        "background-color": "#0f7ae5"
    },
    ".drk-card-secondary": {
        "--drk-inverse": "light",
        "background-color": "#222",
        "color": "#fff"
    },
    ".drk-card-secondary .drk-card-title": {
        "color": "#fff"
    },
    ".drk-card-secondary.drk-card-hover:hover": {
        "background-color": "#151515"
    },
    ".drk-card-overlay": {
        "--drk-inverse": "dark",
        "background-color": "rgba(255, 255, 255, 0.9)",
        "color": "#666"
    },
    ".drk-card-overlay .drk-card-title": {
        "color": "#333"
    },
    ".drk-card-overlay.drk-card-hover:hover": {
        "background-color": "#ffffff"
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
];
