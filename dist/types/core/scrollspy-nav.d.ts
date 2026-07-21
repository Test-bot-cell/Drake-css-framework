import type { ComponentInternalInstance } from '../types';
interface ScrollspyNavInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    links: HTMLAnchorElement[];
    targets: Element[];
    elements: Array<Element | null>;
    cls: string;
    scroll: boolean;
    offset: number;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ScrollspyNavInstance>;
export default _default;
