import type { ComponentInternalInstance } from '../types';
interface ModalInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    panel: HTMLElement;
    isToggled(): boolean;
    hide(): Promise<unknown>;
    show(): Promise<unknown>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ModalInstance>;
export default _default;
