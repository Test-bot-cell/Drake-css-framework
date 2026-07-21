// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · lightbox.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-lightbox": {
        "--drk-inverse": "light",
        "display": "none",
        "position": "fixed",
        "top": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "z-index": 1010,
        "background": "#000",
        "opacity": 0,
        "transition": "opacity 0.15s linear",
        "touch-action": "pinch-zoom"
    },
    ".drk-lightbox.drk-open": {
        "display": "block",
        "opacity": 1
    },
    ".drk-lightbox :focus-visible": {
        "outline-color": "rgba(255, 255, 255, 0.7)"
    },
    ".drk-lightbox-page": {
        "overflow": "hidden"
    },
    ".drk-lightbox-items": {
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-lightbox-items > *": {
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "display": "none",
        "justify-content": "center",
        "align-items": "flex-start",
        "will-change": "transform, opacity",
        "overflow": "auto"
    },
    ".drk-lightbox-items > .drk-active": {
        "display": "flex"
    },
    ".drk-lightbox-items-fit > *": {
        "align-items": "center"
    },
    ".drk-lightbox-items-fit > * > *": {
        "max-width": "100vw",
        "max-height": "100vh"
    },
    ".drk-lightbox-items-fit > * > :not(iframe)": {
        "object-fit": "contain"
    },
    ".drk-lightbox-items.drk-lightbox-items-fit .drk-lightbox-zoom:hover": {
        "cursor": "zoom-in"
    },
    ".drk-lightbox-items:not(.drk-lightbox-items-fit) .drk-lightbox-zoom:hover": {
        "cursor": "zoom-out"
    },
    ".drk-lightbox-thumbnav-vertical :where(img, video)": {
        "max-width": "100px"
    }
},
{
    ".drk-lightbox-thumbnav:not(.drk-lightbox-thumbnav-vertical) :where(img, video)": {
        "max-height": "100px"
    },
    ".drk-lightbox-thumbnav:empty, .drk-lightbox-dotnav:empty": {
        "display": "none"
    },
    ".drk-lightbox-caption:empty": {
        "display": "none"
    },
    ".drk-lightbox-caption": {
        "padding": "10px 10px",
        "background": "rgba(0, 0, 0, 0.3)",
        "color": "rgba(255, 255, 255, 0.7)"
    },
    ".drk-lightbox-caption > *": {
        "color": "rgba(255, 255, 255, 0.7)"
    },
    ".drk-lightbox-counter:empty": {
        "display": "none"
    },
    ".drk-lightbox-iframe": {
        "width": "80%",
        "height": "80%"
    }
},
];
