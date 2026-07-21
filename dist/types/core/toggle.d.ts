import type { ComponentInternalInstance, ElementInput, NodeInput } from '../types';
interface ToggleHost extends HTMLElement {
    disabled?: boolean;
    hash?: string;
}
interface ToggleInstance extends ComponentInternalInstance {
    readonly $el: ToggleHost;
    target: HTMLElement[];
    mode: string | string[];
    queued: boolean;
    cls: string | false;
    clsLeave: string;
    _preventClick: boolean | null;
    _showState: boolean | null;
    toggle(type?: string): Promise<void>;
    toggleElement(targets: NodeInput, toggle?: boolean, animate?: boolean): Promise<boolean>;
    isToggled(element?: ElementInput): boolean;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ToggleInstance>;
export default _default;
