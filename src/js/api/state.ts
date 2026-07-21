import { assign, isArray, isFunction, isPlainObject, isString } from 'drake-util';
import type {
    ComponentInitOptions,
    ComponentInternalInstance,
    ComponentOptions,
    ComponentValueMap,
    PropType,
} from '../types';
import { initComputed } from './computed';
import { callHook } from './hooks';
import { coerce, mergeOptions } from './options';

let uid = 0;

export function init(
    instance: ComponentInternalInstance,
    options: ComponentInitOptions = {},
): void {
    options.data = normalizeData(options, instance.constructor.options);
    instance.$options = mergeOptions(instance.constructor.options, options, instance);
    instance.$props = {};
    instance._uid = uid++;
    instance._connected = false;
    instance._disconnect = null;
    instance._updates = null;
    instance._data = null;
    instance._updateCount = 0;
    instance._queued = null;
    instance._watches = [];
    instance._initial = false;

    initData(instance);
    initMethods(instance);
    initComputed(instance);
    callHook(instance, 'created');

    if (options.el) {
        instance.$mount(options.el);
    }
}

function initData(instance: ComponentInternalInstance): void {
    const option = instance.$options.data;
    const data = isFunction(option)
        ? (
              option as (
                  this: ComponentInternalInstance,
                  value: ComponentInternalInstance,
              ) => unknown
          ).call(instance, instance)
        : option;
    if (!isPlainObject(data)) {
        return;
    }
    for (const key in data) {
        instance.$props[key] = data[key];
        instance[key] = data[key];
    }
}

function initMethods(instance: ComponentInternalInstance): void {
    for (const [key, method] of Object.entries(instance.$options.methods ?? {})) {
        instance[key] = (method as (...args: unknown[]) => unknown).bind(instance);
    }
}

function normalizeData(
    { data: source = {} }: ComponentInitOptions,
    componentOptions: ComponentOptions,
): ComponentValueMap {
    const args = normalizeArgs(componentOptions.args);
    const props = normalizeProps(componentOptions.props);
    let data: ComponentValueMap;

    if (isArray(source)) {
        data = source.slice(0, args.length).reduce<ComponentValueMap>((result, value, index) => {
            if (isPlainObject(value)) {
                assign(result, value);
            } else {
                const key = args[index];
                if (key) {
                    result[key] = value;
                }
            }
            return result;
        }, {});
    } else {
        data = isPlainObject(source) ? { ...source } : {};
    }

    for (const key of Object.keys(data)) {
        if (data[key] === undefined) {
            delete data[key];
        } else if (props[key]) {
            data[key] = coerce(props[key], data[key]);
        }
    }
    return data;
}

function normalizeArgs(args: ComponentOptions['args']): string[] {
    return typeof args === 'boolean' || !args ? [] : isString(args) ? [args] : [...args];
}

function normalizeProps(props: ComponentOptions['props']): Record<string, PropType> {
    if (!props) {
        return {};
    }
    return Array.isArray(props)
        ? Object.fromEntries(props.filter(isString).map((key) => [key, String]))
        : { ...(props as Record<string, PropType>) };
}
