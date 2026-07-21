// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · spinner.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-spinner": {
        "--drk-icon-width": "30px",
        "--drk-icon-height": "30px",
        "animation": "drk-spinner-rotate 1.4s linear infinite"
    }
},
{
    "@keyframes drk-spinner-rotate": {
        "0%": {
            "transform": "rotate(0deg)"
        },
        "100%": {
            "transform": "rotate(360deg)"
        }
    }
},
{
    "@media (prefers-reduced-motion: reduce)": {
        ".drk-spinner": {
            "animation": "none"
        }
    }
},
];
