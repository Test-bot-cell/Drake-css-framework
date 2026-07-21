// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · search.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-search": {
        "display": "inline-block",
        "position": "relative",
        "max-width": "100%",
        "margin": "__DRK_RAW__0__"
    },
    ".drk-search-input::-webkit-search-cancel-button, .drk-search-input::-webkit-search-decoration": {
        "-webkit-appearance": "none"
    },
    ".drk-search-input::-moz-placeholder": {
        "opacity": 1
    },
    ".drk-search-input": {
        "box-sizing": "border-box",
        "margin": "__DRK_RAW__0__",
        "border-radius": "__DRK_RAW__0__",
        "font": "inherit",
        "overflow": "visible",
        "-webkit-appearance": "none",
        "vertical-align": "middle",
        "width": "100%"
    }
},
{
    ".drk-search-input": {
        "border": "none",
        "color": "#666"
    }
},
{
    ".drk-search-input:focus": {
        "outline": "none"
    },
    ".drk-search-input::placeholder": {
        "color": "#999"
    },
    ".drk-search .drk-search-icon": {
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "display": "inline-flex",
        "justify-content": "center",
        "align-items": "center",
        "color": "#999"
    },
    ".drk-search .drk-search-icon:hover": {
        "color": "#999"
    },
    ".drk-search .drk-search-icon:not(a):not(button):not(input)": {
        "pointer-events": "none"
    },
    ".drk-search .drk-search-icon-flip": {
        "right": "__DRK_RAW__0__",
        "left": "auto"
    },
    ".drk-search-default": {
        "width": "240px"
    },
    ".drk-search-default .drk-search-input": {
        "height": "40px",
        "padding-left": "10px",
        "padding-right": "10px",
        "background": "transparent",
        "border": "1px solid #e5e5e5"
    },
    ".drk-search-default .drk-search-input:focus": {
        "background-color": "rgba(0, 0, 0, 0)",
        "border-color": "#1e87f0"
    },
    ".drk-search-default .drk-search-icon": {
        "--drk-icon-width": "20px",
        "--drk-icon-height": "20px",
        "padding-left": "10px",
        "padding-right": "10px"
    },
    ".drk-search-default:has(.drk-search-icon:not(.drk-search-icon-flip)) .drk-search-input": {
        "padding-left": "40px"
    },
    ".drk-search-default:has(.drk-search-icon-flip) .drk-search-input": {
        "padding-right": "40px"
    },
    ".drk-search-navbar": {
        "width": "240px"
    },
    ".drk-search-navbar .drk-search-input": {
        "height": "40px",
        "padding-left": "10px",
        "padding-right": "10px",
        "background": "#fff",
        "border": "1px solid #e5e5e5"
    },
    ".drk-search-navbar .drk-search-input:focus": {
        "background-color": "#fff",
        "border-color": "#1e87f0"
    },
    ".drk-search-navbar .drk-search-icon": {
        "--drk-icon-width": "20px",
        "--drk-icon-height": "20px",
        "padding-left": "10px",
        "padding-right": "10px"
    },
    ".drk-search-navbar:has(.drk-search-icon:not(.drk-search-icon-flip)) .drk-search-input": {
        "padding-left": "40px"
    },
    ".drk-search-navbar:has(.drk-search-icon-flip) .drk-search-input": {
        "padding-right": "40px"
    },
    ".drk-search-medium": {
        "width": "400px"
    },
    ".drk-search-medium .drk-search-input": {
        "height": "55px",
        "padding-left": "12px",
        "padding-right": "12px",
        "background": "transparent",
        "font-size": "1.5rem",
        "border": "1px solid #e5e5e5"
    },
    ".drk-search-medium .drk-search-input:focus": {
        "background-color": "rgba(0, 0, 0, 0)",
        "border-color": "#1e87f0"
    },
    ".drk-search-medium .drk-search-icon": {
        "--drk-icon-width": "24px",
        "--drk-icon-height": "24px",
        "padding-left": "12px",
        "padding-right": "12px"
    },
    ".drk-search-medium:has(.drk-search-icon:not(.drk-search-icon-flip)) .drk-search-input": {
        "padding-left": "48px"
    },
    ".drk-search-medium:has(.drk-search-icon-flip) .drk-search-input": {
        "padding-right": "48px"
    },
    ".drk-search-large": {
        "width": "500px"
    },
    ".drk-search-large .drk-search-input": {
        "height": "90px",
        "padding-left": "20px",
        "padding-right": "20px",
        "background": "transparent",
        "font-size": "2.625rem",
        "border": "1px solid #e5e5e5"
    },
    ".drk-search-large .drk-search-input:focus": {
        "background-color": "rgba(0, 0, 0, 0)",
        "border-color": "#1e87f0"
    },
    ".drk-search-large .drk-search-icon": {
        "--drk-icon-width": "40px",
        "--drk-icon-height": "40px",
        "padding-left": "20px",
        "padding-right": "20px"
    },
    ".drk-search-large:has(.drk-search-icon:not(.drk-search-icon-flip)) .drk-search-input": {
        "padding-left": "80px"
    },
    ".drk-search-large:has(.drk-search-icon-flip) .drk-search-input": {
        "padding-right": "80px"
    },
    ".drk-search-toggle": {
        "color": "#999"
    },
    ".drk-search-toggle:hover": {
        "color": "#666"
    }
},
];
