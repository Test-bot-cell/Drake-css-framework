// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · divider.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    "[class*=\"drk-divider\"]": {
        "border": "none",
        "margin-bottom": "20px"
    },
    "* + [class*=\"drk-divider\"]": {
        "margin-top": "20px"
    },
    ".drk-divider-icon": {
        "position": "relative",
        "height": "20px",
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e5e5e5%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M3%2012a9%209%200%201%200%2018%200a9%209%200%201%200%20-18%200%22%20%2F%3E%3C%2Fsvg%3E\\\")",
        "background-repeat": "no-repeat",
        "background-position": "50% 50%"
    },
    ".drk-divider-icon::before, .drk-divider-icon::after": {
        "content": "\"\"",
        "position": "absolute",
        "top": "50%",
        "max-width": "calc(50% - (50px / 2))",
        "border-bottom": "1px solid #e5e5e5"
    }
},
{
    ".drk-divider-icon::before": {
        "right": "calc(50% + (50px / 2))",
        "width": "100%"
    },
    ".drk-divider-icon::after": {
        "left": "calc(50% + (50px / 2))",
        "width": "100%"
    },
    ".drk-divider-small": {
        "line-height": 0
    },
    ".drk-divider-small::after": {
        "content": "\"\"",
        "display": "inline-block",
        "width": "100px",
        "max-width": "100%",
        "border-top": "1px solid #e5e5e5",
        "vertical-align": "top"
    },
    ".drk-divider-vertical": {
        "width": "max-content",
        "height": "100px",
        "margin-left": "auto",
        "margin-right": "auto",
        "border-left": "1px solid #e5e5e5"
    }
},
];
