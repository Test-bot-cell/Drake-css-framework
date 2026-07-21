import type { ElementInput } from '../types';
import { inBrowser } from './env';
import { toArray, toNode, toNodes } from './lang';

const voidElements = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]);

export function isVoidElement(element: ElementInput): boolean {
    return toNodes(element).some((item) => voidElements.has(item.tagName.toLowerCase()));
}

export function isVisible(element: ElementInput): boolean {
    return toNodes(element).some((item) => {
        if (inBrowser && typeof item.checkVisibility === 'function') {
            return item.checkVisibility();
        }
        return (
            (item instanceof HTMLElement && Boolean(item.offsetWidth || item.offsetHeight)) ||
            item.getClientRects().length > 0
        );
    });
}

export const selInput = 'input,select,textarea,button';
export function isInput(element: ElementInput): boolean {
    return toNodes(element).some((item) => matches(item, selInput));
}

export const selFocusable = `${selInput},a[href],[tabindex]`;
export function isFocusable(element: ElementInput): boolean {
    return matches(element, selFocusable);
}

export function parent(element: ElementInput): HTMLElement | null | undefined {
    return toNode(element)?.parentElement;
}

export function filter<T extends Element>(elements: ElementInput<T>, selector: string): T[] {
    return toNodes(elements).filter((element) => matches(element, selector));
}

export function matches(element: ElementInput, selector: string): boolean {
    return toNodes(element).some((item) => item.matches(selector));
}

export function parents(element: ElementInput, selector?: string): HTMLElement[] {
    const result: HTMLElement[] = [];
    let current = parent(element);
    while (current) {
        if (!selector || matches(current, selector)) {
            result.push(current);
        }
        current = current.parentElement;
    }
    return result;
}

export function children(element: ElementInput, selector?: string): Element[] {
    const node = toNode(element);
    const result = node ? toArray(node.children) : [];
    return selector ? filter(result, selector) : result;
}

export function index(element: ElementInput, reference?: ElementInput): number {
    const node = toNode(element);
    if (!node) {
        return -1;
    }
    const referenceNode = toNode(reference);
    return referenceNode
        ? toNodes(element).indexOf(referenceNode)
        : children(parent(node)).indexOf(node);
}

export function isSameSiteAnchor(element: ElementInput): element is HTMLAnchorElement {
    const node = toNode(element);
    return (
        node instanceof HTMLAnchorElement &&
        ['origin', 'pathname', 'search'].every(
            (part) =>
                node[part as 'origin' | 'pathname' | 'search'] ===
                location[part as 'origin' | 'pathname' | 'search'],
        )
    );
}

export function getTargetedElement(element: ElementInput): Element | undefined {
    const anchor = toNode(element);
    if (!(anchor instanceof HTMLAnchorElement) || !isSameSiteAnchor(anchor)) {
        return;
    }
    const { hash, ownerDocument } = anchor;
    const id = decodeURIComponent(hash).slice(1);
    return id
        ? (ownerDocument.getElementById(id) ?? ownerDocument.getElementsByName(id)[0])
        : ownerDocument.documentElement;
}
