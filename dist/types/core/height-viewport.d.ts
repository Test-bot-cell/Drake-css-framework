import type { ComponentInternalInstance } from '../types';
interface HeightViewportInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    expand: boolean;
    offsetTop: boolean | string;
    offsetBottom: boolean | number | string;
    min: number;
    property: string;
    matchMedia: boolean;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<HeightViewportInstance>;
export default _default;
