// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · dotnav.less) ; maintenue à la main désormais.
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
        "padding": "7px",
        "margin": "-7px",
        "border-radius": "50%",
        "background": "rgba(102, 102, 102, 0.2)",
        "background-clip": "content-box",
        "text-indent": "100%",
        "overflow": "hidden",
        "white-space": "nowrap"
    },
    ".drk-dotnav > * > :hover": {
        "background-color": "rgba(102, 102, 102, 0.6)"
    },
    ".drk-dotnav > * > :active": {
        "background-color": "rgba(102, 102, 102, 0.2)"
    },
    ".drk-dotnav > .drk-active > *": {
        "background-color": "rgba(102, 102, 102, 0.6)"
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
