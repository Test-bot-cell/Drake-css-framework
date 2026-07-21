import type { ComponentInternalInstance } from '../types';
interface ResponsiveInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    width: string | number;
    height: string | number;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ResponsiveInstance>;
export default _default;
