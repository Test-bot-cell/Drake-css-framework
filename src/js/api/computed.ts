import { hasOwn, isString, observeMutation } from 'drake-util';
import type { ComponentInternalInstance, ComponentValueMap, ComputedDefinition } from '../types';
import { callUpdate, prependUpdate } from './update';
import { runWatches } from './watch';

export function initComputed(instance: ComponentInternalInstance): void {
    instance._computed = {};
    for (const [key, definition] of Object.entries(instance.$options.computed ?? {})) {
        registerComputed(instance, key, definition);
    }
}

const mutationOptions: MutationObserverInit = { subtree: true, childList: true };

export function registerComputed(
    instance: ComponentInternalInstance,
    key: string,
    definition: ComputedDefinition,
): void {
    instance._hasComputed = true;
    Object.defineProperty(instance, key, {
        enumerable: true,
        get() {
            const { _computed, $props, $el } = instance;
            if (!hasOwn(_computed, key)) {
                _computed[key] = getComputedValue(definition, instance, $props, $el);
                const observerDefinition =
                    typeof definition === 'function' ? undefined : definition.observe;
                if (observerDefinition && instance._computedObserver) {
                    const runtimeObserve = observerDefinition as (
                        this: ComponentInternalInstance,
                        props: ComponentValueMap,
                    ) => unknown;
                    const selector = runtimeObserve.call(instance, $props);
                    if (isString(selector) && selector) {
                        const root = ['~', '+', '-'].includes(selector[0] ?? '')
                            ? $el.parentElement
                            : $el.getRootNode();
                        if (root) {
                            instance._computedObserver.observe(root, mutationOptions);
                        }
                    }
                }
            }
            return _computed[key];
        },
        set(value: unknown) {
            const objectDefinition = typeof definition === 'function' ? undefined : definition;
            instance._computed[key] = objectDefinition?.set
                ? (
                      objectDefinition.set as (
                          this: ComponentInternalInstance,
                          value: unknown,
                      ) => unknown
                  ).call(instance, value)
                : value;
            if (instance._computed[key] === undefined) {
                delete instance._computed[key];
            }
        },
    });
}

function getComputedValue(
    definition: ComputedDefinition,
    instance: ComponentInternalInstance,
    props: ComponentValueMap,
    element: Element,
): unknown {
    if (typeof definition === 'function') {
        const runtimeDefinition = definition as (
            this: ComponentInternalInstance,
            props: ComponentValueMap,
            element: Element,
        ) => unknown;
        return runtimeDefinition.call(instance, props, element);
    }
    const getter = definition.get as
        | ((this: ComponentInternalInstance, props: ComponentValueMap, element: Element) => unknown)
        | undefined;
    return getter?.call(instance, props, element);
}

export function initComputedUpdates(instance: ComponentInternalInstance): void {
    if (!instance._hasComputed) {
        return;
    }
    prependUpdate(instance, {
        read: () => runWatches(instance, resetComputed(instance)),
        events: ['resize', 'computed'],
    });
    instance._computedObserver = observeMutation(
        instance.$el,
        () => callUpdate(instance, 'computed'),
        mutationOptions,
    );
    instance._disconnect?.push(() => {
        instance._computedObserver?.disconnect();
        instance._computedObserver = null;
        resetComputed(instance);
    });
}

function resetComputed(instance: ComponentInternalInstance): ComponentValueMap {
    const values = { ...instance._computed };
    instance._computed = {};
    return values;
}
