// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · dotnav.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-dotnav": {
        "display": "flex",
        "flex-wrap": "wrap",
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    }
},
{
    ".drk-dotnav": {
        "margin-left": "-12px"
    }
},
{
    ".drk-dotnav > *": {
        "flex": "none",
        "padding-left": "12px"
    },
    ".drk-dotnav > * > *": {
        "display": "block",
        "box-sizing": "border-box",
        "width": "24px",
        "height": "24px",
        "margin": "-7px",
        "border-radius": "50%",
        "background": "transparent",
        "background-clip": "padding-box",
        "text-indent": "100%",
        "overflow": "hidden",
        "white-space": "nowrap"
    }
},
{
    ".drk-dotnav > * > *": {
        "border": "7px solid transparent",
        "box-shadow": "inset 0 0 0 1px rgba(102, 102, 102, 0.4)",
        "transition": "0.2s ease-in-out"
    }
},
{
    ".drk-dotnav > * > *": {
        "transition-property": "background-color, box-shadow"
    }
},
{
    ".drk-dotnav > * > :hover": {
        "background-color": "rgba(102, 102, 102, 0.6)",
        "box-shadow": "inset 0 0 0 1px transparent"
    },
    ".drk-dotnav > * > :active": {
        "background-color": "rgba(102, 102, 102, 0.2)",
        "box-shadow": "inset 0 0 0 1px transparent"
    },
    ".drk-dotnav > .drk-active > *": {
        "background-color": "rgba(102, 102, 102, 0.6)",
        "box-shadow": "inset 0 0 0 1px transparent"
    },
    ".drk-dotnav-vertical": {
        "flex-direction": "column",
        "margin-left": "__DRK_RAW__0__",
        "margin-top": "-12px"
    },
    ".drk-dotnav-vertical > *": {
        "padding-left": "__DRK_RAW__0__",
        "padding-top": "12px"
    }
},
];
