type AnimationElement = HTMLElement;
declare const _default: {
    fade: {
        show(): ({
            opacity: number;
            zIndex: number;
        } | {
            zIndex: number;
            opacity?: undefined;
        })[];
        percent(current: AnimationElement): number;
        translate(percent: number): ({
            opacity: number;
            zIndex: number;
        } | {
            zIndex: number;
            opacity?: undefined;
        })[];
    };
    scale: {
        show(): ({
            opacity: number;
            transform: string;
            zIndex: number;
        } | {
            zIndex: number;
            opacity?: undefined;
            transform?: undefined;
        })[];
        percent(current: AnimationElement): number;
        translate(percent: number): ({
            opacity: number;
            transform: string;
            zIndex: number;
        } | {
            zIndex: number;
            opacity?: undefined;
            transform?: undefined;
        })[];
    };
    pull: {
        show(dir: number): {
            transform: string;
            zIndex: number;
        }[];
        percent(current: AnimationElement, next: AnimationElement, dir: number): number;
        translate(percent: number, dir: number): {
            transform: string;
            zIndex: number;
        }[];
    };
    push: {
        show(dir: number): {
            transform: string;
            zIndex: number;
        }[];
        percent(current: AnimationElement, next: AnimationElement, dir: number): number;
        translate(percent: number, dir: number): {
            transform: string;
            zIndex: number;
        }[];
    };
    slide: import("../../mixin/types").SlideshowAnimation;
};
export default _default;
export declare function scale3d(value: number): string;
