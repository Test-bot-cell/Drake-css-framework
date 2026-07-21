// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · leader.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-leader": {
        "overflow": "hidden"
    },
    ".drk-leader-fill::after": {
        "display": "inline-block",
        "margin-left": "15px",
        "width": "__DRK_RAW__0__",
        "content": "attr(data-fill)",
        "white-space": "nowrap"
    },
    ".drk-leader-fill.drk-leader-hide::after": {
        "display": "none"
    },
    ":root": {
        "--drk-leader-fill-content": "."
    }
},
];
