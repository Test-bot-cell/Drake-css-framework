import type { ComponentInternalInstance } from '../types';
interface LeaderInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    fill: string;
    clsWrapper: string;
    clsHide: string;
    attrFill: string;
    matchMedia: boolean;
    wrapper?: HTMLElement;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<LeaderInstance>;
export default _default;
