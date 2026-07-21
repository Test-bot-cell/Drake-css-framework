import { remove } from 'uikit-util';
import type { ComponentInternalInstance, UIkitStatic } from '../types';
import { attachToElement, createComponent, detachFromElement, getComponent } from './component';
import { update } from './global';
import { callConnected, callDisconnected, callHook } from './hooks';
import { callUpdate } from './update';

export default function instanceApi(App: UIkitStatic): void {
    App.prototype.$mount = function (element: Element): void {
        attachToElement(element, this);
        this.$options.el = element;
        if (element.isConnected) {
            callConnected(this);
        }
    };

    App.prototype.$destroy = function (removeElement = false): void {
        const element = this.$options.el;
        if (element) {
            callDisconnected(this);
        }
        callHook(this, 'destroy');
        if (element) {
            detachFromElement(element, this);
            if (removeElement) {
                remove(element);
            }
        }
    };

    App.prototype.$create = createComponent;
    App.prototype.$emit = function (event: string | Event): void {
        callUpdate(this, event);
    };
    App.prototype.$update = function (
        this: ComponentInternalInstance,
        element = this.$el,
        event?: string | Event,
    ): void {
        update(element, event);
    };
    App.prototype.$reset = function (): void {
        callDisconnected(this);
        callConnected(this);
    };
    App.prototype.$getComponent = getComponent;

    Object.defineProperties(App.prototype, {
        $el: {
            get(this: ComponentInternalInstance): Element | undefined {
                return this.$options.el;
            },
        },
        $container: {
            get(): Element {
                return App.container;
            },
        },
    });
}

let id = 1;
export function generateId(instance: ComponentInternalInstance, element?: Element | null): string {
    return element?.id || `${instance.$options.id ?? 'uk'}-${id++}`;
}
