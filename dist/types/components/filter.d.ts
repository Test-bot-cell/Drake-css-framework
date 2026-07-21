import type { ComponentInternalInstance } from '../types';
interface FilterState {
    filter: Record<string, string>;
    sort: [string?, string?];
}
interface FilterInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    target: string;
    selActive: string | false;
    attrItem: string;
    cls: string;
    children: HTMLElement[];
    toggles: HTMLElement[];
    animate(action: () => unknown, target?: HTMLElement): Promise<void>;
    apply(element: HTMLElement): void;
    getState(): FilterState;
    setState(state: Partial<FilterState>, animate?: boolean): Promise<void>;
    updateState(): void;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<FilterInstance>;
export default _default;
