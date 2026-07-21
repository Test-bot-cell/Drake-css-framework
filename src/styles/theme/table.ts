// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · table.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-table": {
        "border-collapse": "collapse",
        "border-spacing": "__DRK_RAW__0__",
        "width": "100%",
        "margin-bottom": "20px"
    },
    "* + .drk-table": {
        "margin-top": "20px"
    },
    ".drk-table th": {
        "padding": "16px 12px",
        "text-align": "left",
        "vertical-align": "bottom",
        "font-size": "0.875rem",
        "font-weight": "normal",
        "color": palette.muted,
        "text-transform": "uppercase"
    },
    ".drk-table td": {
        "padding": "16px 12px",
        "vertical-align": "top"
    },
    ".drk-table td > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-table tfoot": {
        "font-size": "0.875rem"
    },
    ".drk-table caption": {
        "font-size": "0.875rem",
        "text-align": "left",
        "color": palette.muted
    },
    ".drk-table-middle, .drk-table-middle td": {
        "vertical-align": "middle !important"
    },
    ".drk-table-divider > tr:not(:first-child), .drk-table-divider > :not(:first-child) > tr, .drk-table-divider > :first-child > tr:not(:first-child)": {
        "border-top": "1px solid #e5e5e5"
    },
    ".drk-table-striped > tr:nth-of-type(odd), .drk-table-striped tbody tr:nth-of-type(odd)": {
        "background": palette.mutedBackground,
        "border-top": "1px solid #e5e5e5",
        "border-bottom": "1px solid #e5e5e5"
    },
    ".drk-table-hover > tr:hover, .drk-table-hover tbody tr:hover": {
        "background": "#ffd"
    },
    ".drk-table > tr.drk-active, .drk-table tbody tr.drk-active": {
        "background": "#ffd"
    },
    ".drk-table-small th, .drk-table-small td": {
        "padding": "10px 12px"
    },
    ".drk-table-large th, .drk-table-large td": {
        "padding": "22px 12px"
    },
    ".drk-table-justify th:first-child, .drk-table-justify td:first-child": {
        "padding-left": "__DRK_RAW__0__"
    },
    ".drk-table-justify th:last-child, .drk-table-justify td:last-child": {
        "padding-right": "__DRK_RAW__0__"
    },
    ".drk-table-shrink": {
        "width": "1px"
    },
    ".drk-table-expand": {
        "min-width": "150px"
    },
    ".drk-table-link": {
        "padding": "0 !important"
    },
    ".drk-table-link > a": {
        "display": "block",
        "padding": "16px 12px"
    },
    ".drk-table-small .drk-table-link > a": {
        "padding": "10px 12px"
    },
    ".drk-table-responsive": {
        "display": "block",
        "width": "100%",
        "max-width": "100%",
        "overflow-x": "auto",
        "overscroll-behavior-inline": "contain",
        "-webkit-overflow-scrolling": "touch"
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-table-responsive": {
            "display": "table",
            "overflow-x": "visible"
        }
    }
},
{
    ".drk-table tbody tr": {
        "transition": "background-color 0.1s linear"
    },
    ".drk-table-striped > tr:nth-of-type(even):last-child, .drk-table-striped tbody tr:nth-of-type(even):last-child": {
        "border-bottom": "1px solid #e5e5e5"
    }
},
];
