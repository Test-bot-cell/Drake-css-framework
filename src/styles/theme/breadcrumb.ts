// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · breadcrumb.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-breadcrumb": {
        "padding": "__DRK_RAW__0__",
        "list-style": "none",
        "font-size": "__DRK_RAW__0__"
    },
    ".drk-breadcrumb > *": {
        "display": "contents"
    },
    ".drk-breadcrumb > * > *": {
        "font-size": "0.875rem",
        "color": palette.mutedText
    },
    ".drk-breadcrumb > * > :hover": {
        "color": palette.text,
        "text-decoration": "none"
    },
    ".drk-breadcrumb > :last-child > span, .drk-breadcrumb > :last-child > a:not([href])": {
        "color": palette.text
    },
    ".drk-breadcrumb > :nth-child(n+2):not(.drk-first-column)::before": {
        "content": "\"/\"",
        "display": "inline-block",
        "margin": "0 20px",
        "font-size": "0.875rem",
        "color": palette.mutedText
    }
},
];
