import type { ComponentInternalInstance } from '../types';
type OffcanvasMode = 'slide' | 'push' | 'reveal' | 'none';
interface OffcanvasInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    panel: HTMLElement;
    mode: OffcanvasMode;
    flip: boolean;
    overlay: boolean;
    swiping: boolean;
    clsPage: string;
    clsContainer: string;
    clsFlip: string;
    clsContainerAnimation: string;
    clsSidebarAnimation: string;
    clsMode: string;
    clsOverlay: string;
    isToggled(): boolean;
    hide(): Promise<unknown>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<OffcanvasInstance>;
export default _default;
