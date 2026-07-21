import type { SliderInstance, SlideshowTransitioner } from '../mixin/types';
interface SliderComponentTransitioner extends SlideshowTransitioner {
    getItemIn(out?: boolean): HTMLElement | undefined;
    getActives(): HTMLElement[];
}
interface SliderComponentInstance extends SliderInstance {
    list: HTMLElement;
    center: boolean;
    sets: number[] | false | undefined;
    active: string;
    attrItem: string;
    clsContainer: string;
    navItems: HTMLElement[];
    transitionOptions: {
        center: boolean;
        list: HTMLElement;
    } & SliderInstance['transitionOptions'];
    reorder(): void;
    updateActiveClasses(currentIndex?: number): void;
    getAdjacentSlides(): HTMLElement[];
    getIndexAt(percent: number): [number, number];
    _translate(percent: number, previous?: number | HTMLElement | false, next?: number | HTMLElement | false): SliderComponentTransitioner;
    _getTransitioner(previous?: number | HTMLElement | false, next?: number | HTMLElement | false, direction?: number, options?: SliderInstance['transitionOptions']): SliderComponentTransitioner;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<SliderComponentInstance>;
export default _default;
