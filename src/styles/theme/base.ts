// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · base.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, fontFamilies, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    "html": {
        "font-family": fontFamilies.body,
        "font-size": "16px",
        "font-weight": "normal",
        "font-optical-sizing": "auto",
        "line-height": 1.5,
        "-webkit-text-size-adjust": "100%",
        "background": "#fff",
        "color": palette.text
    },
    "body": {
        "margin": "__DRK_RAW__0__"
    },
    "a, .drk-link": {
        "color": palette.primary,
        "text-decoration": "none",
        "cursor": "pointer"
    },
    "a:hover, .drk-link:hover, .drk-link-toggle:hover .drk-link": {
        "color": "#0f6ecd",
        "text-decoration": "underline"
    },
    "a:has(.drk-text-middle), .drk-link:has(.drk-text-middle), .drk-link-toggle:hover .drk-link:has(.drk-text-middle)": {
        "text-underline-offset": "0.1875em"
    },
    "abbr[title]": {
        "text-decoration": "underline dotted",
        "-webkit-text-decoration-style": "dotted"
    },
    "b, strong": {
        "font-weight": "bolder"
    },
    ":not(pre) > code, :not(pre) > kbd, :not(pre) > samp": {
        "font-family": "Consolas, monaco, monospace",
        "font-size": "0.875rem",
        "color": palette.danger,
        "white-space": "nowrap",
        "padding": "2px 6px",
        "background": palette.mutedBackground
    },
    "em": {
        "color": palette.danger
    },
    "ins": {
        "background": "#ffd",
        "color": palette.text,
        "text-decoration": "none"
    },
    "mark": {
        "background": "#ffd",
        "color": palette.text
    },
    "q": {
        "font-style": "italic"
    },
    "small": {
        "font-size": "80%"
    },
    "sub, sup": {
        "font-size": "75%",
        "line-height": 0,
        "position": "relative",
        "vertical-align": "baseline"
    }
},
{
    "sup": {
        "top": "-0.5em"
    },
    "sub": {
        "bottom": "-0.25em"
    },
    "audio, canvas, iframe, img, svg, video": {
        "vertical-align": "middle"
    }
},
{
    "canvas, img, svg, video": {
        "max-width": "100%",
        "box-sizing": "border-box",
        "height": "auto",
        "aspect-ratio": "attr(width type(<number>)) / attr(height type(<number>))",
        "object-fit": "cover"
    },
    "img:not([src])": {
        "visibility": "hidden",
        "min-width": "1px"
    },
    "iframe": {
        "border": "__DRK_RAW__0__"
    },
    "p, ul, ol, dl, pre, address, fieldset, figure": {
        "margin": "0 0 20px 0"
    },
    "* + p, * + ul, * + ol, * + dl, * + pre, * + address, * + fieldset, * + figure": {
        "margin-top": "20px"
    },
    "h1, .drk-h1, h2, .drk-h2, h3, .drk-h3, h4, .drk-h4, h5, .drk-h5, h6, .drk-h6, .drk-heading-small, .drk-heading-medium, .drk-heading-large, .drk-heading-xlarge, .drk-heading-2xlarge, .drk-heading-3xlarge": {
        "margin": "0 0 20px 0",
        "font-family": fontFamilies.body,
        "font-weight": "normal",
        "color": palette.emphasis,
        "text-transform": "none"
    },
    "* + h1, * + .drk-h1, * + h2, * + .drk-h2, * + h3, * + .drk-h3, * + h4, * + .drk-h4, * + h5, * + .drk-h5, * + h6, * + .drk-h6, * + .drk-heading-small, * + .drk-heading-medium, * + .drk-heading-large, * + .drk-heading-xlarge, * + .drk-heading-2xlarge, * + .drk-heading-3xlarge": {
        "margin-top": "40px"
    }
},
{
    "h1, .drk-h1": {
        "font-size": "2.23125rem",
        "line-height": 1.2
    },
    "h2, .drk-h2": {
        "font-size": "1.7rem",
        "line-height": 1.3
    },
    "h3, .drk-h3": {
        "font-size": "1.5rem",
        "line-height": 1.4
    },
    "h4, .drk-h4": {
        "font-size": "1.25rem",
        "line-height": 1.4
    },
    "h5, .drk-h5": {
        "font-size": "16px",
        "line-height": 1.4
    },
    "h6, .drk-h6": {
        "font-size": "0.875rem",
        "line-height": 1.4
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        "h1, .drk-h1": {
            "font-size": "2.625rem"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        "h2, .drk-h2": {
            "font-size": "2rem"
        }
    }
},
{
    "ul, ol": {
        "padding-left": "30px"
    },
    "ul > li > ul, ul > li > ol, ol > li > ol, ol > li > ul": {
        "margin": "__DRK_RAW__0__"
    },
    "dt": {
        "font-weight": "bold"
    },
    "dd": {
        "margin-left": "__DRK_RAW__0__"
    },
    "hr, .drk-hr": {
        "overflow": "visible",
        "text-align": "inherit",
        "margin": "0 0 20px 0",
        "border": "__DRK_RAW__0__"
    }
},
{
    "hr, .drk-hr": {
        "border-top": "1px solid #e5e5e5"
    }
},
{
    "* + hr, * + .drk-hr": {
        "margin-top": "20px"
    },
    "address": {
        "font-style": "normal"
    },
    "blockquote": {
        "margin": "0 0 20px 0",
        "font-size": "1.25rem",
        "line-height": 1.5,
        "font-style": "italic",
        "color": palette.emphasis
    },
    "* + blockquote": {
        "margin-top": "20px"
    },
    "blockquote p:last-of-type": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    "blockquote footer": {
        "margin-top": "10px",
        "font-size": "0.875rem",
        "line-height": 1.5,
        "color": palette.text
    },
    "blockquote footer::before": {
        "content": "\"— \""
    },
    "pre": {
        "font": "0.875rem / 1.5 Consolas, monaco, monospace",
        "color": palette.text,
        "-moz-tab-size": "__DRK_RAW__4__",
        "tab-size": 4,
        "overflow": "auto",
        "padding": "10px",
        "border": "1px solid #e5e5e5"
    }
},
{
    "pre": {
        "border-radius": "3px",
        "background": "#fff"
    }
},
{
    "pre code": {
        "font-family": "Consolas, monaco, monospace"
    },
    ":focus": {
        "outline": "none"
    },
    ":focus-visible": {
        "outline": `2px dotted ${palette.emphasis}`
    },
    "::selection": {
        "background": "#39f",
        "color": "#fff",
        "text-shadow": "none"
    },
    "details, main": {
        "display": "block"
    },
    "summary": {
        "display": "list-item"
    },
    "template": {
        "display": "none"
    },
    ":root": {
        "--drk-breakpoint-s": "640px",
        "--drk-breakpoint-m": "960px",
        "--drk-breakpoint-l": "1200px",
        "--drk-breakpoint-xl": "1600px"
    }
},
];
