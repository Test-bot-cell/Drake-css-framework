import type { ComponentInternalInstance, CssProperties } from '../types';
interface ParallaxInstance extends ComponentInternalInstance {
    target: Element;
    viewport: number;
    easing: number;
    start: number;
    end: number;
    matchMedia: boolean;
    reset(): void;
    getCss(percent: number): CssProperties;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ParallaxInstance>;
export default _default;
