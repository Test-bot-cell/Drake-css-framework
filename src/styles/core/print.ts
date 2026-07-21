// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · print.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    "@media print": {
        "*, *::before, *::after": {
            "background": "transparent !important",
            "color": "black !important",
            "box-shadow": "none !important",
            "text-shadow": "none !important"
        }
    }
},
{
    "@media print": {
        "a, a:visited": {
            "text-decoration": "underline"
        }
    }
},
{
    "@media print": {
        "pre, blockquote": {
            "border": "1px solid #999",
            "page-break-inside": "avoid"
        }
    }
},
{
    "@media print": {
        "thead": {
            "display": "table-header-group"
        }
    }
},
{
    "@media print": {
        "tr, img": {
            "page-break-inside": "avoid"
        }
    }
},
{
    "@media print": {
        "img": {
            "max-width": "100% !important"
        }
    }
},
{
    "@media print": {
        "@page": {
            "margin": "0.5cm"
        }
    }
},
{
    "@media print": {
        "p, h2, h3": {
            "orphans": 3,
            "widows": 3
        }
    }
},
{
    "@media print": {
        "h2, h3": {
            "page-break-after": "avoid"
        }
    }
},
];
