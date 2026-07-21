import type { ComponentInternalInstance } from '../../types';
interface SliderPreloadInstance extends ComponentInternalInstance {
    slides: HTMLElement[];
    index: number;
    getIndex(index: number): number;
    getAdjacentSlides(): (HTMLElement | undefined)[];
}
declare const _default: import("../../api/options").ExplicitComponentOptionsFor<SliderPreloadInstance>;
export default _default;
