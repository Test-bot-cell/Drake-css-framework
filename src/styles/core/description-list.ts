// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · description-list.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-description-list > dt": {
        "color": palette.emphasis
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
