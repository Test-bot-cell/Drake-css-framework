import type { ElementInput, NodeInput } from '../types';
import { once } from './event';
import { parent } from './filter';
import { isElement, isString, startsWith, toArray, toNode, toNodes } from './lang';
import { find, findAll, type QueryContext, type Selector } from './selector';

export function ready(callback: () => void): void {
    if (document.readyState !== 'loading') {
        callback();
        return;
    }
    once(document, 'DOMContentLoaded', callback);
}

export function isTag(element: unknown, ...tagNames: string[]): boolean {
    return (
        element instanceof Element &&
        tagNames.some((tagName) => element.tagName.toLowerCase() === tagName.toLowerCase())
    );
}

export function empty<T extends Element>(element: Selector): T | undefined {
    const node = $<T>(element);
    if (node) {
        node.innerHTML = '';
    }
    return node;
}

export function html(element: Selector): string | undefined;
export function html(element: Selector, value: string | NodeInput): Node | Node[] | undefined;
export function html(
    element: Selector,
    value?: string | NodeInput,
): string | Node | Node[] | undefined {
    const node = $(element);
    return value === undefined ? node?.innerHTML : append(empty(element), value);
}

type InsertMethod = 'prepend' | 'append' | 'before' | 'after';
type Insert = (reference: Selector, value: string | NodeInput) => Node | Node[] | undefined;

export const prepend: Insert = applyInsert('prepend');
export const append: Insert = applyInsert('append');
export const before: Insert = applyInsert('before');
export const after: Insert = applyInsert('after');

function applyInsert(method: InsertMethod): Insert {
    return (reference, value) => {
        const nodes = toNodes(isString(value) ? fragment(value) : value);
        const node = $(reference);
        if (node) {
            node[method](...nodes);
        }
        return unwrapSingle(nodes);
    };
}

export function remove(element: NodeInput): void {
    toNodes(element).forEach((node) => node.parentNode?.removeChild(node));
}

export function wrapAll(element: NodeInput, structure: string | NodeInput): Element | undefined {
    let wrapper = toNode(before(element as ElementInput, structure));
    while (wrapper instanceof Element && wrapper.firstElementChild) {
        wrapper = wrapper.firstElementChild;
    }
    if (wrapper instanceof Element) {
        append(wrapper, element);
        return wrapper;
    }
}

export function wrapInner(element: ElementInput, structure: string | NodeInput): Node[] {
    return toNodes(
        toNodes(element).map((node) =>
            node.hasChildNodes()
                ? wrapAll(toArray(node.childNodes), structure)
                : append(node, structure),
        ),
    );
}

export function unwrap(element: ElementInput): void {
    const uniqueParents = toNodes(element)
        .map((node) => parent(node))
        .filter((value): value is HTMLElement => Boolean(value))
        .filter((value, index, values) => values.indexOf(value) === index);
    uniqueParents.forEach((node) => node.replaceWith(...node.childNodes));
}

const singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

export function fragment(value: string): Node | Node[] | undefined {
    const matches = singleTagRe.exec(value);
    if (matches?.[1]) {
        return document.createElement(matches[1]);
    }
    const container = document.createElement('template');
    container.innerHTML = value.trim();
    return unwrapSingle(toArray(container.content.childNodes));
}

function unwrapSingle<T extends Node>(nodes: readonly T[]): T | T[] | undefined {
    return nodes.length > 1 ? [...nodes] : nodes[0];
}

export function apply(node: unknown, callback: (element: Element) => void): void {
    if (!isElement(node)) {
        return;
    }
    callback(node);
    for (const child of toArray(node.children)) {
        apply(child, callback);
    }
}

export function $<T extends Element = HTMLElement>(
    selector: Selector,
    context?: QueryContext,
): T | undefined {
    return isHtml(selector)
        ? (toNode(fragment(selector)) as T | undefined)
        : find<T>(selector, context);
}

export function $$<T extends Element = HTMLElement>(
    selector: Selector,
    context?: QueryContext,
): T[] {
    return isHtml(selector) ? (toNodes(fragment(selector)) as T[]) : findAll<T>(selector, context);
}

function isHtml(value: Selector): value is string {
    return isString(value) && startsWith(value.trim(), '<');
}
