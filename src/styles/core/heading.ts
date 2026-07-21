// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · heading.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-heading-small": {
        "font-size": "2.6rem",
        "line-height": 1.2
    },
    ".drk-heading-medium": {
        "font-size": "2.8875rem",
        "line-height": 1.1
    },
    ".drk-heading-large": {
        "font-size": "3.4rem",
        "line-height": 1.1
    },
    ".drk-heading-xlarge": {
        "font-size": "4rem",
        "line-height": 1
    },
    ".drk-heading-2xlarge": {
        "font-size": "6rem",
        "line-height": 1
    },
    ".drk-heading-3xlarge": {
        "font-size": "8rem",
        "line-height": 1
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-heading-small": {
            "font-size": "3.25rem"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-heading-medium": {
            "font-size": "3.5rem"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-heading-large": {
            "font-size": "4rem"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-heading-xlarge": {
            "font-size": "6rem"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-heading-2xlarge": {
            "font-size": "8rem"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-heading-3xlarge": {
            "font-size": "11rem"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-heading-medium": {
            "font-size": "4rem"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-heading-large": {
            "font-size": "6rem"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-heading-xlarge": {
            "font-size": "8rem"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-heading-2xlarge": {
            "font-size": "11rem"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-heading-3xlarge": {
            "font-size": "15rem"
        }
    }
},
{
    ".drk-heading-divider": {
        "padding-bottom": "calc(5px + 0.1em)",
        "border-bottom": "calc(0.2px + 0.05em) solid #e5e5e5"
    },
    ".drk-heading-bullet": {
        "position": "relative"
    },
    ".drk-heading-bullet::before": {
        "content": "\"\"",
        "display": "inline-block",
        "position": "relative",
        "top": "calc(-0.1 * 1em)",
        "vertical-align": "middle",
        "height": "calc(4px + 0.7em)",
        "margin-right": "calc(5px + 0.2em)",
        "border-left": "calc(5px + 0.1em) solid #e5e5e5"
    },
    ".drk-heading-line": {
        "overflow": "hidden"
    },
    ".drk-heading-line > *": {
        "display": "inline-block",
        "position": "relative"
    },
    ".drk-heading-line > ::before, .drk-heading-line > ::after": {
        "content": "\"\"",
        "position": "absolute",
        "top": "calc(50% - (calc(0.2px + 0.05em) / 2))",
        "width": "2000px",
        "border-bottom": "calc(0.2px + 0.05em) solid #e5e5e5"
    }
},
{
    ".drk-heading-line > ::before": {
        "right": "100%",
        "margin-right": "calc(5px + 0.3em)"
    },
    ".drk-heading-line > ::after": {
        "left": "100%",
        "margin-left": "calc(5px + 0.3em)"
    }
},
];
