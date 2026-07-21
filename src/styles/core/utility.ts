// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · utility.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-panel": {
        "display": "flow-root",
        "position": "relative",
        "box-sizing": "border-box"
    },
    ".drk-panel > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-panel-scrollable": {
        "height": "170px",
        "padding": "10px",
        "border": "1px solid #e5e5e5",
        "overflow": "auto",
        "resize": "both"
    },
    ".drk-clearfix::before": {
        "content": "\"\"",
        "display": "table-cell"
    },
    ".drk-clearfix::after": {
        "content": "\"\"",
        "display": "table",
        "clear": "both"
    },
    ".drk-float-left": {
        "float": "left"
    },
    ".drk-float-right": {
        "float": "right"
    },
    "[class*=\"drk-float-\"]": {
        "max-width": "100%"
    },
    ".drk-overflow-hidden": {
        "overflow": "hidden"
    },
    ".drk-overflow-auto": {
        "overflow": "auto"
    },
    ".drk-overflow-auto > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-overflow-fade-horizontal": {
        "overflow-x": "auto",
        "--drk-overflow-fade-direction": "right"
    },
    ".drk-overflow-fade-vertical": {
        "overflow-y": "auto",
        "--drk-overflow-fade-direction": "bottom"
    }
},
{
    ".drk-overflow-fade-horizontal, .drk-overflow-fade-vertical": {
        "-webkit-overflow-scrolling": "touch",
        "-ms-overflow-style": "-ms-autohiding-scrollbar",
        "mask-image": "linear-gradient(to var(--drk-overflow-fade-direction), rgba(0, 0, 0, var(--drk-overflow-fade-start-opacity)), #000 100px, #000 calc(100% - 100px), rgba(0, 0, 0, var(--drk-overflow-fade-end-opacity)))",
        "scrollbar-width": "none"
    },
    ".drk-overflow-fade-horizontal > *, .drk-overflow-fade-vertical > *": {
        "min-width": "max-content"
    },
    ".drk-box-sizing-content": {
        "box-sizing": "content-box"
    },
    ".drk-box-sizing-border": {
        "box-sizing": "border-box"
    },
    ".drk-resize": {
        "resize": "both"
    },
    ".drk-resize-horizontal": {
        "resize": "horizontal"
    },
    ".drk-resize-vertical": {
        "resize": "vertical"
    },
    ".drk-display-block": {
        "display": "block !important"
    },
    ".drk-display-inline": {
        "display": "inline !important"
    },
    ".drk-display-inline-block": {
        "display": "inline-block !important"
    },
    "[class*=\"drk-inline\"]": {
        "display": "inline-block",
        "position": "relative",
        "max-width": "100%",
        "vertical-align": "middle",
        "-webkit-backface-visibility": "hidden"
    },
    ".drk-inline-clip": {
        "overflow": "hidden"
    },
    ".drk-preserve-width, .drk-preserve-width canvas, .drk-preserve-width img, .drk-preserve-width svg, .drk-preserve-width video": {
        "max-width": "none",
        "object-fit": "fill"
    },
    ".drk-responsive-width, .drk-responsive-height": {
        "box-sizing": "border-box"
    }
},
{
    ".drk-responsive-width": {
        "max-width": "100% !important",
        "height": "auto"
    },
    ".drk-responsive-height": {
        "max-height": "100%",
        "width": "auto",
        "max-width": "none"
    },
    "[drk-responsive], [data-drk-responsive]": {
        "max-width": "100%"
    },
    ".drk-object-cover": {
        "object-fit": "cover"
    },
    ".drk-object-contain": {
        "object-fit": "contain"
    },
    ".drk-object-fill": {
        "object-fit": "fill"
    },
    ".drk-object-none": {
        "object-fit": "none"
    },
    ".drk-object-scale-down": {
        "object-fit": "scale-down"
    },
    ".drk-object-top-left": {
        "object-position": "0 0"
    },
    ".drk-object-top-center": {
        "object-position": "50% 0"
    },
    ".drk-object-top-right": {
        "object-position": "100% 0"
    },
    ".drk-object-center-left": {
        "object-position": "0 50%"
    },
    ".drk-object-center-center": {
        "object-position": "50% 50%"
    },
    ".drk-object-center-right": {
        "object-position": "100% 50%"
    },
    ".drk-object-bottom-left": {
        "object-position": "0 100%"
    },
    ".drk-object-bottom-center": {
        "object-position": "50% 100%"
    },
    ".drk-object-bottom-right": {
        "object-position": "100% 100%"
    },
    ".drk-border-circle": {
        "border-radius": "50%"
    },
    ".drk-border-pill": {
        "border-radius": "500px"
    },
    ".drk-border-rounded": {
        "border-radius": "5px"
    },
    ".drk-inline-clip[class*=\"drk-border-\"]": {
        "-webkit-transform": "translateZ(0)"
    },
    ".drk-box-shadow-small": {
        "box-shadow": "0 2px 8px rgba(0, 0, 0, 0.08)"
    },
    ".drk-box-shadow-medium": {
        "box-shadow": "0 5px 15px rgba(0, 0, 0, 0.08)"
    },
    ".drk-box-shadow-large": {
        "box-shadow": "0 14px 25px rgba(0, 0, 0, 0.16)"
    },
    ".drk-box-shadow-xlarge": {
        "box-shadow": "0 28px 50px rgba(0, 0, 0, 0.16)"
    },
    "[class*=\"drk-box-shadow-hover\"]": {
        "transition": "box-shadow 0.1s ease-in-out"
    },
    ".drk-box-shadow-hover-small:hover": {
        "box-shadow": "0 2px 8px rgba(0, 0, 0, 0.08)"
    },
    ".drk-box-shadow-hover-medium:hover": {
        "box-shadow": "0 5px 15px rgba(0, 0, 0, 0.08)"
    },
    ".drk-box-shadow-hover-large:hover": {
        "box-shadow": "0 14px 25px rgba(0, 0, 0, 0.16)"
    },
    ".drk-box-shadow-hover-xlarge:hover": {
        "box-shadow": "0 28px 50px rgba(0, 0, 0, 0.16)"
    }
},
{
    "@supports (filter: blur(0))": {
        ".drk-box-shadow-bottom": {
            "display": "inline-block",
            "position": "relative",
            "z-index": 0,
            "max-width": "100%",
            "vertical-align": "middle"
        }
    }
},
{
    "@supports (filter: blur(0))": {
        ".drk-box-shadow-bottom::after": {
            "content": "\"\"",
            "position": "absolute",
            "bottom": "-30px",
            "left": "__DRK_RAW__0__",
            "right": "__DRK_RAW__0__",
            "z-index": -1,
            "height": "30px",
            "border-radius": "100%",
            "background": "#444",
            "filter": "blur(20px)",
            "will-change": "filter"
        }
    }
},
{
    ".drk-dropcap::first-letter, .drk-dropcap > p:first-of-type::first-letter": {
        "display": "block",
        "margin-right": "10px",
        "float": "left",
        "font-size": "4.5em",
        "line-height": 1
    }
},
{
    "@-moz-document url-prefix()": {
        ".drk-dropcap::first-letter, .drk-dropcap > p:first-of-type::first-letter": {
            "margin-top": "1.1%"
        }
    }
},
{
    ".drk-logo": {
        "font-size": "1.5rem",
        "font-family": "\"InterVariable\", Inter, \"Inter Fallback\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"",
        "color": "#333",
        "text-decoration": "none"
    },
    ":where(.drk-logo)": {
        "display": "inline-block",
        "vertical-align": "middle"
    },
    ".drk-logo:hover": {
        "color": "#333",
        "text-decoration": "none"
    },
    ".drk-logo :where(img, svg, video)": {
        "display": "block"
    },
    ".drk-logo-inverse": {
        "display": "none"
    },
    ".drk-disabled": {
        "pointer-events": "none"
    },
    ".drk-drag, .drk-drag *": {
        "cursor": "move"
    },
    ".drk-drag iframe": {
        "pointer-events": "none"
    },
    ".drk-dragover": {
        "box-shadow": "0 0 20px rgba(100, 100, 100, 0.3)"
    },
    ".drk-blend-multiply": {
        "mix-blend-mode": "multiply"
    },
    ".drk-blend-screen": {
        "mix-blend-mode": "screen"
    },
    ".drk-blend-overlay": {
        "mix-blend-mode": "overlay"
    },
    ".drk-blend-darken": {
        "mix-blend-mode": "darken"
    },
    ".drk-blend-lighten": {
        "mix-blend-mode": "lighten"
    },
    ".drk-blend-color-dodge": {
        "mix-blend-mode": "color-dodge"
    },
    ".drk-blend-color-burn": {
        "mix-blend-mode": "color-burn"
    },
    ".drk-blend-hard-light": {
        "mix-blend-mode": "hard-light"
    },
    ".drk-blend-soft-light": {
        "mix-blend-mode": "soft-light"
    },
    ".drk-blend-difference": {
        "mix-blend-mode": "difference"
    },
    ".drk-blend-exclusion": {
        "mix-blend-mode": "exclusion"
    },
    ".drk-blend-hue": {
        "mix-blend-mode": "hue"
    },
    ".drk-blend-saturation": {
        "mix-blend-mode": "saturation"
    },
    ".drk-blend-color": {
        "mix-blend-mode": "color"
    },
    ".drk-blend-luminosity": {
        "mix-blend-mode": "luminosity"
    },
    ".drk-transform-center": {
        "transform": "translate(-50%, -50%)"
    },
    ".drk-transform-origin-top-left": {
        "transform-origin": "0 0"
    },
    ".drk-transform-origin-top-center": {
        "transform-origin": "50% 0"
    },
    ".drk-transform-origin-top-right": {
        "transform-origin": "100% 0"
    },
    ".drk-transform-origin-center-left": {
        "transform-origin": "0 50%"
    },
    ".drk-transform-origin-center-right": {
        "transform-origin": "100% 50%"
    },
    ".drk-transform-origin-bottom-left": {
        "transform-origin": "0 100%"
    },
    ".drk-transform-origin-bottom-center": {
        "transform-origin": "50% 100%"
    },
    ".drk-transform-origin-bottom-right": {
        "transform-origin": "100% 100%"
    }
},
];
