import type { NodeInput, Point, Rect, UnknownRecord } from '../types';

const { hasOwnProperty, toString } = Object.prototype;

export type Callable = (...args: unknown[]) => unknown;
type Comparable = number | string;

export function hasOwn(object: object, key: PropertyKey): boolean {
    return hasOwnProperty.call(object, key);
}

const hyphenateRe = /\B([A-Z])/g;
export const hyphenate = memoize((value: string) =>
    value.replace(hyphenateRe, '-$1').toLowerCase(),
);

const camelizeRe = /-(\w)/g;
export const camelize = memoize((value: string) =>
    (value.charAt(0).toLowerCase() + value.slice(1)).replace(camelizeRe, (_, character: string) =>
        character.toUpperCase(),
    ),
);

export const ucfirst = memoize((value: string) => value.charAt(0).toUpperCase() + value.slice(1));

export function startsWith(value: unknown, search: string): boolean {
    return typeof value === 'string' && value.startsWith(search);
}

export function endsWith(value: unknown, search: string): boolean {
    return typeof value === 'string' && value.endsWith(search);
}

export function includes<T>(value: readonly T[] | null | undefined, search: T): boolean;
export function includes(value: string | null | undefined, search: string): boolean;
export function includes(value: unknown, search: unknown): boolean;
export function includes(value: unknown, search: unknown): boolean {
    if (typeof value === 'string') {
        return typeof search === 'string' && value.includes(search);
    }
    return Array.isArray(value) && value.includes(search);
}

export function findIndex<T>(
    array: readonly T[] | null | undefined,
    predicate: (value: T, index: number, values: readonly T[]) => boolean,
): number {
    return array?.findIndex(predicate) ?? -1;
}

export const isArray: (value: unknown) => value is unknown[] = Array.isArray;

export function toArray<T>(value: ArrayLike<T> | Iterable<T>): T[] {
    return Array.from(value);
}

export const assign: typeof Object.assign = Object.assign;

export function isFunction(value: unknown): value is Callable {
    return typeof value === 'function';
}

export function isObject(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object';
}

export function isPlainObject(value: unknown): value is UnknownRecord {
    return toString.call(value) === '[object Object]';
}

export function isWindow(value: unknown): value is Window {
    return isObject(value) && value === value.window;
}

export function isDocument(value: unknown): value is Document {
    return nodeType(value) === 9;
}

export function isNode(value: unknown): value is Node {
    return nodeType(value) >= 1;
}

export function isElement(value: unknown): value is Element {
    return nodeType(value) === 1;
}

function nodeType(value: unknown): number {
    return !isWindow(value) && isObject(value) && typeof value.nodeType === 'number'
        ? value.nodeType
        : 0;
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

export function isNumeric(value: unknown): value is number | `${number}` {
    return (
        isNumber(value) || (isString(value) && value.trim() !== '' && !Number.isNaN(Number(value)))
    );
}

export function isEmpty(value: unknown): boolean {
    return !(isArray(value) ? value.length : isObject(value) ? Object.keys(value).length : false);
}

export function isUndefined(value: unknown): value is undefined {
    return value === undefined;
}

export function toBoolean(value: unknown): unknown {
    return isBoolean(value)
        ? value
        : value === 'true' || value === '1' || value === ''
          ? true
          : value === 'false' || value === '0'
            ? false
            : value;
}

export function toNumber(value: unknown): number | false {
    const number = Number(value);
    return Number.isNaN(number) ? false : number;
}

export function toFloat(value: unknown): number {
    return Number.parseFloat(String(value)) || 0;
}

export function toNode<T extends Node>(value: NodeInput<T>): T | undefined;
export function toNode(value: unknown): Node | undefined;
export function toNode(value: unknown): Node | undefined {
    return toNodes(value)[0];
}

export function toNodes<T extends Node>(value: NodeInput<T>): T[];
export function toNodes(value: unknown): Node[];
export function toNodes(value: unknown): Node[] {
    if (isNode(value)) {
        return [value];
    }
    if (!isCollection(value)) {
        return [];
    }
    return Array.from(value).filter(isNode);
}

function isCollection(value: unknown): value is ArrayLike<unknown> | Iterable<unknown> {
    if (!isObject(value)) {
        return false;
    }
    return (
        typeof value.length === 'number' ||
        (Symbol.iterator in value && typeof value[Symbol.iterator] === 'function')
    );
}

export function toWindow(value?: unknown): Window {
    if (isWindow(value)) {
        return value;
    }

    const node = toNode(value);
    const document = isDocument(node) ? node : node?.ownerDocument;
    return document?.defaultView ?? window;
}

export function isEqual(value: unknown, other: unknown): boolean {
    return (
        value === other ||
        (isObject(value) &&
            isObject(other) &&
            Object.keys(value).length === Object.keys(other).length &&
            each(value, (item, key) => item === other[key]))
    );
}

export function swap(value: string, first: string, second: string): string {
    return value.replace(new RegExp(`${first}|${second}`, 'g'), (match) =>
        match === first ? second : first,
    );
}

export function last<T>(array: readonly T[]): T | undefined {
    return array[array.length - 1];
}

export function each<T>(
    object: Record<string, T> | ArrayLike<T>,
    callback: (value: T, key: string) => unknown,
): boolean {
    const record = object as Record<string, T>;
    for (const key in record) {
        if (callback(record[key] as T, key) === false) {
            return false;
        }
    }
    return true;
}

export function sortBy<T extends Record<PropertyKey, unknown>>(
    array: readonly T[],
    property: keyof T,
): T[] {
    return array.slice().sort((first, second) => {
        const firstValue = toComparable(first[property]);
        const secondValue = toComparable(second[property]);
        return firstValue > secondValue ? 1 : secondValue > firstValue ? -1 : 0;
    });
}

function toComparable(value: unknown): Comparable {
    return typeof value === 'number' || typeof value === 'string' ? value : 0;
}

export function sumBy<T>(
    array: readonly T[],
    iteratee: ((value: T) => unknown) | (T extends object ? keyof T : never),
): number {
    return array.reduce((sum, item) => {
        const value = isFunction(iteratee)
            ? iteratee(item)
            : isObject(item)
              ? item[iteratee as PropertyKey]
              : item;
        return sum + toFloat(value);
    }, 0);
}

export function uniqueBy<T extends Record<PropertyKey, unknown>>(
    array: readonly T[],
    property: keyof T,
): T[] {
    const seen = new Set<unknown>();
    return array.filter((item) => {
        const value = item[property];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

export function pick<T extends object, K extends keyof T>(
    object: T,
    properties: readonly K[],
): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const property of properties) {
        result[property] = object[property];
    }
    return result;
}

export function clamp(value: unknown, min = 0, max = 1): number {
    return Math.min(Math.max(toNumber(value) || 0, min), max);
}

export function noop(): void {}

export function intersectRect(...rects: readonly Rect[]): boolean {
    return (
        Math.min(...rects.map(({ bottom }) => bottom)) - Math.max(...rects.map(({ top }) => top)) >
            0 &&
        Math.min(...rects.map(({ right }) => right)) - Math.max(...rects.map(({ left }) => left)) >
            0
    );
}

export function pointInRect(point: Point, rect: Rect): boolean {
    return (
        point.x <= rect.right &&
        point.x >= rect.left &&
        point.y <= rect.bottom &&
        point.y >= rect.top
    );
}

export interface DimensionsValue {
    width: number;
    height: number;
}

function ratio(
    dimensions: DimensionsValue,
    property: keyof DimensionsValue,
    value: number,
): DimensionsValue {
    const otherProperty = property === 'width' ? 'height' : 'width';
    return {
        ...dimensions,
        [otherProperty]: dimensions[property]
            ? Math.round((value * dimensions[otherProperty]) / dimensions[property])
            : dimensions[otherProperty],
        [property]: value,
    };
}

function contain(dimensions: DimensionsValue, maximum: DimensionsValue): DimensionsValue {
    let result = { ...dimensions };
    for (const property of ['width', 'height'] as const) {
        if (result[property] > maximum[property]) {
            result = ratio(result, property, maximum[property]);
        }
    }
    return result;
}

function cover(dimensions: DimensionsValue, maximum: DimensionsValue): DimensionsValue {
    let result = contain(dimensions, maximum);
    for (const property of ['width', 'height'] as const) {
        if (result[property] < maximum[property]) {
            result = ratio(result, property, maximum[property]);
        }
    }
    return result;
}

export const Dimensions = { ratio, contain, cover };

export type IndexSpecifier = number | `${number}` | 'next' | 'previous' | 'last' | Node;

export function getIndex(
    index: IndexSpecifier,
    elements: NodeInput,
    current = 0,
    finite = false,
): number {
    const nodes = toNodes(elements);
    const { length } = nodes;
    if (!length) {
        return -1;
    }

    let resolved = isNumeric(index)
        ? toNumber(index) || 0
        : index === 'next'
          ? current + 1
          : index === 'previous'
            ? current - 1
            : index === 'last'
              ? length - 1
              : nodes.indexOf(index);

    if (finite) {
        return clamp(resolved, 0, length - 1);
    }
    resolved %= length;
    return resolved < 0 ? resolved + length : resolved;
}

export function memoize<K, A extends unknown[], R>(
    callback: (key: K, ...args: A) => R,
): (key: K, ...args: A) => R {
    const cache = new Map<K, R>();
    return (key, ...args) => {
        const cached = cache.get(key);
        if (cached) {
            return cached;
        }
        const value = callback(key, ...args);
        cache.set(key, value);
        return value;
    };
}
