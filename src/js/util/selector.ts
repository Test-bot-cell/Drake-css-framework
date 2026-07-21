import type { ElementInput } from '../types';
import { attr } from './attr';
import { index, matches } from './filter';
import { isDocument, isString, memoize, toNode, toNodes } from './lang';

export type Selector = string | ElementInput<Element>;
export type QueryContext = Document | DocumentFragment | Element;

export function query<T extends Element = HTMLElement>(
    selector: Selector,
    context?: QueryContext,
): T | undefined {
    return find<T>(selector, getContext(selector, context));
}

export function queryAll<T extends Element = HTMLElement>(
    selector: Selector,
    context?: QueryContext,
): T[] {
    return findAll<T>(selector, getContext(selector, context));
}

export function find<T extends Element = HTMLElement>(
    selector: Selector,
    context?: QueryContext,
): T | undefined {
    if (!isString(selector)) {
        return toNode(selector) as T | undefined;
    }
    return (
        (_query(selector, context ?? document, 'querySelector') as T | null | undefined) ??
        undefined
    );
}

export function findAll<T extends Element = HTMLElement>(
    selector: Selector,
    context?: QueryContext,
): T[] {
    if (!isString(selector)) {
        return toNodes(selector) as T[];
    }
    return toNodes(_query(selector, context ?? document, 'querySelectorAll')) as T[];
}

function getContext(selector: Selector, context: QueryContext = document): QueryContext {
    return isDocument(context) || (isString(selector) && parseSelector(selector).isContextSelector)
        ? context
        : context.ownerDocument;
}

interface ParsedSelector {
    selector: string;
    selectors: string[];
    isContextSelector: boolean;
}

const addStarRe = /([!>+~-])(?=\s+[!>+~-]|\s*$)/g;
const splitSelectorRe = /(\([^)]*\)|[^,])+/g;

const parseSelector = memoize((selector: string): ParsedSelector => {
    const selectors: string[] = [];
    let isContextSelector = false;
    for (let item of selector.match(splitSelectorRe) ?? []) {
        item = item.trim().replace(addStarRe, '$1 *');
        isContextSelector ||= ['!', '+', '~', '-', '>'].includes(item[0] ?? '');
        selectors.push(item);
    }
    return { selector: selectors.join(','), selectors, isContextSelector };
});

const positionRe = /(\([^)]*\)|\S)*/;
function parsePositionSelector(selector: string): [string, string] {
    const value = selector.slice(1).trim();
    const position = value.match(positionRe)?.[0] ?? '';
    return [position, value.slice(position.length + 1)];
}

function _query(
    selector: string,
    context: QueryContext,
    queryFunction: 'querySelector' | 'querySelectorAll',
): Element | NodeListOf<Element> | null {
    const parsed = parseSelector(selector);
    if (!parsed.isContextSelector) {
        return parsed.selector ? doQuery(context, queryFunction, parsed.selector) : null;
    }

    let combined = '';
    const isSingle = parsed.selectors.length === 1;
    for (let item of parsed.selectors) {
        let current: QueryContext | null = context;

        if (item[0] === '!') {
            const [positionSelector, remainingSelector] = parsePositionSelector(item);
            item = remainingSelector;
            current =
                context instanceof Element
                    ? (context.parentElement?.closest(positionSelector) ?? null)
                    : null;
            if (!item && isSingle) {
                return current;
            }
        }

        if (current instanceof Element && item[0] === '-') {
            const [positionSelector, remainingSelector] = parsePositionSelector(item);
            item = remainingSelector;
            const previous = current.previousElementSibling;
            current = previous && matches(previous, positionSelector) ? previous : null;
            if (!item && isSingle) {
                return current;
            }
        }

        if (!current) {
            continue;
        }

        if (isSingle) {
            if (current instanceof Element && (item[0] === '~' || item[0] === '+')) {
                item = `:scope > :nth-child(${index(current) + 1}) ${item}`;
                current = current.parentElement;
            } else if (item[0] === '>') {
                item = `:scope ${item}`;
            }
            return current ? doQuery(current, queryFunction, item) : null;
        }

        if (current instanceof Element) {
            combined += `${combined ? ',' : ''}${domPath(current)} ${item}`;
        }
    }

    const root = isDocument(context) ? context : context.ownerDocument;
    return doQuery(root, queryFunction, combined);
}

function doQuery(
    context: QueryContext,
    queryFunction: 'querySelector' | 'querySelectorAll',
    selector: string,
): Element | NodeListOf<Element> | null {
    try {
        return queryFunction === 'querySelector'
            ? context.querySelector(selector)
            : context.querySelectorAll(selector);
    } catch {
        return null;
    }
}

function domPath(element: Element): string {
    const names: string[] = [];
    let current: Element | null = element;
    while (current) {
        const id = attr(current, 'id');
        if (id) {
            names.unshift(`#${escape(id)}`);
            break;
        }
        let tagName = current.tagName;
        if (tagName !== 'HTML') {
            tagName += `:nth-child(${index(current) + 1})`;
        }
        names.unshift(tagName);
        current = current.parentElement;
    }
    return names.join(' > ');
}

export function escape(value: unknown): string {
    return isString(value) ? CSS.escape(value) : '';
}
