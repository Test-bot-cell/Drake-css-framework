// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · comment.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-comment-body": {
        "display": "flow-root",
        "overflow-wrap": "break-word",
        "word-wrap": "break-word"
    },
    ".drk-comment-header": {
        "display": "flow-root",
        "margin-bottom": "20px"
    },
    ".drk-comment-body > :last-child, .drk-comment-header > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-comment-title": {
        "font-size": "1.25rem",
        "line-height": 1.4
    },
    ".drk-comment-meta": {
        "font-size": "0.875rem",
        "line-height": 1.4,
        "color": "#999"
    },
    ".drk-comment-list": {
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-comment-list > :nth-child(n+2)": {
        "margin-top": "70px"
    },
    ".drk-comment-list .drk-comment ~ ul": {
        "margin": "70px 0 0 0",
        "padding-left": "30px",
        "list-style": "none"
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-comment-list .drk-comment ~ ul": {
            "padding-left": "100px"
        }
    }
},
{
    ".drk-comment-list .drk-comment ~ ul > :nth-child(n+2)": {
        "margin-top": "70px"
    }
},
];
