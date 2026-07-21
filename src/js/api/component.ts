import { $$, camelize, hyphenate, isEmpty, isPlainObject } from 'uikit-util';
import type {
    ComponentConstructor,
    ComponentDefinition,
    ComponentInitOptions,
    ComponentInternalInstance,
    ComponentOptions,
    ComponentRegistry,
    MountedElement,
} from '../types';
import App from './app';

const PREFIX = 'uk-';
export const components: ComponentRegistry = {};

export function component(name: string): ComponentConstructor;
export function component(name: string, options: ComponentDefinition): ComponentDefinition;
export function component(name: string, options?: ComponentDefinition): ComponentDefinition {
    const id = PREFIX + hyphenate(name);
    if (!options) {
        const current = components[id];
        if (!current) {
            throw new Error(`Component not registered: ${name}`);
        }
        if (!isComponentConstructor(current)) {
            components[id] = App.extend(current);
        }
        return components[id] as ComponentConstructor;
    }

    const normalizedName = camelize(name);
    App[normalizedName] = (element: unknown, data: unknown) =>
        createComponent(normalizedName, element, data);

    const option = isComponentConstructor(options) ? options.options : { ...options };
    option.id = id;
    option.name = normalizedName;
    const install = option.install as
        ((app: typeof App, options: ComponentOptions, name: string) => unknown) | undefined;
    install?.(App, option, normalizedName);

    if (App._initialized && !option.functional) {
        requestAnimationFrame(() => {
            createComponent(normalizedName, `[${id}],[data-${id}]`);
        });
    }
    components[id] = option;
    return option;
}

export function createComponent(
    name: string,
    element?: unknown,
    data?: unknown,
    ...args: unknown[]
): ComponentInternalInstance | undefined {
    const Component = component(name);
    if (Component.options.functional) {
        const componentData = isPlainObject(element) ? element : [element, data, ...args];
        return new Component({ data: componentData } as ComponentInitOptions);
    }

    if (!element) {
        return new Component();
    }
    const elements = selectElements(element);
    return elements.map((item) => initialize(Component, name, item, data))[0];
}

function initialize(
    Component: ComponentConstructor,
    name: string,
    element: Element,
    data: unknown,
): ComponentInternalInstance {
    const instance = getComponent(element, name);
    if (instance) {
        if (data) {
            instance.$destroy();
        } else {
            return instance;
        }
    }
    const componentData = isPlainObject(data) ? data : {};
    return new Component({ el: element, data: componentData });
}

function selectElements(value: unknown): Element[] {
    if (typeof value === 'string') {
        return $$(value);
    }
    if (value instanceof Element) {
        return [value];
    }
    if (value && typeof value === 'object' && (Symbol.iterator in value || 'length' in value)) {
        return Array.from(value as ArrayLike<unknown> | Iterable<unknown>).filter(
            (item): item is Element => item instanceof Element,
        );
    }
    return [];
}

export function getComponents(element?: Element | null): Record<string, ComponentInternalInstance> {
    return element ? ((element as MountedElement).__uikit__ ?? {}) : {};
}

export function getComponent(
    element: Element,
    name: string,
): ComponentInternalInstance | undefined {
    return getComponents(element)[name];
}

export function attachToElement(element: Element, instance: ComponentInternalInstance): void {
    const mounted = element as MountedElement;
    mounted.__uikit__ ??= {};
    const name = instance.$options.name;
    if (name) {
        mounted.__uikit__[name] = instance;
    }
}

export function detachFromElement(element: Element, instance: ComponentInternalInstance): void {
    const mounted = element as MountedElement;
    const name = instance.$options.name;
    if (name) {
        delete mounted.__uikit__?.[name];
    }
    if (isEmpty(mounted.__uikit__)) {
        delete mounted.__uikit__;
    }
}

function isComponentConstructor(value: ComponentDefinition): value is ComponentConstructor {
    return typeof value === 'function' && 'options' in value;
}
