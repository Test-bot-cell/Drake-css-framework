import type { ComponentInternalInstance, ComponentValueMap, CssProperties, FrameworkEvent, Point } from '../types';
import type { IndexSpecifier } from '../util/lang';
export interface ElementEvent extends FrameworkEvent<Element> {
    readonly target: Element;
    readonly currentTarget: Element | null;
}
export interface SlideshowAnimation {
    show(direction: number): [CssProperties, CssProperties];
    percent(current: HTMLElement, next?: HTMLElement, direction?: number): number;
    translate(percent: number, direction: number): [CssProperties, CssProperties];
}
export type SlideshowAnimations = Record<string, SlideshowAnimation> & {
    slide: SlideshowAnimation;
};
export interface SlideshowTransitionOptions {
    animation: SlideshowAnimation;
    easing?: string;
}
export interface SlideshowTransitioner {
    readonly dir: number;
    show(duration: number, percent?: number, linear?: boolean): Promise<void>;
    cancel(): Promise<void>;
    reset(): void;
    forward(duration: number, percent?: number): Promise<void>;
    translate(percent: number): void;
    percent(): number;
    getDistance(): number | undefined;
}
export interface SlideshowTransitionerConstructor {
    new (previous: HTMLElement | undefined, next: HTMLElement | undefined, direction: number, options: SlideshowTransitionOptions): SlideshowTransitioner;
    (previous: HTMLElement | undefined, next: HTMLElement | undefined, direction: number, options: SlideshowTransitionOptions): SlideshowTransitioner;
}
export type SliderIndex = IndexSpecifier;
export interface SliderInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & {
        index: SliderIndex;
    };
    easing: string;
    finite: boolean;
    velocity: number;
    index: number;
    prevIndex: number;
    stack: SliderIndex[];
    percent: number | null;
    dir: number;
    dragging: boolean | null;
    parallax: boolean;
    duration: number;
    list: HTMLElement | undefined;
    slides: HTMLElement[];
    length: number;
    maxIndex: number;
    clsActive: string;
    clsActivated: string;
    clsEnter: string;
    clsLeave: string;
    clsSlideActive: string;
    Transitioner: SlideshowTransitionerConstructor;
    transitionOptions: SlideshowTransitionOptions;
    _transitioner: SlideshowTransitioner | null;
    show(index: SliderIndex, force?: boolean): Promise<void>;
    getIndex(index?: SliderIndex, previous?: number): number;
    getValidIndex(index?: SliderIndex, previous?: number): number;
    _show(previous: HTMLElement | false | undefined, next: number | HTMLElement, force: boolean): Promise<void>;
    _translate(percent: number, previous?: number | HTMLElement | false, next?: number | HTMLElement | false): SlideshowTransitioner;
    _getTransitioner(previous?: number | HTMLElement | false, next?: number | HTMLElement | false, direction?: number, options?: SlideshowTransitionOptions): SlideshowTransitioner;
    t(key: string, ...params: Array<string | number>): string;
}
export interface DraggableSliderInstance extends SliderInstance {
    draggable: boolean;
    threshold: number;
    angleThreshold: number;
    pos: Point;
    prevPos: Point;
    drag: Point | null;
    start(event: FrameworkEvent): void;
    move(event: FrameworkEvent): void;
    end(event: FrameworkEvent): void;
}
export type ToggleAnimation = Array<string | false>;
export type ToggleAnimationHandler = (element: HTMLElement, show: boolean, component: TogglableInstance) => void | Promise<unknown>;
export interface TogglableInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    cls: string | false;
    animation: ToggleAnimation;
    duration: number;
    velocity: number;
    origin: string | false;
    transition: string;
    clsEnter: string;
    clsLeave: string;
    hasAnimation: boolean;
    hasTransition: boolean;
    toggleElement(targets: Node | ArrayLike<Node> | Iterable<Node> | null | undefined, toggle?: boolean, animate?: boolean | ToggleAnimationHandler): Promise<boolean>;
    isToggled(element?: HTMLElement): boolean;
    _toggle(element: HTMLElement | undefined, toggled: boolean): void;
}
