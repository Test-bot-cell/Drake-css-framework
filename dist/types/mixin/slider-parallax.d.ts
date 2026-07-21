import type { SliderInstance } from './types';
interface ParallaxSliderInstance extends SliderInstance {
    parallaxTarget: Element | undefined;
    parallaxStart: string | number;
    parallaxEnd: string | number;
    parallaxEasing: number;
    getIndexAt(percent: number): [number, number];
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ParallaxSliderInstance>;
export default _default;
