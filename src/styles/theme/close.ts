// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · close.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-close": {
        "--drk-icon-width": "14px",
        "--drk-icon-height": "14px",
        "color": palette.muted,
        "transition": "0.1s ease-in-out"
    }
},
{
    ".drk-close": {
        "transition-property": "color, opacity"
    }
},
{
    ".drk-close-large": {
        "--drk-icon-width": "20px",
        "--drk-icon-height": "20px"
    },
    ".drk-close:hover": {
        "color": palette.text
    }
},
];
