// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · link.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    "a.drk-link-muted, .drk-link-muted a, .drk-link-toggle .drk-link-muted": {
        "color": "#999"
    },
    "a.drk-link-muted:hover, .drk-link-muted a:hover, .drk-link-toggle:hover .drk-link-muted": {
        "color": "#666"
    },
    "a.drk-link-text, .drk-link-text a, .drk-link-toggle .drk-link-text": {
        "color": "inherit"
    },
    "a.drk-link-text:hover, .drk-link-text a:hover, .drk-link-toggle:hover .drk-link-text": {
        "color": "#999"
    },
    "a.drk-link-heading, .drk-link-heading a, .drk-link-toggle .drk-link-heading": {
        "color": "inherit"
    },
    "a.drk-link-heading:hover, .drk-link-heading a:hover, .drk-link-toggle:hover .drk-link-heading": {
        "color": "#1e87f0",
        "text-decoration": "none"
    },
    "a.drk-link-reset, .drk-link-reset a": {
        "color": "inherit !important",
        "text-decoration": "none !important"
    },
    ".drk-link-toggle": {
        "color": "inherit !important",
        "text-decoration": "none !important"
    }
},
];
