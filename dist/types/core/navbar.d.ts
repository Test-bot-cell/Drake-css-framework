import type { ComponentInternalInstance } from '../types';
interface NavbarDropdown extends ComponentInternalInstance {
    inset: boolean;
    targetEl: Element;
}
interface NavbarInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    navbarContainer: HTMLElement | null;
    items: HTMLElement[];
    dropContainer: HTMLElement;
    dropbar: HTMLElement | null;
    dropbarTransparentMode: boolean | 'behind' | 'remove';
    _transparent: boolean | null;
    getTransparentMode(element: Element): boolean | 'behind' | 'remove' | undefined;
    getDropbarOffset(offsetTop: number): number;
    getDropdown(element: Element): NavbarDropdown | undefined;
    isDropbarDrop(element: Element): boolean;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<NavbarInstance>;
export default _default;
