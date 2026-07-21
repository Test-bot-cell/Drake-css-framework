import type { ComponentConstructor, ComponentEventDefinition, ComponentEventMap, ComponentHookOption, ComponentInternalInstance, ComponentObservable, ComponentOptions, ComponentUpdate, ComponentValueMap, ComputedDefinition, EventTargetInput, FrameworkEvent, GenericFunction, PropType, PropsDefinition } from '../types';
export declare function mergeOptions(parent?: ComponentOptions, child?: ComponentOptions | ComponentConstructor, instance?: ComponentInternalInstance): ComponentOptions;
export declare function parseOptions(value: unknown, args?: readonly string[]): ComponentValueMap;
export declare function coerce(type: PropType | undefined, value: unknown): unknown;
type DataResult<D> = D extends (...args: never[]) => infer R ? R : D;
type ComputedResult<T> = T extends (...args: never[]) => infer R ? R : T extends {
    get?: (...args: never[]) => infer R;
} ? R : unknown;
type ComputedValues<C> = {
    [K in keyof C]-?: ComputedResult<C[K]>;
};
type PropValue<T> = T extends StringConstructor ? string : T extends NumberConstructor ? number : T extends BooleanConstructor ? boolean : T extends ObjectConstructor ? ComponentValueMap : unknown;
type PropValues<P> = P extends readonly string[] ? {
    [K in P[number]]: unknown;
} : P extends Record<string, PropType> ? {
    [K in keyof P]: PropValue<P[K]>;
} : ComponentValueMap;
type DefinedMethods<M> = {
    [K in keyof M]-?: NonNullable<M[K]>;
};
export type DefinedComponentInstance<D, M, C, P, Extra extends object = object> = ComponentInternalInstance & DataResult<D> & DefinedMethods<M> & ComputedValues<C> & PropValues<P> & Extra;
type ContextualEventHandler<I> = {
    bivarianceHack(this: I, event: FrameworkEvent, ...detail: never[]): unknown;
}['bivarianceHack'];
type ContextualEventDefinition<I> = Omit<ComponentEventDefinition, 'el' | 'handler' | 'delegate' | 'filter'> & {
    el?: (this: I, instance: I) => EventTargetInput;
    handler: ContextualEventHandler<I>;
    delegate?: (this: I, instance: I) => string;
    filter?: (this: I, instance: I) => boolean;
} & ThisType<I>;
type ContextualEvent<I> = ContextualEventDefinition<I> | (ComponentEventMap & ThisType<I>);
type ContextualWatch<I> = ((this: I, value: unknown, previous: unknown) => unknown) | ({
    handler(this: I, value: unknown, previous: unknown): unknown;
    immediate?: boolean;
} & ThisType<I>);
type ContextualWatchMap<I> = Record<string, ContextualWatch<I>> & ThisType<I>;
type ExplicitWatch<I> = GenericFunction | ({
    handler: GenericFunction;
    immediate?: boolean;
} & ThisType<I>);
type ExplicitWatchMap<I> = Record<string, ExplicitWatch<I>> & ThisType<I>;
type ContextualUpdate<I> = Omit<ComponentUpdate, 'read' | 'write'> & {
    read?(this: I, data: ComponentValueMap, events: ReadonlySet<string>): unknown;
    write?(this: I, data: ComponentValueMap, events: ReadonlySet<string>): unknown;
} & ThisType<I>;
type ExplicitComponentUpdate<I> = Omit<ComponentUpdate, 'read' | 'write'> & {
    read?: GenericFunction;
    write?: GenericFunction;
} & ThisType<I>;
type ContextualObservable<I> = ComponentObservable & ThisType<I>;
export type ComponentOptionsFor<I, D, M extends Record<string, GenericFunction>, C extends Record<string, ComputedDefinition>, P extends PropsDefinition> = Omit<ComponentOptions, 'data' | 'methods' | 'computed' | 'props' | 'events' | 'watch' | 'update' | 'observe'> & {
    data?: D;
    methods?: M & ThisType<I>;
    computed?: C & ThisType<I>;
    props?: P;
    events?: ContextualEvent<I> | readonly ContextualEvent<I>[];
    watch?: ContextualWatchMap<I> | readonly ContextualWatchMap<I>[];
    update?: ContextualUpdate<I> | readonly ContextualUpdate<I>[] | ContextualUpdate<I>['read'];
    observe?: ContextualObservable<I> | readonly ContextualObservable<I>[];
    created?: ComponentHookOption;
    beforeConnect?: ComponentHookOption;
    connected?: ComponentHookOption;
    beforeDisconnect?: ComponentHookOption;
    disconnected?: ComponentHookOption;
    destroy?: ComponentHookOption;
} & ThisType<I>;
export declare function defineComponent<I extends ComponentInternalInstance>(): (options: ExplicitComponentOptionsFor<I>) => ExplicitComponentOptionsFor<I>;
export declare function defineComponent<D extends ComponentValueMap | ((...args: never[]) => ComponentValueMap) = ComponentValueMap, M extends Record<string, GenericFunction> = Record<string, GenericFunction>, C extends Record<string, ComputedDefinition> = Record<string, ComputedDefinition>, P extends PropsDefinition = Record<string, PropType>, Extra extends object = object>(options: ComponentOptionsFor<DefinedComponentInstance<D, M, C, P, Extra>, D, M, C, P>): ComponentOptionsFor<DefinedComponentInstance<D, M, C, P, Extra>, D, M, C, P>;
type ContextualHook<I> = ((this: I) => unknown) | readonly ((this: I) => unknown)[];
/**
 * Explicit-instance variant for mixins whose public surface is composed with
 * other mixins at runtime. The curried form fixes the instance contract before
 * TypeScript contextually types nested option objects.
 */
export type ExplicitComponentOptionsFor<I extends ComponentInternalInstance> = Omit<ComponentOptions, 'methods' | 'computed' | 'events' | 'watch' | 'update' | 'observe' | 'created' | 'beforeConnect' | 'connected' | 'beforeDisconnect' | 'disconnected' | 'destroy'> & {
    methods?: Record<string, GenericFunction> & ThisType<I>;
    computed?: Record<string, ComputedDefinition> & ThisType<I>;
    events?: ContextualEventDefinition<I> | readonly ContextualEventDefinition<I>[];
    watch?: ExplicitWatchMap<I> | readonly ExplicitWatchMap<I>[];
    update?: ExplicitComponentUpdate<I> | readonly ExplicitComponentUpdate<I>[] | GenericFunction;
    observe?: ContextualObservable<I> | readonly ContextualObservable<I>[];
    created?: ContextualHook<I>;
    beforeConnect?: ContextualHook<I>;
    connected?: ContextualHook<I>;
    beforeDisconnect?: ContextualHook<I>;
    disconnected?: ContextualHook<I>;
    destroy?: ContextualHook<I>;
} & ThisType<I>;
export declare function defineMixin<I extends ComponentInternalInstance>(): (options: ExplicitComponentOptionsFor<I>) => ExplicitComponentOptionsFor<I>;
export declare function defineMixin<D extends ComponentValueMap | ((...args: never[]) => ComponentValueMap) = ComponentValueMap, M extends Record<string, GenericFunction> = Record<string, GenericFunction>, C extends Record<string, ComputedDefinition> = Record<string, ComputedDefinition>, P extends PropsDefinition = Record<string, PropType>, Extra extends object = object>(options: ComponentOptionsFor<DefinedComponentInstance<D, M, C, P, Extra>, D, M, C, P>): ComponentOptionsFor<DefinedComponentInstance<D, M, C, P, Extra>, D, M, C, P>;
export {};
