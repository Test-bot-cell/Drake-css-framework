import type { ComponentInternalInstance, ComponentValueMap, NodeInput } from '../types';
import type { IndexSpecifier } from '../util/lang';
interface AccordionItem extends HTMLElement {
    _wrapper?: HTMLElement;
}
interface AccordionTransitionContext {
    content: string;
    duration: number;
    velocity: number;
    transition: string;
}
interface AccordionInstance extends ComponentInternalInstance, AccordionTransitionContext {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & {
        toggle: string;
    };
    items: AccordionItem[];
    toggles: Array<HTMLElement | undefined>;
    contents: Array<HTMLElement | undefined>;
    targets: string;
    active: false | string | number;
    animation: boolean;
    collapsible: boolean;
    multiple: boolean;
    clsOpen: string;
    offset: number;
    toggle(item: IndexSpecifier, animate?: boolean): Promise<boolean[]>;
    toggleElement(targets: NodeInput, toggle: boolean, animate: (element: AccordionItem, show: boolean) => void | Promise<void>): Promise<boolean>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<AccordionInstance>;
export default _default;
