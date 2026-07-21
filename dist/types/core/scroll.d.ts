import type { ComponentInternalInstance } from '../types';
interface ScrollInstance extends ComponentInternalInstance {
    offset: number;
    scrollTo(element?: string | Element | null): Promise<void>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ScrollInstance>;
export default _default;
