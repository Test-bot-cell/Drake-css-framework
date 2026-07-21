import type { ComponentInternalInstance, ComponentOptions, CssProperties } from '../types';
interface SliderParallaxInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $options: ComponentOptions & {
        id: string;
    };
    item: Element | null;
    matchMedia: boolean;
    getCss(percent: number): CssProperties;
    reset(): void;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<SliderParallaxInstance>;
export default _default;
