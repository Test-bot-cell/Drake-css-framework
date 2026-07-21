// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · form.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

import { breakpoints, palette } from '../tokens';

export const fragments: GlobalStyleObject[] = [
{
    ".drk-input, .drk-select, .drk-textarea, .drk-radio, .drk-checkbox": {
        "box-sizing": "border-box",
        "margin": "__DRK_RAW__0__",
        "border-radius": "__DRK_RAW__0__",
        "font": "inherit"
    }
},
{
    ".drk-input": {
        "overflow": "visible"
    },
    ".drk-select": {
        "text-transform": "none"
    },
    ".drk-select optgroup": {
        "font": "inherit"
    }
},
{
    ".drk-select optgroup": {
        "font-weight": "bold"
    }
},
{
    ".drk-textarea": {
        "overflow": "auto"
    },
    ".drk-input[type=\"search\"]::-webkit-search-cancel-button, .drk-input[type=\"search\"]::-webkit-search-decoration": {
        "-webkit-appearance": "none"
    },
    ".drk-input[type=\"number\"]::-webkit-inner-spin-button, .drk-input[type=\"number\"]::-webkit-outer-spin-button": {
        "height": "auto"
    },
    ".drk-input[type=\"date\"]::-webkit-datetime-edit, .drk-input[type=\"time\"]::-webkit-datetime-edit, .drk-input[type=\"datetime-local\"]::-webkit-datetime-edit": {
        "display": "inline-flex",
        "align-items": "center",
        "height": "100%",
        "padding": "__DRK_RAW__0__"
    },
    ".drk-input::-moz-placeholder, .drk-textarea::-moz-placeholder": {
        "opacity": 1
    },
    ".drk-radio:not(:disabled), .drk-checkbox:not(:disabled)": {
        "cursor": "pointer"
    },
    ".drk-fieldset": {
        "border": "none",
        "margin": "__DRK_RAW__0__",
        "padding": "__DRK_RAW__0__",
        "min-width": "__DRK_RAW__0__"
    }
},
{
    ".drk-input, .drk-textarea": {
        "-webkit-appearance": "none"
    }
},
{
    ".drk-input, .drk-select, .drk-textarea": {
        "max-width": "100%",
        "width": "100%",
        "border": "0 none",
        "padding": "0 10px",
        "background": "#fff",
        "color": palette.text
    }
},
{
    ".drk-input, .drk-select, .drk-textarea": {
        "border": "1px solid #e5e5e5",
        "transition": "0.2s ease-in-out"
    }
},
{
    ".drk-input, .drk-select, .drk-textarea": {
        "transition-property": "color, background-color, border"
    }
},
{
    ".drk-input, .drk-select:not([multiple]):not([size])": {
        "height": "40px",
        "vertical-align": "middle"
    },
    ".drk-input:where(:not(input)), .drk-select:where(:not(select))": {
        "display": "inline-block",
        "line-height": "38px",
        "overflow": "hidden",
        "text-overflow": "ellipsis",
        "white-space": "nowrap"
    },
    ".drk-select[multiple], .drk-select[size], .drk-textarea": {
        "padding": "6px 10px",
        "vertical-align": "top"
    }
},
{
    ".drk-select[multiple], .drk-select[size]": {
        "resize": "vertical"
    },
    ".drk-input:focus, .drk-select:focus, .drk-textarea:focus": {
        "outline": "none",
        "background-color": "#fff",
        "color": palette.text,
        "border-color": palette.primary
    },
    ".drk-input:disabled, .drk-select:disabled, .drk-textarea:disabled": {
        "background-color": palette.mutedBackground,
        "color": palette.muted,
        "border-color": "#e5e5e5"
    },
    ".drk-input::placeholder": {
        "color": palette.muted
    },
    ".drk-textarea::placeholder": {
        "color": palette.muted
    },
    ".drk-form-danger, .drk-form-danger:focus": {
        "color": palette.danger,
        "border-color": palette.danger
    },
    ".drk-form-success, .drk-form-success:focus": {
        "color": palette.success,
        "border-color": palette.success
    },
    ".drk-form-blank": {
        "background": "none",
        "border-color": "transparent"
    },
    ".drk-form-blank:focus": {
        "border-color": "#e5e5e5",
        "border-style": "solid"
    },
    "input.drk-form-width-xsmall": {
        "width": "50px"
    },
    "select.drk-form-width-xsmall": {
        "width": "75px"
    },
    ".drk-form-width-small": {
        "width": "130px"
    },
    ".drk-form-width-medium": {
        "width": "200px"
    },
    ".drk-form-width-large": {
        "width": "500px"
    },
    ".drk-select:not([multiple]):not([size])": {
        "-webkit-appearance": "none",
        "-moz-appearance": "none",
        "padding-right": "20px",
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M8%209l4%20-4l4%204%22%20%2F%3E%3Cpath%20d%3D%22M16%2015l-4%204l-4%20-4%22%20%2F%3E%3C%2Fsvg%3E\\\")",
        "background-repeat": "no-repeat",
        "background-position": "100% 50%"
    },
    ".drk-select:not([multiple]):not([size]) option": {
        "color": palette.text
    },
    ".drk-select:not([multiple]):not([size]):disabled": {
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M8%209l4%20-4l4%204%22%20%2F%3E%3Cpath%20d%3D%22M16%2015l-4%204l-4%20-4%22%20%2F%3E%3C%2Fsvg%3E\\\")"
    },
    ".drk-input[list]": {
        "padding-right": "20px",
        "background-repeat": "no-repeat",
        "background-position": "100% 50%"
    },
    ".drk-input[list]:hover, .drk-input[list]:focus": {
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M6%209l6%206l6%20-6%22%20%2F%3E%3C%2Fsvg%3E\\\")"
    },
    ".drk-input[list]::-webkit-calendar-picker-indicator": {
        "display": "none !important"
    },
    ".drk-radio, .drk-checkbox": {
        "display": "inline-block",
        "height": "16px",
        "width": "16px",
        "overflow": "hidden",
        "margin-top": "-4px",
        "vertical-align": "middle",
        "-webkit-appearance": "none",
        "-moz-appearance": "none",
        "background-color": "transparent",
        "background-size": "cover",
        "border": "1px solid #cccccc",
        "transition": "0.2s ease-in-out"
    }
},
{
    ".drk-radio, .drk-checkbox": {
        "transition-property": "background-color, border"
    }
},
{
    ".drk-radio": {
        "border-radius": "50%"
    },
    ".drk-radio:focus, .drk-checkbox:focus": {
        "background-color": "rgba(0, 0, 0, 0)",
        "outline": "none",
        "border-color": palette.primary
    },
    ".drk-radio:checked, .drk-checkbox:checked, .drk-checkbox:indeterminate": {
        "background-color": palette.primary,
        "border-color": "transparent"
    },
    ".drk-radio:checked:focus, .drk-checkbox:checked:focus, .drk-checkbox:indeterminate:focus": {
        "background-color": "#0e6dcd"
    }
},
{
    ".drk-radio:checked": {
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M8%2012a4%204%200%201%200%208%200a4%204%200%201%200%20-8%200%22%20%2F%3E%3C%2Fsvg%3E\\\")"
    },
    ".drk-checkbox:checked": {
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M5%2012l5%205l10%20-10%22%20%2F%3E%3C%2Fsvg%3E\\\")"
    },
    ".drk-checkbox:indeterminate": {
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M5%2012l14%200%22%20%2F%3E%3C%2Fsvg%3E\\\")"
    },
    ".drk-radio:disabled, .drk-checkbox:disabled": {
        "background-color": palette.mutedBackground,
        "border-color": "#e5e5e5"
    },
    ".drk-radio:disabled:checked": {
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M8%2012a4%204%200%201%200%208%200a4%204%200%201%200%20-8%200%22%20%2F%3E%3C%2Fsvg%3E\\\")"
    },
    ".drk-checkbox:disabled:checked": {
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M5%2012l5%205l10%20-10%22%20%2F%3E%3C%2Fsvg%3E\\\")"
    },
    ".drk-checkbox:disabled:indeterminate": {
        "background-image": "url(\\\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%0A%3E%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%20%2F%3E%3Cpath%20d%3D%22M5%2012l14%200%22%20%2F%3E%3C%2Fsvg%3E\\\")"
    },
    ".drk-form-small:is(.drk-input, .drk-search-input, .drk-select, .drk-textarea)": {
        "font-size": "0.875rem"
    }
},
{
    ".drk-form-small:is(.drk-input, .drk-search-input, .drk-select:not([multiple]):not([size]))": {
        "height": "30px",
        "padding-left": "8px",
        "padding-right": "8px"
    },
    ".drk-form-small:is(.drk-select[multiple], .drk-select[size], .drk-textarea)": {
        "padding": "5px 8px"
    },
    ".drk-form-small:not(select):not(input):not(textarea):not([type=\"radio\"]):not([type=\"checkbox\"])": {
        "line-height": "28px"
    },
    ".drk-form-small:is(.drk-radio, .drk-checkbox)": {
        "height": "14px",
        "width": "14px"
    }
},
{
    ".drk-form-large:is(.drk-input, .drk-search-input, .drk-select, .drk-textarea)": {
        "font-size": "1.25rem"
    }
},
{
    ".drk-form-large:is(.drk-input, .drk-search-input, .drk-select:not([multiple]):not([size]))": {
        "height": "55px",
        "padding-left": "12px",
        "padding-right": "12px"
    },
    ".drk-form-large:is(.drk-select[multiple], .drk-select[size], .drk-textarea)": {
        "padding": "7px 12px"
    },
    ".drk-form-large:not(select):not(input):not(textarea):not([type=\"radio\"]):not([type=\"checkbox\"])": {
        "line-height": "53px"
    },
    ".drk-form-large:is(.drk-radio, .drk-checkbox)": {
        "height": "22px",
        "width": "22px"
    },
    ".drk-legend": {
        "width": "100%",
        "color": "inherit",
        "padding": "__DRK_RAW__0__",
        "font-size": "1.5rem",
        "line-height": 1.4
    },
    ".drk-form-custom": {
        "display": "inline-block",
        "position": "relative",
        "max-width": "100%",
        "vertical-align": "middle"
    },
    ".drk-form-custom select, .drk-form-custom input[type=\"file\"]": {
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "z-index": 1,
        "width": "100%",
        "height": "100%",
        "left": "__DRK_RAW__0__",
        "-webkit-appearance": "none",
        "opacity": 0,
        "cursor": "pointer"
    }
},
{
    ".drk-form-custom input[type=\"file\"]": {
        "font-size": "500px",
        "overflow": "hidden"
    },
    ".drk-form-label": {
        "color": palette.emphasis,
        "font-size": "0.875rem"
    },
    ".drk-form-stacked .drk-form-label": {
        "display": "block",
        "margin-bottom": "5px"
    },
    ".drk-form-horizontal .drk-form-label": {
        "display": "block",
        "margin-bottom": "5px"
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-form-horizontal .drk-form-label": {
            "width": "200px",
            "margin-top": "7px",
            "margin-bottom": "__DRK_RAW__0__",
            "float": "left"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-form-horizontal .drk-form-controls": {
            "margin-left": "215px"
        }
    }
},
{
    [`@media (min-width: ${breakpoints.m})`]: {
        ".drk-form-horizontal .drk-form-controls-text": {
            "padding-top": "7px"
        }
    }
},
{
    ".drk-form-icon": {
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "bottom": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "width": "40px",
        "display": "inline-flex",
        "justify-content": "center",
        "align-items": "center",
        "color": palette.muted
    },
    ".drk-form-icon:hover": {
        "color": palette.text
    },
    ".drk-form-icon:not(a):not(button):not(input)": {
        "pointer-events": "none"
    },
    ".drk-form-icon:not(.drk-form-icon-flip) ~ .drk-input": {
        "padding-left": "40px !important"
    },
    ".drk-form-icon-flip": {
        "right": "__DRK_RAW__0__",
        "left": "auto"
    },
    ".drk-form-icon-flip ~ .drk-input": {
        "padding-right": "40px !important"
    }
},
];
