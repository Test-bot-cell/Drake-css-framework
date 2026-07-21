// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · notification.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-notification": {
        "position": "fixed",
        "top": "10px",
        "left": "10px",
        "right": "10px",
        "z-index": 1040,
        "box-sizing": "border-box",
        "width": "auto",
        "margin": "__DRK_RAW__0__"
    },
    ".drk-notification-bottom-left, .drk-notification-bottom-right, .drk-notification-bottom-center": {
        "top": "auto",
        "bottom": "10px"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-notification": {
            "right": "auto",
            "width": "350px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-notification-top-right, .drk-notification-bottom-right": {
            "left": "auto",
            "right": "10px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-notification-top-center, .drk-notification-bottom-center": {
            "left": "50%",
            "margin-left": "-175px"
        }
    }
},
{
    ".drk-notification-message": {
        "position": "relative",
        "padding": "15px",
        "background": palette.mutedBackground,
        "color": palette.text,
        "font-size": "1.25rem",
        "line-height": 1.4,
        "cursor": "pointer"
    },
    "* + .drk-notification-message": {
        "margin-top": "10px"
    },
    ".drk-notification-close": {
        "display": "none",
        "position": "absolute",
        "top": "20px",
        "right": "15px"
    },
    ".drk-notification-message:hover .drk-notification-close": {
        "display": "block"
    },
    ".drk-notification-message-primary": {
        "color": palette.primary
    },
    ".drk-notification-message-success": {
        "color": palette.success
    },
    ".drk-notification-message-warning": {
        "color": palette.warning
    },
    ".drk-notification-message-danger": {
        "color": palette.danger
    }
},
];
