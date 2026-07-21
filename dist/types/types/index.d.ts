export type UnknownRecord = Record<PropertyKey, unknown>;
export type Teardown = () => void;
export type NodeInput<T extends Node = Node> = T | ArrayLike<T> | Iterable<T> | null | undefined;
export type ElementInput<T extends Element = Element> = NodeInput<T>;
export type EventTargetInput = EventTarget | NodeInput | string | readonly EventTarget[] | null | undefined;
export type CssValue = string | number | null | undefined;
export type CssProperties = Record<string, CssValue>;
export type Dimension = 'width' | 'height';
export type Axis = 'x' | 'y';
export type Side = 'top' | 'right' | 'bottom' | 'left';
export interface Point {
    x: number;
    y: number;
}
export interface Coordinates {
    top: number;
    left: number;
}
export interface Rect extends Coordinates {
    width: number;
    height: number;
    right: number;
    bottom: number;
    x: number;
    y: number;
}
export interface FrameworkEvent<T extends EventTarget = EventTarget> extends Event {
    readonly target: T | null;
    readonly currentTarget: T | null;
    current?: Element;
    detail?: unknown;
    pointerType?: string;
    touches?: TouchList;
    targetTouches?: TouchList;
}
export type EventListener = (event: FrameworkEvent, ...detail: unknown[]) => unknown;
export interface EventListenerOptions extends AddEventListenerOptions {
    self?: boolean;
}
export interface ObservableHandle<T extends Node = Node> {
    disconnect(): void;
    observe?(target: T, options?: unknown): void;
    unobserve?(target: T): void;
}
export type ComponentValueMap = Record<string, unknown>;
export type GenericFunction = (...args: never[]) => unknown;
export type ComponentMethod = (this: ComponentInternalInstance, ...args: unknown[]) => unknown;
export type ComponentHook = GenericFunction;
export type ComponentHookOption = ComponentHook | readonly ComponentHook[];
export type PropType = null | StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | string | ((value: unknown) => unknown);
export type PropsDefinition = Record<string, PropType> | readonly string[];
export interface ComputedObject {
    get?: GenericFunction;
    set?: GenericFunction;
    observe?: GenericFunction;
}
export type ComputedDefinition = GenericFunction | ComputedObject;
export interface ComponentEventDefinition {
    name: string | readonly string[];
    el?: GenericFunction;
    handler: GenericFunction;
    capture?: boolean;
    passive?: boolean;
    delegate?: GenericFunction;
    filter?: GenericFunction;
    self?: boolean;
}
export type ComponentEventMap = Record<string, GenericFunction>;
export interface ComponentUpdate {
    read?: GenericFunction;
    write?: GenericFunction;
    events?: readonly string[];
}
export interface ComponentWatch {
    handler: GenericFunction;
    immediate?: boolean;
}
export interface RegisteredWatch extends ComponentWatch {
    name: string;
}
export type WatchDefinition = ComponentWatch | ComponentWatch['handler'];
export type WatchMap = Record<string, WatchDefinition>;
export type ObservableTarget = NodeInput | ((this: ComponentInternalInstance, instance: ComponentInternalInstance) => NodeInput);
export interface ComponentObservable {
    observe: GenericFunction;
    target?: ObservableTarget | GenericFunction;
    handler: string | GenericFunction;
    options?: unknown | GenericFunction;
    filter?: GenericFunction;
    args?: unknown;
}
export interface ComponentOptions {
    [key: string]: unknown;
    id?: string;
    name?: string;
    el?: Element;
    args?: string | readonly string[] | boolean;
    props?: PropsDefinition;
    data?: ComponentValueMap | readonly unknown[] | GenericFunction;
    computed?: Record<string, ComputedDefinition>;
    methods?: Record<string, GenericFunction>;
    events?: ComponentEventDefinition | ComponentEventMap | readonly (ComponentEventDefinition | ComponentEventMap)[];
    observe?: ComponentObservable | readonly ComponentObservable[];
    update?: ComponentUpdate | readonly ComponentUpdate[] | ComponentUpdate['read'];
    watch?: WatchMap | readonly WatchMap[];
    i18n?: ComponentValueMap;
    mixins?: readonly ComponentOptions[];
    extends?: ComponentOptions;
    functional?: boolean;
    install?: GenericFunction;
    created?: ComponentHookOption;
    beforeConnect?: ComponentHookOption;
    connected?: ComponentHookOption;
    beforeDisconnect?: ComponentHookOption;
    disconnected?: ComponentHookOption;
    destroy?: ComponentHookOption;
}
export interface ComponentInitOptions extends ComponentOptions {
    data?: ComponentValueMap | readonly unknown[];
}
export interface ComponentInternalInstance {
    [key: string]: unknown;
    constructor: ComponentConstructor;
    $options: ComponentOptions;
    $props: ComponentValueMap;
    readonly $el: Element;
    readonly $container: Element;
    $mount(element: Element): void;
    $destroy(removeElement?: boolean): void;
    $create(name: string, element?: unknown, data?: unknown, ...args: unknown[]): unknown;
    $emit(event?: string | Event): void;
    $update(element?: Element, event?: string | Event): void;
    $reset(): void;
    $getComponent(element: Element, name: string): ComponentInternalInstance | undefined;
    _uid: number;
    _connected: boolean;
    _disconnect: Teardown[] | null;
    _computed: ComponentValueMap;
    _hasComputed?: boolean;
    _computedObserver?: MutationObserver | null;
    _updates: ComponentUpdate[] | null;
    _data: ComponentValueMap | null;
    _updateCount: number;
    _queued: Set<string> | null;
    _watches: RegisteredWatch[];
    _initial: boolean;
}
export interface ComponentConstructor {
    new (options?: ComponentInitOptions): ComponentInternalInstance;
    (this: ComponentInternalInstance, options?: ComponentInitOptions): void;
    prototype: ComponentInternalInstance;
    options: ComponentOptions;
    super?: ComponentConstructor;
    extend(options?: ComponentOptions): ComponentConstructor;
    [key: string]: unknown;
}
export type ComponentDefinition = ComponentOptions | ComponentConstructor;
export type ComponentRegistry = Record<string, ComponentDefinition>;
export interface MountedElement extends Element {
    __drake__?: Record<string, ComponentInternalInstance>;
}
export type DrakePlugin = ((app: DrakeStatic) => unknown) & {
    installed?: boolean;
};
export interface DrakeStatic extends ComponentConstructor {
    util: Record<string, unknown>;
    version: string;
    _initialized?: boolean;
    container: Element;
    component(name: string, options?: ComponentDefinition): ComponentDefinition;
    getComponents(element?: Element | null): Record<string, ComponentInternalInstance>;
    getComponent(element: Element, name: string): ComponentInternalInstance | undefined;
    update(element?: NodeInput, event?: string | Event): void;
    use(plugin: DrakePlugin): DrakeStatic;
    mixin(mixin: ComponentOptions, component?: string | ComponentConstructor): void;
}
