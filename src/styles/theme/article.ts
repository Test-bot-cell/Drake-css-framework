// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · article.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-article": {
        "display": "flow-root"
    },
    ".drk-article > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-article + .drk-article": {
        "margin-top": "70px"
    },
    ".drk-article-title": {
        "font-size": "2.23125rem",
        "line-height": 1.2
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-article-title": {
            "font-size": "2.625rem"
        }
    }
},
{
    ".drk-article-meta": {
        "font-size": "0.875rem",
        "line-height": 1.4,
        "color": palette.muted
    },
    ".drk-article-meta a": {
        "color": palette.muted
    },
    ".drk-article-meta a:hover": {
        "color": palette.text,
        "text-decoration": "none"
    }
},
];
