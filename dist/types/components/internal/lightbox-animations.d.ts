type AnimationElement = HTMLElement;
declare const _default: {
    fade: {
        show(): {
            opacity: number;
        }[];
        percent(current: AnimationElement): number;
        translate(percent: number): {
            opacity: number;
        }[];
    };
    scale: {
        show(): {
            opacity: number;
            transform: string;
        }[];
        percent(current: AnimationElement): number;
        translate(percent: number): {
            opacity: number;
            transform: string;
        }[];
    };
    slide: import("../../mixin/types").SlideshowAnimation;
};
export default _default;
