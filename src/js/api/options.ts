import {
    isArray,
    isFunction,
    isNumeric,
    isObject,
    isString,
    startsWith,
    toBoolean,
    toNumber,
} from 'drake-util';
import type {
    ComponentConstructor,
    ComponentEventDefinition,
    ComponentEventMap,
    ComponentHookOption,
    ComponentInternalInstance,
    ComponentObservable,
    ComponentOptions,
    ComponentUpdate,
    ComponentValueMap,
    ComputedDefinition,
    EventTargetInput,
    FrameworkEvent,
    GenericFunction,
    PropType,
    PropsDefinition,
} from '../types';

type Strategy = (parent: unknown, child: unknown, instance?: ComponentInternalInstance) => unknown;

const strategies: Record<string, Strategy> = {};
for (const key of [
    'events',
    'watch',
    'observe',
    'created',
    'beforeConnect',
    'connected',
    'beforeDisconnect',
    'disconnected',
    'destroy',
]) {
    strategies[key] = concatStrategy;
}

strategies.args = (parent, child) => child !== false && concatStrategy(child || parent, undefined);
strategies.update = (parent, child) =>
    concatStrategy(parent, isFunction(child) ? { read: child } : child);
strategies.props = (parent, child) => {
    const normalized = isArray(child)
        ? Object.fromEntries(child.filter(isString).map((key) => [key, String]))
        : child;
    return mergeRecordStrategy(parent, normalized);
};
strategies.computed = mergeRecordStrategy;
strategies.methods = mergeRecordStrategy;
strategies.i18n = dataStrategy;
strategies.data = dataStrategy;

function dataStrategy(
    parent: unknown,
    child: unknown,
    instance?: ComponentInternalInstance,
): unknown {
    if (!instance) {
        if (!child) {
            return parent;
        }
        if (!parent) {
            return child;
        }
        return function (this: ComponentInternalInstance, current: ComponentInternalInstance) {
            return mergeFunctionData(parent, child, current);
        };
    }
    return mergeFunctionData(parent, child, instance);
}

function mergeFunctionData(
    parent: unknown,
    child: unknown,
    instance: ComponentInternalInstance,
): ComponentValueMap | undefined {
    return mergeRecords(
        isFunction(parent) ? parent.call(instance, instance) : parent,
        isFunction(child) ? child.call(instance, instance) : child,
    );
}

function concatStrategy(parent: unknown, child: unknown): unknown[] | undefined {
    const parentValues = parent === undefined ? undefined : isArray(parent) ? parent : [parent];
    if (child === undefined) {
        return parentValues;
    }
    const childValues = isArray(child) ? child : [child];
    return parentValues ? [...parentValues, ...childValues] : childValues;
}

function mergeRecordStrategy(parent: unknown, child: unknown): ComponentValueMap | undefined {
    return mergeRecords(parent, child);
}

function mergeRecords(parent: unknown, child: unknown): ComponentValueMap | undefined {
    if (!isObject(child)) {
        return isObject(parent) ? { ...parent } : undefined;
    }
    return isObject(parent) ? { ...parent, ...child } : { ...child };
}

function defaultStrategy(parent: unknown, child: unknown): unknown {
    return child === undefined ? parent : child;
}

export function mergeOptions(
    parent: ComponentOptions = {},
    child: ComponentOptions | ComponentConstructor = {},
    instance?: ComponentInternalInstance,
): ComponentOptions {
    const source = isComponentConstructor(child) ? child.options : child;
    let base = parent;

    if (source.extends && isObject(source.extends)) {
        base = mergeOptions(base, source.extends as ComponentOptions, instance);
    }
    const mixins = toArray(source.mixins);
    for (const mixin of mixins) {
        if (isObject(mixin)) {
            base = mergeOptions(base, mixin as ComponentOptions, instance);
        }
    }

    const options: ComponentOptions = {};
    for (const key of new Set([...Object.keys(base), ...Object.keys(source)])) {
        options[key] = (strategies[key] ?? defaultStrategy)(base[key], source[key], instance);
    }
    return options;
}

function isComponentConstructor(
    value: ComponentOptions | ComponentConstructor,
): value is ComponentConstructor {
    return typeof value === 'function' && 'options' in value;
}

function toArray<T>(value: T | readonly T[] | undefined): readonly T[] {
    if (value === undefined) {
        return [];
    }
    return isArray(value) ? (value as T[]) : [value as T];
}

export function parseOptions(value: unknown, args: readonly string[] = []): ComponentValueMap {
    if (!isString(value) || !value) {
        return {};
    }
    try {
        if (startsWith(value, '{')) {
            const parsed: unknown = JSON.parse(value);
            return isObject(parsed) ? { ...parsed } : {};
        }
        if (args.length && !value.includes(':')) {
            const first = args[0];
            return first ? { [first]: value } : {};
        }
        return value.split(';').reduce<ComponentValueMap>((options, option) => {
            const [rawKey, rawValue] = option.split(/:(.*)/);
            const key = rawKey?.trim();
            if (key && rawValue !== undefined) {
                options[key] = rawValue.trim();
            }
            return options;
        }, {});
    } catch {
        return {};
    }
}

export function coerce(type: PropType | undefined, value: unknown): unknown {
    if (type === Boolean) {
        return toBoolean(value);
    }
    if (type === Number) {
        return toNumber(value);
    }
    if (type === 'list') {
        return toList(value);
    }
    if (type === Object && isString(value)) {
        return parseOptions(value);
    }
    return typeof type === 'function' ? type(value) : value;
}

const listRe = /,(?![^(]*\))/;
function toList(value: unknown): unknown[] {
    if (isArray(value)) {
        return value;
    }
    return isString(value)
        ? value
              .split(listRe)
              .map((item) => (isNumeric(item) ? toNumber(item) : toBoolean(item.trim())))
        : [value];
}

type DataResult<D> = D extends (...args: never[]) => infer R ? R : D;
type ComputedResult<T> = T extends (...args: never[]) => infer R
    ? R
    : T extends { get?: (...args: never[]) => infer R }
      ? R
      : unknown;
type ComputedValues<C> = { [K in keyof C]-?: ComputedResult<C[K]> };
type PropValue<T> = T extends StringConstructor
    ? string
    : T extends NumberConstructor
      ? number
      : T extends BooleanConstructor
        ? boolean
        : T extends ObjectConstructor
          ? ComponentValueMap
          : unknown;
type PropValues<P> = P extends readonly string[]
    ? { [K in P[number]]: unknown }
    : P extends Record<string, PropType>
      ? { [K in keyof P]: PropValue<P[K]> }
      : ComponentValueMap;

type DefinedMethods<M> = { [K in keyof M]-?: NonNullable<M[K]> };

export type DefinedComponentInstance<
    D,
    M,
    C,
    P,
    Extra extends object = object,
> = ComponentInternalInstance &
    DataResult<D> &
    DefinedMethods<M> &
    ComputedValues<C> &
    PropValues<P> &
    Extra;

type ContextualEventHandler<I> = {
    bivarianceHack(this: I, event: FrameworkEvent, ...detail: never[]): unknown;
}['bivarianceHack'];

type ContextualEventDefinition<I> = Omit<
    ComponentEventDefinition,
    'el' | 'handler' | 'delegate' | 'filter'
> & {
    el?: (this: I, instance: I) => EventTargetInput;
    handler: ContextualEventHandler<I>;
    delegate?: (this: I, instance: I) => string;
    filter?: (this: I, instance: I) => boolean;
} & ThisType<I>;

type ContextualEvent<I> = ContextualEventDefinition<I> | (ComponentEventMap & ThisType<I>);

type ContextualWatch<I> =
    | ((this: I, value: unknown, previous: unknown) => unknown)
    | ({
          handler(this: I, value: unknown, previous: unknown): unknown;
          immediate?: boolean;
      } & ThisType<I>);

type ContextualWatchMap<I> = Record<string, ContextualWatch<I>> & ThisType<I>;

type ExplicitWatch<I> =
    | GenericFunction
    | ({
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

export type ComponentOptionsFor<
    I,
    D,
    M extends Record<string, GenericFunction>,
    C extends Record<string, ComputedDefinition>,
    P extends PropsDefinition,
> = Omit<
    ComponentOptions,
    'data' | 'methods' | 'computed' | 'props' | 'events' | 'watch' | 'update' | 'observe'
> & {
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

export function defineComponent<I extends ComponentInternalInstance>(): (
    options: ExplicitComponentOptionsFor<I>,
) => ExplicitComponentOptionsFor<I>;
export function defineComponent<
    D extends ComponentValueMap | ((...args: never[]) => ComponentValueMap) = ComponentValueMap,
    M extends Record<string, GenericFunction> = Record<string, GenericFunction>,
    C extends Record<string, ComputedDefinition> = Record<string, ComputedDefinition>,
    P extends PropsDefinition = Record<string, PropType>,
    Extra extends object = object,
>(
    options: ComponentOptionsFor<DefinedComponentInstance<D, M, C, P, Extra>, D, M, C, P>,
): ComponentOptionsFor<DefinedComponentInstance<D, M, C, P, Extra>, D, M, C, P>;
export function defineComponent(options?: ComponentOptions): unknown {
    return options ?? ((component: ComponentOptions) => component);
}

type ContextualHook<I> = ((this: I) => unknown) | readonly ((this: I) => unknown)[];

/**
 * Explicit-instance variant for mixins whose public surface is composed with
 * other mixins at runtime. The curried form fixes the instance contract before
 * TypeScript contextually types nested option objects.
 */
export type ExplicitComponentOptionsFor<I extends ComponentInternalInstance> = Omit<
    ComponentOptions,
    | 'methods'
    | 'computed'
    | 'events'
    | 'watch'
    | 'update'
    | 'observe'
    | 'created'
    | 'beforeConnect'
    | 'connected'
    | 'beforeDisconnect'
    | 'disconnected'
    | 'destroy'
> & {
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

export function defineMixin<I extends ComponentInternalInstance>(): (
    options: ExplicitComponentOptionsFor<I>,
) => ExplicitComponentOptionsFor<I>;
export function defineMixin<
    D extends ComponentValueMap | ((...args: never[]) => ComponentValueMap) = ComponentValueMap,
    M extends Record<string, GenericFunction> = Record<string, GenericFunction>,
    C extends Record<string, ComputedDefinition> = Record<string, ComputedDefinition>,
    P extends PropsDefinition = Record<string, PropType>,
    Extra extends object = object,
>(
    options: ComponentOptionsFor<DefinedComponentInstance<D, M, C, P, Extra>, D, M, C, P>,
): ComponentOptionsFor<DefinedComponentInstance<D, M, C, P, Extra>, D, M, C, P>;
export function defineMixin(options?: ComponentOptions): unknown {
    return options ?? ((mixin: ComponentOptions) => mixin);
}
