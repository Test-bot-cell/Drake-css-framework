import {
    assign,
    camelize,
    data as getData,
    hasOwn,
    hyphenate,
    isString,
    memoize,
    startsWith,
} from 'uikit-util';
import type {
    ComponentInternalInstance,
    ComponentOptions,
    ComponentValueMap,
    PropType,
} from '../types';
import { coerce, parseOptions } from './options';

export function initProps(instance: ComponentInternalInstance): void {
    const props = getProps(instance.$options);
    assign(instance.$props, props);
    const { computed, methods } = instance.$options;
    for (const key of Object.keys(instance.$props)) {
        if (
            key in props &&
            (!computed || !hasOwn(computed, key)) &&
            (!methods || !hasOwn(methods, key))
        ) {
            instance[key] = instance.$props[key];
        }
    }
}

function getProps(options: ComponentOptions): ComponentValueMap {
    const data: ComponentValueMap = {};
    const props = normalizeProps(options.props);
    const element = options.el;
    if (!element) {
        return data;
    }

    for (const key of Object.keys(props)) {
        const property = hyphenate(key);
        const rawValue = getData(element, property);
        if (rawValue === undefined) {
            continue;
        }
        const value =
            props[key] === Boolean && rawValue === '' ? true : coerce(props[key], rawValue);
        if (property === 'target' && startsWith(value, '_')) {
            continue;
        }
        data[key] = value;
    }

    const parsed = parseOptions(getData(element, options.id ?? ''), normalizeArgs(options.args));
    for (const [key, value] of Object.entries(parsed)) {
        const property = camelize(key);
        if (props[property] !== undefined) {
            data[property] = coerce(props[property], value);
        }
    }
    return data;
}

interface AttributeMetadata {
    attributes: string[];
    filter: string[];
}

const getAttributes = memoize((id: string, props: Record<string, PropType>): AttributeMetadata => {
    const attributes = Object.keys(props);
    const filter = attributes
        .concat(id)
        .filter(Boolean)
        .flatMap((key) => [hyphenate(key), `data-${hyphenate(key)}`]);
    return { attributes, filter };
});

export function initPropsObserver(instance: ComponentInternalInstance): void {
    const { $options, $props } = instance;
    const props = normalizeProps($options.props);
    const element = $options.el;
    if (!element || !Object.keys(props).length) {
        return;
    }
    const id = $options.id ?? '';
    const { attributes, filter } = getAttributes(id, props);
    const observer = new MutationObserver((records) => {
        const data = getProps($options);
        const changed = records.some(({ attributeName }) => {
            if (!attributeName) {
                return false;
            }
            const property = attributeName.replace('data-', '');
            const keys =
                property === id ? attributes : [camelize(property), camelize(attributeName)];
            return keys.some((key) => data[key] !== undefined && data[key] !== $props[key]);
        });
        if (changed) {
            instance.$reset();
        }
    });
    observer.observe(element, { attributes: true, attributeFilter: filter });
    instance._disconnect?.push(() => observer.disconnect());
}

function normalizeProps(props: ComponentOptions['props']): Record<string, PropType> {
    if (!props) {
        return {};
    }
    return Array.isArray(props)
        ? Object.fromEntries(props.filter(isString).map((key) => [key, String]))
        : { ...(props as Record<string, PropType>) };
}

function normalizeArgs(args: ComponentOptions['args']): string[] {
    return typeof args === 'boolean' || !args ? [] : isString(args) ? [args] : [...args];
}
