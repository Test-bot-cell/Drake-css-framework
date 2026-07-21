// Source canonique des styles Drake.css (D-013).
// Amorcée depuis la cascade de référence (theme · cover.less) ; maintenue à la main désormais.
import type { GlobalStyleObject } from '@pandacss/types';

export const fragments: GlobalStyleObject[] = [
{
    "[drk-cover]:where(canvas, iframe, svg), [data-drk-cover]:where(canvas, iframe, svg)": {
        "max-width": "none",
        "position": "absolute",
        "left": "50%",
        "top": "50%",
        "--drk-position-translate-x": "-50%",
        "--drk-position-translate-y": "-50%",
        "transform": "translate(var(--drk-position-translate-x), var(--drk-position-translate-y))"
    },
    "iframe[drk-cover], iframe[data-drk-cover]": {
        "pointer-events": "none"
    },
    "[drk-cover]:where(img, video), [data-drk-cover]:where(img, video)": {
        "position": "absolute",
        "top": "__DRK_RAW__0__",
        "left": "__DRK_RAW__0__",
        "width": "100%",
        "height": "100%",
        "box-sizing": "border-box",
        "object-fit": "cover",
        "object-position": "center"
    },
    ".drk-cover-container": {
        "overflow": "hidden",
        "position": "relative"
    }
},
];
