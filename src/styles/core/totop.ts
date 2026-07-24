// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · totop.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-totop": {
        "--drk-icon-width": "18px",
        "--drk-icon-height": "10px",
        "padding": "5px",
        "color": palette.mutedText
    },
    ".drk-totop:hover": {
        "color": palette.text
    },
    ".drk-totop:active": {
        "color": palette.emphasis
    }
},
];
