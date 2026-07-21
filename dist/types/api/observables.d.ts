import type { ComponentInternalInstance, ComponentObservable, ElementInput, FrameworkEvent, NodeInput, ObservableHandle } from '../types';
export interface ObservableOptions<I extends ComponentInternalInstance, Records, Handle extends ObservableHandle> {
    target?: NodeInput | ((this: I, instance: I) => NodeInput);
    handler?: (this: I, records: Records, observer: Handle) => unknown;
    options?: unknown | ((this: I, instance: I) => unknown);
    filter?: (this: I, instance: I) => boolean;
    args?: unknown;
}
export declare function resize<I extends ComponentInternalInstance = ComponentInternalInstance>(options?: ObservableOptions<I, ResizeObserverEntry[], ObservableHandle<Element>>): ComponentObservable;
export declare function intersection<I extends ComponentInternalInstance = ComponentInternalInstance>(options?: ObservableOptions<I, IntersectionObserverEntry[], IntersectionObserver>): ComponentObservable;
export declare function mutation<I extends ComponentInternalInstance = ComponentInternalInstance>(options?: ObservableOptions<I, MutationRecord[], MutationObserver>): ComponentObservable;
interface LazyloadOptions<I extends ComponentInternalInstance> extends ObservableOptions<I, IntersectionObserverEntry[], IntersectionObserver> {
    targets?: ElementInput | ((instance: I) => ElementInput);
    preload?: number;
}
export declare function lazyload<I extends ComponentInternalInstance = ComponentInternalInstance>(options?: LazyloadOptions<I>): ComponentObservable;
export declare function viewport<I extends ComponentInternalInstance = ComponentInternalInstance>(options?: ObservableOptions<I, FrameworkEvent, ObservableHandle>): ComponentObservable;
export declare function scroll<I extends ComponentInternalInstance = ComponentInternalInstance>(options?: ObservableOptions<I, FrameworkEvent, ObservableHandle>): ComponentObservable;
export declare function swipe<I extends ComponentInternalInstance = ComponentInternalInstance>(options?: ObservableOptions<I, FrameworkEvent, ObservableHandle>): ComponentObservable;
export {};
