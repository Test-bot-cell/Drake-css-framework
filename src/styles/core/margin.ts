// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · margin.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-margin": {
        "margin-bottom": "20px"
    },
    "* + .drk-margin": {
        "margin-top": "20px !important"
    },
    ".drk-margin-top": {
        "margin-top": "20px !important"
    },
    ".drk-margin-bottom": {
        "margin-bottom": "20px !important"
    },
    ".drk-margin-left": {
        "margin-left": "20px !important"
    },
    ".drk-margin-right": {
        "margin-right": "20px !important"
    },
    ".drk-margin-xsmall": {
        "margin-bottom": "5px"
    },
    "* + .drk-margin-xsmall": {
        "margin-top": "5px !important"
    },
    ".drk-margin-xsmall-top": {
        "margin-top": "5px !important"
    },
    ".drk-margin-xsmall-bottom": {
        "margin-bottom": "5px !important"
    },
    ".drk-margin-xsmall-left": {
        "margin-left": "5px !important"
    },
    ".drk-margin-xsmall-right": {
        "margin-right": "5px !important"
    },
    ".drk-margin-small": {
        "margin-bottom": "10px"
    },
    "* + .drk-margin-small": {
        "margin-top": "10px !important"
    },
    ".drk-margin-small-top": {
        "margin-top": "10px !important"
    },
    ".drk-margin-small-bottom": {
        "margin-bottom": "10px !important"
    },
    ".drk-margin-small-left": {
        "margin-left": "10px !important"
    },
    ".drk-margin-small-right": {
        "margin-right": "10px !important"
    },
    ".drk-margin-medium": {
        "margin-bottom": "40px"
    },
    "* + .drk-margin-medium": {
        "margin-top": "40px !important"
    },
    ".drk-margin-medium-top": {
        "margin-top": "40px !important"
    },
    ".drk-margin-medium-bottom": {
        "margin-bottom": "40px !important"
    },
    ".drk-margin-medium-left": {
        "margin-left": "40px !important"
    },
    ".drk-margin-medium-right": {
        "margin-right": "40px !important"
    },
    ".drk-margin-large": {
        "margin-bottom": "40px"
    },
    "* + .drk-margin-large": {
        "margin-top": "40px !important"
    },
    ".drk-margin-large-top": {
        "margin-top": "40px !important"
    },
    ".drk-margin-large-bottom": {
        "margin-bottom": "40px !important"
    },
    ".drk-margin-large-left": {
        "margin-left": "40px !important"
    },
    ".drk-margin-large-right": {
        "margin-right": "40px !important"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-large": {
            "margin-bottom": "70px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        "* + .drk-margin-large": {
            "margin-top": "70px !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-large-top": {
            "margin-top": "70px !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-large-bottom": {
            "margin-bottom": "70px !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-large-left": {
            "margin-left": "70px !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-large-right": {
            "margin-right": "70px !important"
        }
    }
},
{
    ".drk-margin-xlarge": {
        "margin-bottom": "70px"
    },
    "* + .drk-margin-xlarge": {
        "margin-top": "70px !important"
    },
    ".drk-margin-xlarge-top": {
        "margin-top": "70px !important"
    },
    ".drk-margin-xlarge-bottom": {
        "margin-bottom": "70px !important"
    },
    ".drk-margin-xlarge-left": {
        "margin-left": "70px !important"
    },
    ".drk-margin-xlarge-right": {
        "margin-right": "70px !important"
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-xlarge": {
            "margin-bottom": "140px"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        "* + .drk-margin-xlarge": {
            "margin-top": "140px !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-xlarge-top": {
            "margin-top": "140px !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-xlarge-bottom": {
            "margin-bottom": "140px !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-xlarge-left": {
            "margin-left": "140px !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-xlarge-right": {
            "margin-right": "140px !important"
        }
    }
},
{
    ".drk-margin-auto": {
        "margin-left": "auto !important",
        "margin-right": "auto !important"
    },
    ".drk-margin-auto-top": {
        "margin-top": "auto !important"
    },
    ".drk-margin-auto-bottom": {
        "margin-bottom": "auto !important"
    },
    ".drk-margin-auto-left": {
        "margin-left": "auto !important"
    },
    ".drk-margin-auto-right": {
        "margin-right": "auto !important"
    },
    ".drk-margin-auto-vertical": {
        "margin-top": "auto !important",
        "margin-bottom": "auto !important"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-margin-auto\\40 s": {
            "margin-left": "auto !important",
            "margin-right": "auto !important"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-margin-auto-left\\40 s": {
            "margin-left": "auto !important"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-margin-auto-right\\40 s": {
            "margin-right": "auto !important"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-margin-auto\\40 m": {
            "margin-left": "auto !important",
            "margin-right": "auto !important"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-margin-auto-left\\40 m": {
            "margin-left": "auto !important"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-margin-auto-right\\40 m": {
            "margin-right": "auto !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-auto\\40 l": {
            "margin-left": "auto !important",
            "margin-right": "auto !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-auto-left\\40 l": {
            "margin-left": "auto !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-auto-right\\40 l": {
            "margin-right": "auto !important"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-margin-auto\\40 xl": {
            "margin-left": "auto !important",
            "margin-right": "auto !important"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-margin-auto-left\\40 xl": {
            "margin-left": "auto !important"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-margin-auto-right\\40 xl": {
            "margin-right": "auto !important"
        }
    }
},
{
    ".drk-margin-remove": {
        "margin": "0 !important"
    },
    ".drk-margin-remove-top": {
        "margin-top": "0 !important"
    },
    ".drk-margin-remove-bottom": {
        "margin-bottom": "0 !important"
    },
    ".drk-margin-remove-left": {
        "margin-left": "0 !important"
    },
    ".drk-margin-remove-right": {
        "margin-right": "0 !important"
    },
    ".drk-margin-remove-vertical": {
        "margin-top": "0 !important",
        "margin-bottom": "0 !important"
    },
    ".drk-margin-remove-adjacent + *, .drk-margin-remove-first-child > :first-child": {
        "margin-top": "0 !important"
    },
    ".drk-margin-remove-last-child > :last-child": {
        "margin-bottom": "0 !important"
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-margin-remove-left\\40 s": {
            "margin-left": "0 !important"
        }
    }
},
{
    "@media (min-width: 640px)": {
        ".drk-margin-remove-right\\40 s": {
            "margin-right": "0 !important"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-margin-remove-left\\40 m": {
            "margin-left": "0 !important"
        }
    }
},
{
    "@media (min-width: 960px)": {
        ".drk-margin-remove-right\\40 m": {
            "margin-right": "0 !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-remove-left\\40 l": {
            "margin-left": "0 !important"
        }
    }
},
{
    "@media (min-width: 1200px)": {
        ".drk-margin-remove-right\\40 l": {
            "margin-right": "0 !important"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-margin-remove-left\\40 xl": {
            "margin-left": "0 !important"
        }
    }
},
{
    "@media (min-width: 1600px)": {
        ".drk-margin-remove-right\\40 xl": {
            "margin-right": "0 !important"
        }
    }
},
];
