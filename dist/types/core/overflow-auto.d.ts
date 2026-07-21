import type { ComponentInternalInstance } from '../types';
interface OverflowAutoInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    container?: HTMLElement;
    content?: HTMLElement;
    minHeight: number;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<OverflowAutoInstance>;
export default _default;
