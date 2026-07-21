import { hasOwn, includes, isFunction, isString, toNodes } from 'drake-util';
import type {
    ComponentInternalInstance,
    ComponentObservable,
    GenericFunction,
    NodeInput,
    ObservableHandle,
} from '../types';
import { registerComputed } from './computed';
import { registerWatch } from './watch';

type ObserveFunction = (
    targets: NodeInput,
    handler: GenericFunction,
    options?: unknown,
    args?: unknown,
) => ObservableHandle;

export function initObservers(instance: ComponentInternalInstance): void {
    for (const observable of normalizeObservables(instance.$options.observe)) {
        registerObservable(instance, observable);
    }
}

function registerObservable(
    instance: ComponentInternalInstance,
    observable: ComponentObservable,
): void {
    const { observe, target = instance.$el, filter, args } = observable;
    const runtimeFilter = filter as
        | ((this: ComponentInternalInstance, value: ComponentInternalInstance) => unknown)
        | undefined;
    if (runtimeFilter && !runtimeFilter.call(instance, instance)) {
        return;
    }

    const disconnect = instance._disconnect;
    if (!disconnect) {
        return;
    }
    const key = `_observe${disconnect.length}`;
    if (isFunction(target) && !hasOwn(instance, key)) {
        registerComputed(instance, key, () => {
            const targets = target.call(instance, instance);
            return toNodeInput(targets);
        });
    }

    const handlerValue = isString(observable.handler)
        ? instance[observable.handler]
        : observable.handler;
    if (!isFunction(handlerValue)) {
        return;
    }
    const handler = handlerValue.bind(instance) as GenericFunction;
    const options = isFunction(observable.options)
        ? observable.options.call(instance, instance)
        : observable.options;
    const targets = hasOwn(instance, key) ? toNodeInput(instance[key]) : toNodeInput(target);
    const observer = (observe as ObserveFunction)(targets, handler, options, args);

    if (isFunction(target) && Array.isArray(instance[key])) {
        registerWatch(
            instance,
            { handler: updateTargets(observer, options), immediate: false },
            key,
        );
    }
    disconnect.push(() => observer.disconnect());
}

function updateTargets(
    observer: ObservableHandle,
    options: unknown,
): (targets: unknown, previous: unknown) => void {
    return (targets, previous) => {
        const currentNodes = toNodes(toNodeInput(targets));
        const previousNodes = toNodes(toNodeInput(previous));
        for (const target of previousNodes) {
            if (!includes(currentNodes, target)) {
                if (observer.unobserve) {
                    observer.unobserve(target);
                } else if (observer.observe) {
                    observer.disconnect();
                }
            }
        }
        for (const target of currentNodes) {
            if (!includes(previousNodes, target) || !observer.unobserve) {
                observer.observe?.(target, options);
            }
        }
    };
}

function normalizeObservables(
    value: ComponentObservable | readonly ComponentObservable[] | undefined,
): ComponentObservable[] {
    return value ? (Array.isArray(value) ? [...value] : [value as ComponentObservable]) : [];
}

function toNodeInput(value: unknown): NodeInput {
    if (value instanceof Node) {
        return value;
    }
    if (value && typeof value === 'object' && (Symbol.iterator in value || 'length' in value)) {
        return toNodes(value);
    }
    return undefined;
}
