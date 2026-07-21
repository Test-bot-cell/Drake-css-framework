// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · modal.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-modal": {
        "display": "none",
        "position": "fixed",
        "top": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "z-index": 1010,
        "overflow-y": "auto",
        "padding": "15px 15px",
        "background": "rgba(0, 0, 0, 0.6)",
        "opacity": 0,
        "transition": "opacity 0.15s linear"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-modal": {
            "padding": "50px 30px"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-modal": {
            "padding-left": "40px",
            "padding-right": "40px"
        }
    }
},
{
    ".drk-modal.drk-open": {
        "opacity": 1
    },
    ".drk-modal-page": {
        "overflow": "hidden"
    },
    ".drk-modal-dialog": {
        "position": "relative",
        "box-sizing": "border-box",
        "margin": "0 auto",
        "width": "600px",
        "max-width": "100% !important",
        "background": "#fff",
        "opacity": 0,
        "transform": "translateY(-100px)",
        "transition": "0.3s linear"
    }
},
{
    ".drk-modal-dialog": {
        "transition-property": "opacity, transform"
    }
},
{
    ".drk-open > .drk-modal-dialog": {
        "opacity": 1,
        "transform": "translateY(0)"
    },
    ".drk-modal-container .drk-modal-dialog": {
        "width": "1200px"
    },
    ".drk-modal-full": {
        "padding": "__DRK_RAW__0__",
        "background": "none"
    },
    ".drk-modal-full .drk-modal-dialog": {
        "margin": "__DRK_RAW__0__",
        "width": "100%",
        "max-width": "100%",
        "transform": "translateY(0)"
    },
    ".drk-modal-body": {
        "display": "flow-root",
        "padding": "20px 20px"
    },
    ".drk-modal-header": {
        "display": "flow-root",
        "padding": "10px 20px",
        "background": "#fff",
        "border-bottom": "1px solid #e5e5e5"
    },
    ".drk-modal-footer": {
        "display": "flow-root",
        "padding": "10px 20px",
        "background": "#fff",
        "border-top": "1px solid #e5e5e5"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-modal-body": {
            "padding": "30px 30px"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-modal-header": {
            "padding": "15px 30px"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-modal-footer": {
            "padding": "15px 30px"
        }
    }
},
{
    ".drk-modal-body > :last-child, .drk-modal-header > :last-child, .drk-modal-footer > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-modal-title": {
        "font-size": "2rem",
        "line-height": 1.3
    },
    "[class*=\"drk-modal-close-\"]": {
        "position": "absolute",
        "z-index": 1010,
        "top": "10px",
        "right": "10px",
        "padding": "5px"
    },
    "[class*=\"drk-modal-close-\"]:first-child + *": {
        "margin-top": "__DRK_RAW__0__"
    },
    ".drk-modal-close-outside": {
        "top": "__DRK_RAW__0__",
        "right": "-5px",
        "transform": "translate(0, -100%)",
        "color": "#ffffff"
    },
    ".drk-modal-close-outside:hover": {
        "color": "#fff"
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-modal-close-outside": {
            "right": "__DRK_RAW__0__",
            "transform": "translate(100%, -100%)"
        }
    }
},
{
    ".drk-modal-close-full": {
        "top": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__",
        "padding": "10px",
        "background": "#fff"
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-modal-close-full": {
            "padding": "20px"
        }
    }
},
];
