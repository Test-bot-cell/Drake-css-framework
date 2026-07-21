// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · dropdown.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-dropdown": {
        "--drk-position-offset": "10px",
        "--drk-position-viewport-offset": "15px",
        "--drk-inverse": "dark",
        "width": "auto",
        "min-width": "200px",
        "padding": "15px",
        "background": "#f8f8f8",
        "color": "#666"
    },
    ".drk-dropdown > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-dropdown :focus-visible": {
        "outline-color": "#333 !important"
    },
    ".drk-dropdown-large": {
        "padding": "40px"
    },
    ".drk-dropdown-dropbar": {
        "--drk-position-offset": "10px",
        "width": "auto",
        "background": "transparent",
        "padding": "15px 0 15px 0",
        "--drk-position-viewport-offset": "15px"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-dropdown-dropbar": {
            "--drk-position-viewport-offset": "30px"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-dropdown-dropbar": {
            "--drk-position-viewport-offset": "40px"
        }
    }
},
{
    ".drk-dropdown-dropbar-large": {
        "padding-top": "40px",
        "padding-bottom": "40px"
    },
    ".drk-dropdown-nav > li > a": {
        "color": "#999"
    },
    ".drk-dropdown-nav > li > a:hover, .drk-dropdown-nav > li.drk-active > a": {
        "color": "#666"
    },
    ".drk-dropdown-nav .drk-nav-subtitle": {
        "font-size": "0.875rem"
    },
    ".drk-dropdown-nav .drk-nav-header": {
        "color": "#333"
    },
    ".drk-dropdown-nav .drk-nav-divider": {
        "border-top": "1px solid #e5e5e5"
    },
    ".drk-dropdown-nav .drk-nav-sub a": {
        "color": "#999"
    },
    ".drk-dropdown-nav .drk-nav-sub a:hover, .drk-dropdown-nav .drk-nav-sub li.drk-active > a": {
        "color": "#666"
    }
},
];
