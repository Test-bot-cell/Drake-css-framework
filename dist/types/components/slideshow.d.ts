import type { ComponentInternalInstance } from '../types';
interface SlideshowInstance extends ComponentInternalInstance {
    ratio: string;
    minHeight: string | undefined;
    maxHeight: string | undefined;
    list: HTMLElement;
    slides: HTMLElement[];
    index: number;
    getIndex(index: number): number;
    getAdjacentSlides(): (HTMLElement | undefined)[];
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<SlideshowInstance>;
export default _default;
