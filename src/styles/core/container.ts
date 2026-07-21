// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · container.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-container": {
        "display": "flow-root",
        "box-sizing": "content-box",
        "max-width": "1200px",
        "margin-left": "auto",
        "margin-right": "auto",
        "padding-left": "15px",
        "padding-right": "15px"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-container": {
            "padding-left": "30px",
            "padding-right": "30px"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-container": {
            "padding-left": "40px",
            "padding-right": "40px"
        }
    }
},
{
    ".drk-container > :last-child": {
        "margin-bottom": "__DRK_RAW__0__"
    },
    ".drk-container .drk-container": {
        "padding-left": "__DRK_RAW__0__",
        "padding-right": "__DRK_RAW__0__"
    },
    ".drk-container-xsmall": {
        "max-width": "750px"
    },
    ".drk-container-small": {
        "max-width": "900px"
    },
    ".drk-container-large": {
        "max-width": "1400px"
    },
    ".drk-container-xlarge": {
        "max-width": "1600px"
    },
    ".drk-container-expand": {
        "max-width": "none"
    },
    ".drk-container-expand-left": {
        "margin-left": "__DRK_RAW__0__"
    },
    ".drk-container-expand-right": {
        "margin-right": "__DRK_RAW__0__"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-container-expand-left.drk-container-xsmall, .drk-container-expand-right.drk-container-xsmall": {
            "max-width": "calc(50% + (750px / 2) - 30px)"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-container-expand-left.drk-container-small, .drk-container-expand-right.drk-container-small": {
            "max-width": "calc(50% + (900px / 2) - 30px)"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-container-expand-left, .drk-container-expand-right": {
            "max-width": "calc(50% + (1200px / 2) - 40px)"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-container-expand-left.drk-container-xsmall, .drk-container-expand-right.drk-container-xsmall": {
            "max-width": "calc(50% + (750px / 2) - 40px)"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-container-expand-left.drk-container-small, .drk-container-expand-right.drk-container-small": {
            "max-width": "calc(50% + (900px / 2) - 40px)"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-container-expand-left.drk-container-large, .drk-container-expand-right.drk-container-large": {
            "max-width": "calc(50% + (1400px / 2) - 40px)"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-container-expand-left.drk-container-xlarge, .drk-container-expand-right.drk-container-xlarge": {
            "max-width": "calc(50% + (1600px / 2) - 40px)"
        }
    }
},
{
    ".drk-container-item-padding-remove-left, .drk-container-item-padding-remove-right": {
        "width": "calc(100% + 15px)"
    }
},
{
    ".drk-container-item-padding-remove-left": {
        "margin-left": "-15px"
    },
    ".drk-container-item-padding-remove-right": {
        "margin-right": "-15px"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-container-item-padding-remove-left, .drk-container-item-padding-remove-right": {
            "width": "calc(100% + 30px)"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-container-item-padding-remove-left": {
            "margin-left": "-30px"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-container-item-padding-remove-right": {
            "margin-right": "-30px"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-container-item-padding-remove-left, .drk-container-item-padding-remove-right": {
            "width": "calc(100% + 40px)"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-container-item-padding-remove-left": {
            "margin-left": "-40px"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-container-item-padding-remove-right": {
            "margin-right": "-40px"
        }
    }
},
];
