// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · nav.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-nav, .drk-nav ul": {
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-nav li > a": {
        "display": "flex",
        "align-items": "center",
        "column-gap": "0.25em",
        "text-decoration": "none"
    },
    ".drk-nav > li > a": {
        "padding": "5px 0"
    },
    "ul.drk-nav-sub": {
        "padding": "5px 0 5px 15px"
    },
    ".drk-nav-sub ul": {
        "padding-left": "15px"
    },
    ".drk-nav-sub a": {
        "padding": "2px 0"
    },
    ".drk-nav-parent-icon": {
        "--drk-icon-width": "12px",
        "--drk-icon-height": "12px",
        "flex": "none",
        "margin-left": "auto",
        "transition": "transform 0.3s ease-out"
    },
    ".drk-nav > li.drk-open > a .drk-nav-parent-icon": {
        "transform": "rotateX(180deg)"
    },
    ".drk-nav-primary .drk-nav-parent-icon": {
        "--drk-icon-width": "14px",
        "--drk-icon-height": "14px"
    },
    ".drk-nav-header": {
        "padding": "5px 0",
        "text-transform": "uppercase",
        "font-size": "0.875rem"
    },
    ".drk-nav-header:not(:first-child)": {
        "margin-top": "20px"
    },
    ".drk-nav .drk-nav-divider": {
        "margin": "5px 0"
    },
    ".drk-nav-default": {
        "font-size": "0.875rem",
        "line-height": 1.5
    },
    ".drk-nav-default > li > a": {
        "color": "#999"
    },
    ".drk-nav-default > li > a:hover": {
        "color": "#666"
    },
    ".drk-nav-default > li.drk-active > a": {
        "color": "#333"
    },
    ".drk-nav-default .drk-nav-subtitle": {
        "font-size": "12px"
    },
    ".drk-nav-default .drk-nav-header": {
        "color": "#333"
    },
    ".drk-nav-default .drk-nav-divider": {
        "border-top": "1px solid #e5e5e5"
    },
    ".drk-nav-default .drk-nav-sub": {
        "font-size": "0.875rem",
        "line-height": 1.5
    },
    ".drk-nav-default .drk-nav-sub a": {
        "color": "#999"
    },
    ".drk-nav-default .drk-nav-sub a:hover": {
        "color": "#666"
    },
    ".drk-nav-default .drk-nav-sub li.drk-active > a": {
        "color": "#333"
    },
    ".drk-nav-primary": {
        "font-size": "1.5rem",
        "line-height": 1.5
    },
    ".drk-nav-primary > li > a": {
        "color": "#999"
    },
    ".drk-nav-primary > li > a:hover": {
        "color": "#666"
    },
    ".drk-nav-primary > li.drk-active > a": {
        "color": "#333"
    },
    ".drk-nav-primary .drk-nav-subtitle": {
        "font-size": "1.25rem"
    },
    ".drk-nav-primary .drk-nav-header": {
        "color": "#333"
    },
    ".drk-nav-primary .drk-nav-divider": {
        "border-top": "1px solid #e5e5e5"
    },
    ".drk-nav-primary .drk-nav-sub": {
        "font-size": "1.25rem",
        "line-height": 1.5
    },
    ".drk-nav-primary .drk-nav-sub a": {
        "color": "#999"
    },
    ".drk-nav-primary .drk-nav-sub a:hover": {
        "color": "#666"
    },
    ".drk-nav-primary .drk-nav-sub li.drk-active > a": {
        "color": "#333"
    },
    ".drk-nav-secondary": {
        "font-size": "16px",
        "line-height": 1.5
    },
    ".drk-nav-secondary > :not(.drk-nav-divider) + :not(.drk-nav-header, .drk-nav-divider)": {
        "margin-top": "__DRK_RAW__0__"
    },
    ".drk-nav-secondary > li > a": {
        "color": "#333",
        "padding": "10px 10px"
    },
    ".drk-nav-secondary > li > a:hover": {
        "color": "#333",
        "background-color": "#f8f8f8"
    },
    ".drk-nav-secondary > li.drk-active > a": {
        "color": "#333",
        "background-color": "#f8f8f8"
    },
    ".drk-nav-secondary .drk-nav-subtitle": {
        "font-size": "0.875rem",
        "color": "#999"
    },
    ".drk-nav-secondary > li > a:hover .drk-nav-subtitle": {
        "color": "#666"
    },
    ".drk-nav-secondary > li.drk-active > a .drk-nav-subtitle": {
        "color": "#333"
    },
    ".drk-nav-secondary .drk-nav-header": {
        "color": "#333"
    },
    ".drk-nav-secondary .drk-nav-divider": {
        "border-top": "1px solid #e5e5e5"
    },
    ".drk-nav-secondary .drk-nav-sub": {
        "font-size": "0.875rem",
        "line-height": 1.5
    },
    ".drk-nav-secondary .drk-nav-sub a": {
        "color": "#999"
    },
    ".drk-nav-secondary .drk-nav-sub a:hover": {
        "color": "#666"
    },
    ".drk-nav-secondary .drk-nav-sub li.drk-active > a": {
        "color": "#333"
    },
    ".drk-nav-medium": {
        "font-size": "2.8875rem",
        "line-height": 1
    },
    ".drk-nav-large": {
        "font-size": "3.4rem",
        "line-height": 1
    },
    ".drk-nav-xlarge": {
        "font-size": "4rem",
        "line-height": 1
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-nav-medium": {
            "font-size": "3.5rem"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-nav-large": {
            "font-size": "4rem"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-nav-xlarge": {
            "font-size": "6rem"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-nav-medium": {
            "font-size": "4rem"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-nav-large": {
            "font-size": "6rem"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-nav-xlarge": {
            "font-size": "8rem"
        }
    }
},
{
    ".drk-nav-center": {
        "text-align": "center"
    },
    ".drk-nav-center li > a": {
        "justify-content": "center"
    },
    ".drk-nav-center .drk-nav-sub, .drk-nav-center .drk-nav-sub ul": {
        "padding-left": "__DRK_RAW__0__"
    },
    ".drk-nav-center .drk-nav-parent-icon": {
        "margin-left": "0.25em"
    },
    ".drk-nav.drk-nav-divider > :not(.drk-nav-header, .drk-nav-divider) + :not(.drk-nav-header, .drk-nav-divider)": {
        "margin-top": "5px",
        "padding-top": "5px",
        "border-top": "1px solid #e5e5e5"
    }
},
];
