// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · placeholder.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-placeholder": {
        "margin-bottom": "20px",
        "padding": "30px 30px",
        "background": palette.mutedBackground
    },
    "* + .drk-placeholder": {
        "margin-top": "20px"
    },
    ".drk-placeholder > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    }
},
];
