import { assign, fastdom, isFunction, isPlainObject } from 'uikit-util';
import type { ComponentInternalInstance, ComponentUpdate, ComponentValueMap } from '../types';

export function initUpdates(instance: ComponentInternalInstance): void {
    instance._data = {};
    instance._updates = normalizeUpdates(instance.$options.update);
    instance._disconnect?.push(() => {
        instance._updates = null;
        instance._data = null;
    });
}

export function prependUpdate(instance: ComponentInternalInstance, update: ComponentUpdate): void {
    instance._updates?.unshift(update);
}

export function callUpdate(
    instance: ComponentInternalInstance,
    event: string | Event = 'update',
): void {
    const updates = instance._updates;
    if (!instance._connected || !updates?.length) {
        return;
    }

    if (!instance._updateCount) {
        instance._updateCount = 0;
        requestAnimationFrame(() => {
            instance._updateCount = 0;
        });
    }

    if (!instance._queued) {
        instance._queued = new Set<string>();
        fastdom.read(() => {
            const queued = instance._queued;
            const data = instance._data;
            if (instance._connected && queued && data) {
                runUpdates(instance, queued, updates, data);
            }
            instance._queued = null;
        });
    }

    if (instance._updateCount++ < 20) {
        instance._queued.add(typeof event === 'string' ? event : event.type);
    }
}

function runUpdates(
    instance: ComponentInternalInstance,
    types: ReadonlySet<string>,
    updates: readonly ComponentUpdate[],
    data: ComponentValueMap,
): void {
    for (const { read, write, events = [] } of updates) {
        if (!types.has('update') && !events.some((type) => types.has(type))) {
            continue;
        }

        const runtimeRead = read as
            | ((
                  this: ComponentInternalInstance,
                  data: ComponentValueMap,
                  events: ReadonlySet<string>,
              ) => unknown)
            | undefined;
        const result = runtimeRead?.call(instance, data, types);
        if (result && isPlainObject(result)) {
            assign(data, result);
        }
        if (write && result !== false) {
            fastdom.write(() => {
                if (instance._connected) {
                    (
                        write as (
                            this: ComponentInternalInstance,
                            data: ComponentValueMap,
                            events: ReadonlySet<string>,
                        ) => unknown
                    ).call(instance, data, types);
                }
            });
        }
    }
}

function normalizeUpdates(
    update: ComponentInternalInstance['$options']['update'],
): ComponentUpdate[] {
    if (!update) {
        return [];
    }
    if (isFunction(update)) {
        return [{ read: update }];
    }
    return Array.isArray(update) ? [...update] : [update as ComponentUpdate];
}
