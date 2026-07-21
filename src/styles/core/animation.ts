// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (core · animation.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    "[class*=\"drk-animation-\"]": {
        "animation": "0.5s ease-out both"
    },
    ".drk-animation-fade": {
        "animation-name": "drk-fade",
        "animation-duration": "0.8s",
        "animation-timing-function": "linear"
    },
    ".drk-animation-scale-up": {
        "animation-name": "drk-fade, drk-scale-up"
    },
    ".drk-animation-scale-down": {
        "animation-name": "drk-fade, drk-scale-down"
    },
    ".drk-animation-slide-top": {
        "animation-name": "drk-fade, drk-slide-top"
    },
    ".drk-animation-slide-bottom": {
        "animation-name": "drk-fade, drk-slide-bottom"
    },
    ".drk-animation-slide-left": {
        "animation-name": "drk-fade, drk-slide-left"
    },
    ".drk-animation-slide-right": {
        "animation-name": "drk-fade, drk-slide-right"
    },
    ".drk-animation-slide-top-small": {
        "animation-name": "drk-fade, drk-slide-top-small"
    },
    ".drk-animation-slide-bottom-small": {
        "animation-name": "drk-fade, drk-slide-bottom-small"
    },
    ".drk-animation-slide-left-small": {
        "animation-name": "drk-fade, drk-slide-left-small"
    },
    ".drk-animation-slide-right-small": {
        "animation-name": "drk-fade, drk-slide-right-small"
    },
    ".drk-animation-slide-top-medium": {
        "animation-name": "drk-fade, drk-slide-top-medium"
    },
    ".drk-animation-slide-bottom-medium": {
        "animation-name": "drk-fade, drk-slide-bottom-medium"
    },
    ".drk-animation-slide-left-medium": {
        "animation-name": "drk-fade, drk-slide-left-medium"
    },
    ".drk-animation-slide-right-medium": {
        "animation-name": "drk-fade, drk-slide-right-medium"
    },
    ".drk-animation-kenburns": {
        "animation-name": "drk-kenburns",
        "animation-duration": "15s"
    },
    ".drk-animation-shake": {
        "animation-name": "drk-shake"
    },
    ".drk-animation-stroke": {
        "animation-name": "drk-stroke",
        "animation-duration": "2s",
        "stroke-dasharray": "var(--drk-animation-stroke)"
    },
    ".drk-animation-reverse": {
        "animation-direction": "reverse",
        "animation-timing-function": "ease-in"
    },
    ".drk-animation-fast": {
        "animation-duration": "0.1s"
    },
    ".drk-animation-toggle:not(:hover):not(:focus) [class*=\"drk-animation-\"]": {
        "animation-name": "none"
    }
},
{
    "@keyframes drk-fade": {
        "0%": {
            "opacity": 0
        },
        "100%": {
            "opacity": 1
        }
    }
},
{
    "@keyframes drk-scale-up": {
        "0%": {
            "transform": "scale(0.9)"
        },
        "100%": {
            "transform": "scale(1)"
        }
    }
},
{
    "@keyframes drk-scale-down": {
        "0%": {
            "transform": "scale(1.1)"
        },
        "100%": {
            "transform": "scale(1)"
        }
    }
},
{
    "@keyframes drk-slide-top": {
        "0%": {
            "transform": "translateY(-100%)"
        },
        "100%": {
            "transform": "translateY(0)"
        }
    }
},
{
    "@keyframes drk-slide-bottom": {
        "0%": {
            "transform": "translateY(100%)"
        },
        "100%": {
            "transform": "translateY(0)"
        }
    }
},
{
    "@keyframes drk-slide-left": {
        "0%": {
            "transform": "translateX(-100%)"
        },
        "100%": {
            "transform": "translateX(0)"
        }
    }
},
{
    "@keyframes drk-slide-right": {
        "0%": {
            "transform": "translateX(100%)"
        },
        "100%": {
            "transform": "translateX(0)"
        }
    }
},
{
    "@keyframes drk-slide-top-small": {
        "0%": {
            "transform": "translateY(-10px)"
        },
        "100%": {
            "transform": "translateY(0)"
        }
    }
},
{
    "@keyframes drk-slide-bottom-small": {
        "0%": {
            "transform": "translateY(10px)"
        },
        "100%": {
            "transform": "translateY(0)"
        }
    }
},
{
    "@keyframes drk-slide-left-small": {
        "0%": {
            "transform": "translateX(-10px)"
        },
        "100%": {
            "transform": "translateX(0)"
        }
    }
},
{
    "@keyframes drk-slide-right-small": {
        "0%": {
            "transform": "translateX(10px)"
        },
        "100%": {
            "transform": "translateX(0)"
        }
    }
},
{
    "@keyframes drk-slide-top-medium": {
        "0%": {
            "transform": "translateY(-50px)"
        },
        "100%": {
            "transform": "translateY(0)"
        }
    }
},
{
    "@keyframes drk-slide-bottom-medium": {
        "0%": {
            "transform": "translateY(50px)"
        },
        "100%": {
            "transform": "translateY(0)"
        }
    }
},
{
    "@keyframes drk-slide-left-medium": {
        "0%": {
            "transform": "translateX(-50px)"
        },
        "100%": {
            "transform": "translateX(0)"
        }
    }
},
{
    "@keyframes drk-slide-right-medium": {
        "0%": {
            "transform": "translateX(50px)"
        },
        "100%": {
            "transform": "translateX(0)"
        }
    }
},
{
    "@keyframes drk-kenburns": {
        "0%": {
            "transform": "scale(1)"
        },
        "100%": {
            "transform": "scale(1.2)"
        }
    }
},
{
    "@keyframes drk-shake": {
        "0%, 100%": {
            "transform": "translateX(0)"
        },
        "10%": {
            "transform": "translateX(-9px)"
        },
        "20%": {
            "transform": "translateX(8px)"
        },
        "30%": {
            "transform": "translateX(-7px)"
        },
        "40%": {
            "transform": "translateX(6px)"
        },
        "50%": {
            "transform": "translateX(-5px)"
        },
        "60%": {
            "transform": "translateX(4px)"
        },
        "70%": {
            "transform": "translateX(-3px)"
        },
        "80%": {
            "transform": "translateX(2px)"
        },
        "90%": {
            "transform": "translateX(-1px)"
        }
    }
},
{
    "@keyframes drk-stroke": {
        "0%": {
            "stroke-dashoffset": "var(--drk-animation-stroke)"
        },
        "100%": {
            "stroke-dashoffset": 0
        }
    }
},
];
