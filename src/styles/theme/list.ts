// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · list.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-list": {
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-list > *": {
        "break-inside": "avoid-column"
    },
    ".drk-list > * > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-list > :nth-child(n+2), .drk-list > * > ul": {
        "margin-top": "10px"
    },
    ".drk-list-disc, .drk-list-circle, .drk-list-square, .drk-list-decimal, .drk-list-hyphen": {
        "padding-left": "30px"
    }
},
{
    ".drk-list-disc": {
        "list-style-type": "disc"
    },
    ".drk-list-circle": {
        "list-style-type": "circle"
    },
    ".drk-list-square": {
        "list-style-type": "square"
    },
    ".drk-list-decimal": {
        "list-style-type": "decimal"
    },
    ".drk-list-hyphen": {
        "list-style-type": "'–  '"
    },
    ".drk-list-muted > ::marker": {
        "color": "#999 !important"
    },
    ".drk-list-emphasis > ::marker": {
        "color": "#333 !important"
    },
    ".drk-list-primary > ::marker": {
        "color": "#1e87f0 !important"
    },
    ".drk-list-secondary > ::marker": {
        "color": "#222 !important"
    },
    ".drk-list-bullet > *": {
        "position": "relative",
        "padding-left": "30px"
    },
    ".drk-list-bullet > ::before": {
        "content": "\"\"",
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "width": "30px",
        "height": "1.5em",
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M8%2012a4%204%200%201%200%208%200a4%204%200%201%200%20-8%200%22%20%2F%3E%3C%2Fsvg%3E\\\")",
        "background-repeat": "no-repeat",
        "background-position": "50% 50%"
    },
    ".drk-list-divider > :nth-child(n+2)": {
        "margin-top": "10px",
        "padding-top": "10px",
        "border-top": "1px solid #e5e5e5"
    },
    ".drk-list-striped > *": {
        "padding": "10px 10px"
    },
    ".drk-list-striped > *:nth-of-type(odd)": {
        "border-top": "1px solid #e5e5e5",
        "border-bottom": "1px solid #e5e5e5"
    },
    ".drk-list-striped > :nth-of-type(odd)": {
        "background": "#f8f8f8"
    },
    ".drk-list-striped > :nth-child(n+2)": {
        "margin-top": "__DRK_RAW__0__"
    },
    ".drk-list-large > :nth-child(n+2), .drk-list-large > * > ul": {
        "margin-top": "20px"
    },
    ".drk-list-collapse > :nth-child(n+2), .drk-list-collapse > * > ul": {
        "margin-top": "__DRK_RAW__0__"
    },
    ".drk-list-large.drk-list-divider > :nth-child(n+2)": {
        "margin-top": "20px",
        "padding-top": "20px"
    },
    ".drk-list-collapse.drk-list-divider > :nth-child(n+2)": {
        "margin-top": "__DRK_RAW__0__",
        "padding-top": "__DRK_RAW__0__"
    },
    ".drk-list-large.drk-list-striped > *": {
        "padding": "20px 10px"
    },
    ".drk-list-collapse.drk-list-striped > *": {
        "padding-top": "__DRK_RAW__0__",
        "padding-bottom": "__DRK_RAW__0__"
    },
    ".drk-list-large.drk-list-striped > :nth-child(n+2), .drk-list-collapse.drk-list-striped > :nth-child(n+2)": {
        "margin-top": "__DRK_RAW__0__"
    }
},
];
