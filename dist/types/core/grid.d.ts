import type { ComponentInternalInstance } from '../types';
interface GridInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    clsStack: string;
    margin: string;
    masonry: boolean | 'next';
    parallax: number | string;
    parallaxStart: number | string;
    parallaxEnd: number | string;
    parallaxJustify: boolean;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<GridInstance>;
export default _default;
