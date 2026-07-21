import type { ComponentInternalInstance, Teardown } from '../types';
interface ScrollspyState {
    cls: string;
    show?: boolean;
    inview?: boolean;
    queued?: boolean;
    off?: Teardown;
}
interface ScrollspyInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    cls: string;
    elements: HTMLElement[];
    hidden: boolean;
    repeat: boolean;
    delay: number;
    margin: string;
    elementData?: Map<Element, ScrollspyState>;
    toggle(element: Element, inview: boolean): void;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ScrollspyInstance>;
export default _default;
