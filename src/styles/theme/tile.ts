// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · tile.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-tile": {
        "display": "flow-root",
        "position": "relative",
        "box-sizing": "border-box",
        "padding-left": "15px",
        "padding-right": "15px",
        "padding-top": "40px",
        "padding-bottom": "40px"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-tile": {
            "padding-left": "30px",
            "padding-right": "30px"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-tile": {
            "padding-left": "40px",
            "padding-right": "40px",
            "padding-top": "70px",
            "padding-bottom": "70px"
        }
    }
},
{
    ".drk-tile > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-tile-xsmall": {
        "padding-top": "20px",
        "padding-bottom": "20px"
    },
    ".drk-tile-small": {
        "padding-top": "40px",
        "padding-bottom": "40px"
    },
    ".drk-tile-large": {
        "padding-top": "70px",
        "padding-bottom": "70px"
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-tile-large": {
            "padding-top": "140px",
            "padding-bottom": "140px"
        }
    }
},
{
    ".drk-tile-xlarge": {
        "padding-top": "140px",
        "padding-bottom": "140px"
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-tile-xlarge": {
            "padding-top": "210px",
            "padding-bottom": "210px"
        }
    }
},
{
    ".drk-tile-default": {
        "--drk-inverse": "dark",
        "background-color": "#fff"
    },
    ".drk-tile-muted": {
        "--drk-inverse": "dark",
        "background-color": "#f8f8f8"
    },
    ".drk-tile-primary": {
        "--drk-inverse": "light",
        "background-color": "#1e87f0"
    },
    ".drk-tile-secondary": {
        "--drk-inverse": "light",
        "background-color": "#222"
    }
},
];
