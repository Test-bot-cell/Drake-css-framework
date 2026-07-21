import type { SliderInstance } from './types';
interface SliderNavInstance extends SliderInstance {
    selNav: string | false;
    attrItem: string;
    role: string;
    nav: HTMLElement[];
    navChildren: HTMLElement[];
    selNavItem: string;
    navItems: HTMLElement[];
    updateNav(): void;
    padNavitems(): void;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<SliderNavInstance>;
export default _default;
