// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · description-list.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-description-list > dt": {
        "color": "#333",
        "font-size": "0.875rem",
        "font-weight": "normal",
        "text-transform": "uppercase"
    },
    ".drk-description-list > dt:nth-child(n+2)": {
        "margin-top": "20px"
    },
    ".drk-description-list-divider > dt:nth-child(n+2)": {
        "margin-top": "20px",
        "padding-top": "20px",
        "border-top": "1px solid #e5e5e5"
    }
},
];
