import { hasOwn, on } from 'drake-util';
import type {
    ComponentEventDefinition,
    ComponentEventMap,
    ComponentInternalInstance,
    EventTargetInput,
    FrameworkEvent,
} from '../types';

export function initEvents(instance: ComponentInternalInstance): void {
    for (const event of normalizeEvents(instance.$options.events)) {
        if (hasOwn(event, 'handler')) {
            registerEvent(instance, event as ComponentEventDefinition);
        } else {
            for (const [name, handler] of Object.entries(event)) {
                registerEvent(instance, { name, handler });
            }
        }
    }
}

function registerEvent(
    instance: ComponentInternalInstance,
    definition: ComponentEventDefinition,
): void {
    const { name, el, handler, capture, passive, delegate, filter, self } = definition;
    const runtimeFilter = filter as
        | ((this: ComponentInternalInstance, value: ComponentInternalInstance) => unknown)
        | undefined;
    if (runtimeFilter && !runtimeFilter.call(instance, instance)) {
        return;
    }
    const runtimeElement = el as
        | ((this: ComponentInternalInstance, value: ComponentInternalInstance) => unknown)
        | undefined;
    const runtimeDelegate = delegate as
        | ((this: ComponentInternalInstance, value: ComponentInternalInstance) => unknown)
        | undefined;
    const target = (
        runtimeElement ? runtimeElement.call(instance, instance) : instance.$el
    ) as EventTargetInput;
    const delegateValue = runtimeDelegate?.call(instance, instance);
    const selector = typeof delegateValue === 'string' ? delegateValue : false;
    const runtimeHandler = handler as (
        this: ComponentInternalInstance,
        event: FrameworkEvent,
        ...detail: unknown[]
    ) => unknown;
    const listener = (event: FrameworkEvent, ...detail: unknown[]) =>
        runtimeHandler.call(instance, event, ...detail);
    instance._disconnect?.push(on(target, name, selector, listener, { passive, capture, self }));
}

function normalizeEvents(
    value:
        | ComponentEventDefinition
        | ComponentEventMap
        | readonly (ComponentEventDefinition | ComponentEventMap)[]
        | undefined,
): (ComponentEventDefinition | ComponentEventMap)[] {
    return value
        ? Array.isArray(value)
            ? [...value]
            : [value as ComponentEventDefinition | ComponentEventMap]
        : [];
}
