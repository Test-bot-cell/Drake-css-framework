import type { ComponentInternalInstance } from '../types';
interface CoverInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    width?: number;
    height?: number;
    useObjectFit: boolean;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<CoverInstance>;
export default _default;
