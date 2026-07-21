import { apply, hasAttr, inBrowser, startsWith, trigger } from 'drake-util';
import type { DrakeStatic } from '../types';
import { components, createComponent, getComponent, getComponents } from './component';
import { callConnected, callDisconnected } from './hooks';

export default function boot(App: DrakeStatic): void {
    if (!inBrowser || !window.MutationObserver) {
        return;
    }
    if (document.body) {
        requestAnimationFrame(() => initialize(App));
    } else {
        new MutationObserver((_records, observer) => {
            if (document.body) {
                initialize(App);
                observer.disconnect();
            }
        }).observe(document.documentElement, { childList: true });
    }
}

function initialize(App: DrakeStatic): void {
    trigger(document, 'drake:init', App);
    if (document.body) {
        apply(document.body, connect);
    }
    new MutationObserver(handleMutation).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
    });
    App._initialized = true;
}

function handleMutation(records: MutationRecord[]): void {
    for (const { addedNodes, removedNodes, target, attributeName } of records) {
        for (const node of addedNodes) {
            apply(node, connect);
        }
        for (const node of removedNodes) {
            apply(node, disconnect);
        }
        if (!(target instanceof Element) || !attributeName) {
            continue;
        }
        const name = getComponentName(attributeName);
        if (name) {
            if (hasAttr(target, attributeName)) {
                createComponent(name, target);
            } else {
                getComponent(target, name)?.$destroy();
            }
        }
    }
}

function connect(node: Element): void {
    for (const instance of Object.values(getComponents(node))) {
        callConnected(instance);
    }
    for (const attributeName of node.getAttributeNames()) {
        const name = getComponentName(attributeName);
        if (name) {
            createComponent(name, node);
        }
    }
}

function disconnect(node: Element): void {
    for (const instance of Object.values(getComponents(node))) {
        callDisconnected(instance);
    }
}

function getComponentName(attribute: string): string | undefined {
    const normalized = startsWith(attribute, 'data-') ? attribute.slice(5) : attribute;
    const component = components[normalized];
    return typeof component === 'function' ? component.options.name : component?.name;
}
