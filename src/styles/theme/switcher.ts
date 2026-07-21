// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · switcher.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-switcher": {
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-switcher > :not(.drk-active)": {
        "display": "none"
    },
    ".drk-switcher > * > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    }
},
];
