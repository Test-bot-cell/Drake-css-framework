// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · grid.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-grid": {
        "display": "flex",
        "flex-wrap": "wrap",
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "list-style": "none"
    },
    ".drk-grid > *": {
        "margin": "__DRK_RAW__0__"
    },
    ".drk-grid > * > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    }
},
{
    ".drk-grid": {
        "margin-left": "-30px"
    },
    ".drk-grid > *": {
        "padding-left": "30px"
    },
    ".drk-grid + .drk-grid, .drk-grid > .drk-grid-margin, * + .drk-grid-margin": {
        "margin-top": "30px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid": {
            "margin-left": "-40px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid > *": {
            "padding-left": "40px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid + .drk-grid, .drk-grid > .drk-grid-margin, * + .drk-grid-margin": {
            "margin-top": "40px"
        }
    }
},
{
    ".drk-grid-small, .drk-grid-column-small": {
        "margin-left": "-15px"
    },
    ".drk-grid-small > *, .drk-grid-column-small > *": {
        "padding-left": "15px"
    },
    ".drk-grid + .drk-grid-small, .drk-grid + .drk-grid-row-small, .drk-grid-small > .drk-grid-margin, .drk-grid-row-small > .drk-grid-margin, * + .drk-grid-margin-small": {
        "margin-top": "15px"
    },
    ".drk-grid-medium, .drk-grid-column-medium": {
        "margin-left": "-30px"
    },
    ".drk-grid-medium > *, .drk-grid-column-medium > *": {
        "padding-left": "30px"
    },
    ".drk-grid + .drk-grid-medium, .drk-grid + .drk-grid-row-medium, .drk-grid-medium > .drk-grid-margin, .drk-grid-row-medium > .drk-grid-margin, * + .drk-grid-margin-medium": {
        "margin-top": "30px"
    },
    ".drk-grid-large, .drk-grid-column-large": {
        "margin-left": "-40px"
    },
    ".drk-grid-large > *, .drk-grid-column-large > *": {
        "padding-left": "40px"
    },
    ".drk-grid + .drk-grid-large, .drk-grid + .drk-grid-row-large, .drk-grid-large > .drk-grid-margin, .drk-grid-row-large > .drk-grid-margin, * + .drk-grid-margin-large": {
        "margin-top": "40px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-large, .drk-grid-column-large": {
            "margin-left": "-70px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-large > *, .drk-grid-column-large > *": {
            "padding-left": "70px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid + .drk-grid-large, .drk-grid + .drk-grid-row-large, .drk-grid-large > .drk-grid-margin, .drk-grid-row-large > .drk-grid-margin, * + .drk-grid-margin-large": {
            "margin-top": "70px"
        }
    }
},
{
    ".drk-grid-collapse, .drk-grid-column-collapse": {
        "margin-left": "__DRK_RAW__0__"
    },
    ".drk-grid-collapse > *, .drk-grid-column-collapse > *": {
        "padding-left": "__DRK_RAW__0__"
    },
    ".drk-grid + .drk-grid-collapse, .drk-grid + .drk-grid-row-collapse, .drk-grid-collapse > .drk-grid-margin, .drk-grid-row-collapse > .drk-grid-margin": {
        "margin-top": "__DRK_RAW__0__"
    },
    ".drk-grid-divider > *": {
        "position": "relative"
    },
    ".drk-grid-divider > :not(.drk-first-column)::before": {
        "content": "\"\"",
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "border-left": "1px solid #e5e5e5"
    },
    ".drk-grid-divider.drk-grid-stack > .drk-grid-margin::before": {
        "content": "\"\"",
        "position": "absolute",
        "left": "__DRK_RAW__0__",
        "right": "__DRK_RAW__0__",
        "border-top": "1px solid #e5e5e5"
    },
    ".drk-grid-divider": {
        "margin-left": "-60px"
    }
},
{
    ".drk-grid-divider > *": {
        "padding-left": "60px"
    },
    ".drk-grid-divider > :not(.drk-first-column)::before": {
        "left": "30px"
    },
    ".drk-grid-divider.drk-grid-stack > .drk-grid-margin": {
        "margin-top": "60px"
    },
    ".drk-grid-divider.drk-grid-stack > .drk-grid-margin::before": {
        "top": "-30px",
        "left": "60px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider": {
            "margin-left": "-80px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider > *": {
            "padding-left": "80px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider > :not(.drk-first-column)::before": {
            "left": "40px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider.drk-grid-stack > .drk-grid-margin": {
            "margin-top": "80px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider.drk-grid-stack > .drk-grid-margin::before": {
            "top": "-40px",
            "left": "80px"
        }
    }
},
{
    ".drk-grid-divider.drk-grid-small, .drk-grid-divider.drk-grid-column-small": {
        "margin-left": "-30px"
    },
    ".drk-grid-divider.drk-grid-small > *, .drk-grid-divider.drk-grid-column-small > *": {
        "padding-left": "30px"
    },
    ".drk-grid-divider.drk-grid-small > :not(.drk-first-column)::before, .drk-grid-divider.drk-grid-column-small > :not(.drk-first-column)::before": {
        "left": "15px"
    },
    ".drk-grid-divider.drk-grid-small.drk-grid-stack > .drk-grid-margin, .drk-grid-divider.drk-grid-row-small.drk-grid-stack > .drk-grid-margin": {
        "margin-top": "30px"
    },
    ".drk-grid-divider.drk-grid-small.drk-grid-stack > .drk-grid-margin::before": {
        "top": "-15px",
        "left": "30px"
    },
    ".drk-grid-divider.drk-grid-row-small.drk-grid-stack > .drk-grid-margin::before": {
        "top": "-15px"
    },
    ".drk-grid-divider.drk-grid-column-small.drk-grid-stack > .drk-grid-margin::before": {
        "left": "30px"
    },
    ".drk-grid-divider.drk-grid-medium, .drk-grid-divider.drk-grid-column-medium": {
        "margin-left": "-60px"
    },
    ".drk-grid-divider.drk-grid-medium > *, .drk-grid-divider.drk-grid-column-medium > *": {
        "padding-left": "60px"
    },
    ".drk-grid-divider.drk-grid-medium > :not(.drk-first-column)::before, .drk-grid-divider.drk-grid-column-medium > :not(.drk-first-column)::before": {
        "left": "30px"
    },
    ".drk-grid-divider.drk-grid-medium.drk-grid-stack > .drk-grid-margin, .drk-grid-divider.drk-grid-row-medium.drk-grid-stack > .drk-grid-margin": {
        "margin-top": "60px"
    },
    ".drk-grid-divider.drk-grid-medium.drk-grid-stack > .drk-grid-margin::before": {
        "top": "-30px",
        "left": "60px"
    },
    ".drk-grid-divider.drk-grid-row-medium.drk-grid-stack > .drk-grid-margin::before": {
        "top": "-30px"
    },
    ".drk-grid-divider.drk-grid-column-medium.drk-grid-stack > .drk-grid-margin::before": {
        "left": "60px"
    },
    ".drk-grid-divider.drk-grid-large, .drk-grid-divider.drk-grid-column-large": {
        "margin-left": "-80px"
    },
    ".drk-grid-divider.drk-grid-large > *, .drk-grid-divider.drk-grid-column-large > *": {
        "padding-left": "80px"
    },
    ".drk-grid-divider.drk-grid-large > :not(.drk-first-column)::before, .drk-grid-divider.drk-grid-column-large > :not(.drk-first-column)::before": {
        "left": "40px"
    },
    ".drk-grid-divider.drk-grid-large.drk-grid-stack > .drk-grid-margin, .drk-grid-divider.drk-grid-row-large.drk-grid-stack > .drk-grid-margin": {
        "margin-top": "80px"
    },
    ".drk-grid-divider.drk-grid-large.drk-grid-stack > .drk-grid-margin::before": {
        "top": "-40px",
        "left": "80px"
    },
    ".drk-grid-divider.drk-grid-row-large.drk-grid-stack > .drk-grid-margin::before": {
        "top": "-40px"
    },
    ".drk-grid-divider.drk-grid-column-large.drk-grid-stack > .drk-grid-margin::before": {
        "left": "80px"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider.drk-grid-large, .drk-grid-divider.drk-grid-column-large": {
            "margin-left": "-140px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider.drk-grid-large > *, .drk-grid-divider.drk-grid-column-large > *": {
            "padding-left": "140px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider.drk-grid-large > :not(.drk-first-column)::before, .drk-grid-divider.drk-grid-column-large > :not(.drk-first-column)::before": {
            "left": "70px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider.drk-grid-large.drk-grid-stack > .drk-grid-margin, .drk-grid-divider.drk-grid-row-large.drk-grid-stack > .drk-grid-margin": {
            "margin-top": "140px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider.drk-grid-large.drk-grid-stack > .drk-grid-margin::before": {
            "top": "-70px",
            "left": "140px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider.drk-grid-row-large.drk-grid-stack > .drk-grid-margin::before": {
            "top": "-70px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-grid-divider.drk-grid-column-large.drk-grid-stack > .drk-grid-margin::before": {
            "left": "140px"
        }
    }
},
{
    ".drk-grid-match > *, .drk-grid-item-match": {
        "display": "flex",
        "flex-wrap": "wrap"
    },
    ".drk-grid-match > * > :not([class*=\"drk-width\"]), .drk-grid-item-match > :not([class*=\"drk-width\"])": {
        "box-sizing": "border-box",
        "width": "100%",
        "flex": "auto"
    }
},
];
