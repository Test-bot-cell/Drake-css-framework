// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · link.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    "a.drk-link-muted, .drk-link-muted a, .drk-link-toggle .drk-link-muted": {
        "color": palette.mutedText
    },
    "a.drk-link-muted:hover, .drk-link-muted a:hover, .drk-link-toggle:hover .drk-link-muted": {
        "color": palette.text
    },
    "a.drk-link-text, .drk-link-text a, .drk-link-toggle .drk-link-text": {
        "color": "inherit"
    },
    "a.drk-link-text:hover, .drk-link-text a:hover, .drk-link-toggle:hover .drk-link-text": {
        "color": palette.mutedText
    },
    "a.drk-link-heading, .drk-link-heading a, .drk-link-toggle .drk-link-heading": {
        "color": "inherit",
        "text-decoration": "none"
    },
    "a.drk-link-heading:hover, .drk-link-heading a:hover, .drk-link-toggle:hover .drk-link-heading": {
        "color": palette.primary,
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
