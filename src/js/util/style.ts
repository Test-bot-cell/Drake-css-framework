import type { CssProperties, CssValue, ElementInput } from '../types';
import { hyphenate, isNumber, isNumeric, isObject, isString, memoize } from './lang';

type StylableElement = HTMLElement | SVGElement;

const cssNumber = new Set([
    'animation-iteration-count',
    'column-count',
    'fill-opacity',
    'flex-grow',
    'flex-shrink',
    'font-weight',
    'line-height',
    'opacity',
    'order',
    'orphans',
    'stroke-dasharray',
    'stroke-dashoffset',
    'widows',
    'z-index',
    'zoom',
]);

export function css(element: ElementInput, property: string): string;
export function css(element: ElementInput, properties: readonly string[]): Record<string, string>;
export function css(
    element: ElementInput,
    property: string,
    value: CssValue,
    priority?: string,
): StylableElement | undefined;
export function css(
    element: ElementInput,
    properties: CssProperties,
    priority?: string,
): StylableElement | undefined;
export function css(
    element: ElementInput,
    property: string | readonly string[] | CssProperties,
    value?: CssValue | string,
    priority?: string,
): string | Record<string, string> | StylableElement | undefined {
    const elements = Array.from(element instanceof Node ? [element] : (element ?? [])).filter(
        (item): item is StylableElement =>
            item instanceof HTMLElement || item instanceof SVGElement,
    );
    const first = elements[0];

    if (isString(property) && value === undefined) {
        return first ? getComputedStyle(first).getPropertyValue(propName(property)) : '';
    }
    if (Array.isArray(property)) {
        const result: Record<string, string> = {};
        for (const name of property) {
            result[name as string] = css(first, String(name));
        }
        return result;
    }
    if (isObject(property)) {
        const objectPriority = isString(value) ? value : undefined;
        for (const name in property) {
            const propertyValue = property[name];
            if (isCssValue(propertyValue)) {
                css(elements, name, propertyValue, objectPriority);
            }
        }
        return first;
    }

    const name = propName(property as string);
    for (const item of elements) {
        const propertyValue =
            isNumeric(value) && !cssNumber.has(name) && !isCustomProperty(name)
                ? `${value}px`
                : value || isNumber(value)
                  ? String(value)
                  : '';
        item.style.setProperty(name, propertyValue, priority);
    }
    return first;
}

function isCssValue(value: unknown): value is CssValue {
    return value === null || value === undefined || ['string', 'number'].includes(typeof value);
}

export function resetProps(element: ElementInput, properties: CssProperties): void {
    for (const property in properties) {
        css(element, property, '');
    }
}

export const propName = memoize((value: string): string => {
    if (isCustomProperty(value)) {
        return value;
    }
    const name = hyphenate(value);
    const { style } = document.documentElement;
    if (name in style) {
        return name;
    }
    for (const prefix of ['webkit', 'moz']) {
        const prefixedName = `-${prefix}-${name}`;
        if (prefixedName in style) {
            return prefixedName;
        }
    }
    return name;
});

function isCustomProperty(name: string): boolean {
    return name.startsWith('--');
}
