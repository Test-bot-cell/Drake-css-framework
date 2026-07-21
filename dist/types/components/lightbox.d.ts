import type { ComponentInternalInstance } from '../types';
interface LightboxPanelInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    show(index?: unknown): unknown;
    hide(): unknown;
}
interface LightboxInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    toggle: string;
    toggles: HTMLElement[];
    nav: string;
    panel: LightboxPanelInstance | null | undefined;
    show(index?: number | string | Element): unknown;
    hide(): unknown;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<LightboxInstance>;
export default _default;
