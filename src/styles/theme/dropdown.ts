// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · dropdown.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-dropdown": {
        "--drk-position-offset": "10px",
        "--drk-position-viewport-offset": "15px",
        "--drk-inverse": "dark",
        "width": "auto",
        "min-width": "200px",
        "padding": "25px",
        "background": "#fff",
        "color": palette.text,
        "box-shadow": "0 5px 12px rgba(0, 0, 0, 0.15)"
    },
    ".drk-dropdown > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-dropdown :focus-visible": {
        "outline-color": `${palette.emphasis} !important`
    },
    ".drk-dropdown-large": {
        "padding": "40px"
    },
    ".drk-dropdown-dropbar": {
        "--drk-position-offset": "10px",
        "width": "auto",
        "background": "transparent",
        "padding": "5px 0 25px 0",
        "--drk-position-viewport-offset": "15px",
        "box-shadow": "none"
    }
},
{
    [`@media (min-width: ${breakpoints.s})`]: {
        ".drk-dropdown-dropbar": {
            "--drk-position-viewport-offset": "30px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-dropdown-dropbar": {
            "--drk-position-viewport-offset": "40px"
        }
    }
},
{
    ".drk-dropdown-dropbar-large": {
        "padding-top": "40px",
        "padding-bottom": "40px"
    },
    ".drk-dropdown-nav": {
        "font-size": "0.875rem"
    },
    ".drk-dropdown-nav > li > a": {
        "color": palette.muted
    },
    ".drk-dropdown-nav > li > a:hover, .drk-dropdown-nav > li.drk-active > a": {
        "color": palette.text
    },
    ".drk-dropdown-nav .drk-nav-subtitle": {
        "font-size": "12px"
    },
    ".drk-dropdown-nav .drk-nav-header": {
        "color": palette.emphasis
    },
    ".drk-dropdown-nav .drk-nav-divider": {
        "border-top": "1px solid #e5e5e5"
    },
    ".drk-dropdown-nav .drk-nav-sub a": {
        "color": palette.muted
    },
    ".drk-dropdown-nav .drk-nav-sub a:hover, .drk-dropdown-nav .drk-nav-sub li.drk-active > a": {
        "color": palette.text
    }
},
];
