import type { ComponentInternalInstance } from '../types';
interface SvgCoreInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    src: string;
    icon?: string;
    attributes: string[];
    strokeAnimation: boolean;
    svg: Promise<Element | undefined> | null;
    getSvg(): Promise<Element>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<SvgCoreInstance>;
export default _default;
