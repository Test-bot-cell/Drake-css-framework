import type { ComponentInternalInstance, NodeInput } from '../types';
import type { IndexSpecifier } from '../util/lang';
interface SwitcherInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    connects: HTMLElement[];
    connectChildren: Element[];
    toggles: HTMLElement[];
    toggle: string;
    children: Element[];
    active: number;
    cls: string;
    itemNav: string | false;
    attrItem: string;
    selVertical: string;
    followFocus: boolean;
    swiping: boolean;
    index(): number;
    next(item: SwitcherItem, previous?: number): number;
    show(item: SwitcherItem): void;
    toggleElement(targets: NodeInput, toggle?: boolean, animate?: boolean): Promise<boolean>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<SwitcherInstance>;
export default _default;
type SwitcherItem = IndexSpecifier | string;
