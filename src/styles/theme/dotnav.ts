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
        "width": "10px",
        "height": "10px",
        "border-radius": "50%",
        "background": "transparent",
        "text-indent": "100%",
        "overflow": "hidden",
        "white-space": "nowrap"
    }
},
{
    ".drk-dotnav > * > *": {
        "border": "1px solid rgba(102, 102, 102, 0.4)",
        "transition": "0.2s ease-in-out"
    }
},
{
    ".drk-dotnav > * > *": {
        "transition-property": "background-color, border-color"
    }
},
{
    ".drk-dotnav > * > :hover": {
        "background-color": "rgba(102, 102, 102, 0.6)",
        "border-color": "transparent"
    },
    ".drk-dotnav > * > :active": {
        "background-color": "rgba(102, 102, 102, 0.2)",
        "border-color": "transparent"
    },
    ".drk-dotnav > .drk-active > *": {
        "background-color": "rgba(102, 102, 102, 0.6)",
        "border-color": "transparent"
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
