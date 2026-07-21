import { hasOwn, isEqual } from 'drake-util';
import type {
    ComponentInternalInstance,
    ComponentValueMap,
    ComponentWatch,
    WatchDefinition,
    WatchMap,
} from '../types';

export function initWatches(instance: ComponentInternalInstance): void {
    instance._watches = [];
    for (const watches of normalizeWatchMaps(instance.$options.watch)) {
        for (const [name, watch] of Object.entries(watches)) {
            registerWatch(instance, watch, name);
        }
    }
    instance._initial = true;
}

export function registerWatch(
    instance: ComponentInternalInstance,
    watch: WatchDefinition,
    name: string,
): void {
    const definition: ComponentWatch = typeof watch === 'function' ? { handler: watch } : watch;
    instance._watches.push({ name, ...definition });
}

export function runWatches(instance: ComponentInternalInstance, values: ComponentValueMap): void {
    for (const { name, handler, immediate = true } of instance._watches) {
        if (
            (instance._initial && immediate) ||
            (hasOwn(values, name) && !isEqual(values[name], instance[name]))
        ) {
            (
                handler as (
                    this: ComponentInternalInstance,
                    value: unknown,
                    previous: unknown,
                ) => unknown
            ).call(instance, instance[name], values[name]);
        }
    }
    instance._initial = false;
}

function normalizeWatchMaps(value: WatchMap | readonly WatchMap[] | undefined): WatchMap[] {
    return value ? (Array.isArray(value) ? [...value] : [value as WatchMap]) : [];
}
