// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · accordion.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-accordion": {
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-accordion-title": {
        "display": "block"
    },
    ".drk-accordion-content": {
        "display": "flow-root"
    },
    ".drk-accordion-content > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-accordion-default > :nth-child(n+2)": {
        "margin-top": "20px"
    },
    ".drk-accordion-default .drk-accordion-title": {
        "display": "flex",
        "align-items": "center",
        "column-gap": "15px",
        "font-size": "1.25rem",
        "line-height": 1.4,
        "color": palette.emphasis
    },
    ".drk-accordion-default .drk-accordion-title:hover": {
        "color": palette.text,
        "text-decoration": "none"
    },
    ".drk-accordion-default .drk-accordion-icon": {
        "--drk-icon-width": "13px",
        "--drk-icon-height": "13px",
        "flex": "none",
        "margin-left": "auto"
    },
    "[aria-expanded=\"true\"] .drk-accordion-icon": {
        "--drk-ti-mask": "var(--drk-tabler-icon-minus)"
    },
    ".drk-accordion-default .drk-accordion-content": {
        "margin-top": "20px"
    }
},
];
