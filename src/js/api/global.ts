import { $, apply, isString, parents, toNode } from 'drake-util';
import type {
    ComponentConstructor,
    ComponentInitOptions,
    ComponentInternalInstance,
    ComponentOptions,
    DrakePlugin,
    DrakeStatic,
    NodeInput,
} from '../types';
import { component, getComponent, getComponents } from './component';
import { mergeOptions } from './options';
import { init } from './state';
import { callUpdate } from './update';

export default function globalApi(App: DrakeStatic): void {
    App.component = component;
    App.getComponents = getComponents;
    App.getComponent = getComponent;
    App.update = update;

    App.use = function (plugin: DrakePlugin): DrakeStatic {
        if (!plugin.installed) {
            plugin.call(null, this);
            plugin.installed = true;
        }
        return this;
    };

    App.mixin = function (mixin: ComponentOptions, target?: string | ComponentConstructor): void {
        const Component = (isString(target) ? this.component(target) : target) ?? this;
        if (isComponentConstructor(Component)) {
            Component.options = mergeOptions(Component.options, mixin);
        }
    };

    App.extend = function (
        this: ComponentConstructor,
        options: ComponentOptions = {},
    ): ComponentConstructor {
        return extendComponent(this, options);
    };

    let container: Element | undefined;
    Object.defineProperty(App, 'container', {
        get: () => container ?? document.body,
        set: (element: unknown) => {
            container = $(
                element instanceof Element || typeof element === 'string' ? element : document.body,
            );
        },
    });
}

function extendComponent(
    Super: ComponentConstructor,
    options: ComponentOptions,
): ComponentConstructor {
    const Sub = function (
        this: ComponentInternalInstance,
        componentOptions: ComponentInitOptions = {},
    ): void {
        init(this, componentOptions);
    } as ComponentConstructor;
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.options = mergeOptions(Super.options, options);
    Sub.super = Super;
    Sub.extend = Super.extend;
    return Sub;
}

export function update(element?: NodeInput, event?: string | Event): void {
    const node = toNode(element) ?? document.body;
    if (!(node instanceof Element)) {
        return;
    }
    for (const parentElement of parents(node).reverse()) {
        updateElement(parentElement, event);
    }
    apply(node, (current) => updateElement(current, event));
}

function updateElement(element: Element, event?: string | Event): void {
    for (const instance of Object.values(getComponents(element))) {
        callUpdate(instance, event);
    }
}

function isComponentConstructor(value: unknown): value is ComponentConstructor {
    return typeof value === 'function' && 'options' in value;
}
