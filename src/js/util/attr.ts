import type { ElementInput } from '../types';
import { isObject, isUndefined, toNode, toNodes } from './lang';

export type AttributeValue = string | number | boolean | null;
export type Attributes = Record<string, AttributeValue>;

export function attr(element: ElementInput, name: string): string | null | undefined;
export function attr(element: ElementInput, name: string, value: AttributeValue): void;
export function attr(element: ElementInput, attributes: Attributes): void;
export function attr(
    element: ElementInput,
    name: string | Attributes,
    value?: AttributeValue,
): string | null | undefined | void {
    if (isObject(name)) {
        for (const key in name) {
            const attributeValue = name[key];
            if (isAttributeValue(attributeValue)) {
                attr(element, key, attributeValue);
            }
        }
        return;
    }

    if (isUndefined(value)) {
        return toNode(element)?.getAttribute(name);
    }

    for (const item of toNodes(element)) {
        if (value === null) {
            removeAttr(item, name);
        } else {
            item.setAttribute(name, String(value));
        }
    }
}

function isAttributeValue(value: unknown): value is AttributeValue {
    return ['string', 'number', 'boolean'].includes(typeof value) || value === null;
}

export function hasAttr(element: ElementInput, name: string): boolean {
    return toNodes(element).some((item) => item.hasAttribute(name));
}

export function removeAttr(element: ElementInput, name: string): void {
    toNodes(element).forEach((item) => item.removeAttribute(name));
}

export function data(element: ElementInput, attribute: string): string | null | undefined {
    for (const name of [attribute, `data-${attribute}`]) {
        if (hasAttr(element, name)) {
            return attr(element, name);
        }
    }
}
