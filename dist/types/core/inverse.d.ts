import type { ComponentInternalInstance } from '../types';
interface InverseInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    target: HTMLElement | HTMLElement[];
    selActive: string | false;
    isIntersecting: number;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<InverseInstance>;
export default _default;
