import type { SliderInstance } from './types';
interface AutoplaySliderInstance extends SliderInstance {
    autoplay: boolean;
    autoplayInterval: number;
    pauseOnHover: boolean;
    interval?: number;
    startAutoplay(): void;
    stopAutoplay(): void;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<AutoplaySliderInstance>;
export default _default;
