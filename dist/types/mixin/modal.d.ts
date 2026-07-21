import type { TogglableInstance } from './types';
interface ModalInstance extends TogglableInstance {
    selPanel: string;
    selClose: string;
    escClose: boolean;
    bgClose: boolean;
    stack: boolean;
    role: string;
    overlay: boolean;
    clsPage: string;
    panel: HTMLElement | undefined;
    transitionElement: HTMLElement | undefined;
    container: Element | false | '' | undefined;
    target: HTMLElement | null;
    toggle(): Promise<boolean>;
    show(): Promise<boolean>;
    hide(): Promise<boolean>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ModalInstance>;
export default _default;
