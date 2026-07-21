// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · flex.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-flex": {
        "display": "flex"
    },
    ".drk-flex-inline": {
        "display": "inline-flex"
    },
    ".drk-flex-left": {
        "justify-content": "flex-start"
    },
    ".drk-flex-center": {
        "justify-content": "center"
    },
    ".drk-flex-right": {
        "justify-content": "flex-end"
    },
    ".drk-flex-between": {
        "justify-content": "space-between"
    },
    ".drk-flex-around": {
        "justify-content": "space-around"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-left\\40 s": {
            "justify-content": "flex-start"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-center\\40 s": {
            "justify-content": "center"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-right\\40 s": {
            "justify-content": "flex-end"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-between\\40 s": {
            "justify-content": "space-between"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-around\\40 s": {
            "justify-content": "space-around"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-left\\40 m": {
            "justify-content": "flex-start"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-center\\40 m": {
            "justify-content": "center"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-right\\40 m": {
            "justify-content": "flex-end"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-between\\40 m": {
            "justify-content": "space-between"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-around\\40 m": {
            "justify-content": "space-around"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-left\\40 l": {
            "justify-content": "flex-start"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-center\\40 l": {
            "justify-content": "center"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-right\\40 l": {
            "justify-content": "flex-end"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-between\\40 l": {
            "justify-content": "space-between"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-around\\40 l": {
            "justify-content": "space-around"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-left\\40 xl": {
            "justify-content": "flex-start"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-center\\40 xl": {
            "justify-content": "center"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-right\\40 xl": {
            "justify-content": "flex-end"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-between\\40 xl": {
            "justify-content": "space-between"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-around\\40 xl": {
            "justify-content": "space-around"
        }
    }
},
{
    ".drk-flex-stretch": {
        "align-items": "stretch"
    },
    ".drk-flex-top": {
        "align-items": "flex-start"
    },
    ".drk-flex-middle": {
        "align-items": "center"
    },
    ".drk-flex-bottom": {
        "align-items": "flex-end"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-stretch\\40 s": {
            "align-items": "stretch"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-top\\40 s": {
            "align-items": "flex-start"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-middle\\40 s": {
            "align-items": "center"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-bottom\\40 s": {
            "align-items": "flex-end"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-stretch\\40 m": {
            "align-items": "stretch"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-top\\40 m": {
            "align-items": "flex-start"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-middle\\40 m": {
            "align-items": "center"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-bottom\\40 m": {
            "align-items": "flex-end"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-stretch\\40 l": {
            "align-items": "stretch"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-top\\40 l": {
            "align-items": "flex-start"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-middle\\40 l": {
            "align-items": "center"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-bottom\\40 l": {
            "align-items": "flex-end"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-stretch\\40 xl": {
            "align-items": "stretch"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-top\\40 xl": {
            "align-items": "flex-start"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-middle\\40 xl": {
            "align-items": "center"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-bottom\\40 xl": {
            "align-items": "flex-end"
        }
    }
},
{
    ".drk-flex-row": {
        "flex-direction": "row"
    },
    ".drk-flex-row-reverse": {
        "flex-direction": "row-reverse"
    },
    ".drk-flex-column": {
        "flex-direction": "column"
    },
    ".drk-flex-column-reverse": {
        "flex-direction": "column-reverse"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-row\\40 s": {
            "flex-direction": "row"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-column\\40 s": {
            "flex-direction": "column"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-row\\40 m": {
            "flex-direction": "row"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-column\\40 m": {
            "flex-direction": "column"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-row\\40 l": {
            "flex-direction": "row"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-column\\40 l": {
            "flex-direction": "column"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-row\\40 xl": {
            "flex-direction": "row"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-column\\40 xl": {
            "flex-direction": "column"
        }
    }
},
{
    ".drk-flex-nowrap": {
        "flex-wrap": "nowrap"
    },
    ".drk-flex-wrap": {
        "flex-wrap": "wrap"
    },
    ".drk-flex-wrap-reverse": {
        "flex-wrap": "wrap-reverse"
    },
    ".drk-flex-wrap-stretch": {
        "align-content": "stretch"
    },
    ".drk-flex-wrap-top": {
        "align-content": "flex-start"
    },
    ".drk-flex-wrap-middle": {
        "align-content": "center"
    },
    ".drk-flex-wrap-bottom": {
        "align-content": "flex-end"
    },
    ".drk-flex-wrap-between": {
        "align-content": "space-between"
    },
    ".drk-flex-wrap-around": {
        "align-content": "space-around"
    },
    ".drk-flex-first": {
        "order": -1
    },
    ".drk-flex-last": {
        "order": 99
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-first\\40 s": {
            "order": -1
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-last\\40 s": {
            "order": 99
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-first\\40 m": {
            "order": -1
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-last\\40 m": {
            "order": 99
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-first\\40 l": {
            "order": -1
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-last\\40 l": {
            "order": 99
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-first\\40 xl": {
            "order": -1
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-last\\40 xl": {
            "order": 99
        }
    }
},
{
    ".drk-flex-initial": {
        "flex": "initial"
    },
    ".drk-flex-none": {
        "flex": "none"
    },
    ".drk-flex-auto": {
        "flex": "auto"
    },
    ".drk-flex-1": {
        "flex": 1
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-initial\\40 s": {
            "flex": "initial"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-none\\40 s": {
            "flex": "none"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-flex-1\\40 s": {
            "flex": 1
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-initial\\40 m": {
            "flex": "initial"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-none\\40 m": {
            "flex": "none"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-flex-1\\40 m": {
            "flex": 1
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-initial\\40 l": {
            "flex": "initial"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-none\\40 l": {
            "flex": "none"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-flex-1\\40 l": {
            "flex": 1
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-initial\\40 xl": {
            "flex": "initial"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-none\\40 xl": {
            "flex": "none"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-flex-1\\40 xl": {
            "flex": 1
        }
    }
},
];
