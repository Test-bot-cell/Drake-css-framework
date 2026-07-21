import type { Coordinates, Dimension, ElementInput, Rect, Side } from '../types';
import { $, append, remove } from './dom';
import { on } from './event';
import {
    isDocument,
    isElement,
    isString,
    isWindow,
    memoize,
    sumBy,
    toFloat,
    toNode,
    toWindow,
} from './lang';
import { css } from './style';

const dirs: Record<Dimension, readonly Side[]> = {
    width: ['left', 'right'],
    height: ['top', 'bottom'],
};

export function dimensions(element: unknown): Rect {
    const rect = isElement(element)
        ? element.getBoundingClientRect()
        : { height: height(element), width: width(element), top: 0, left: 0 };
    return {
        height: rect.height,
        width: rect.width,
        top: rect.top,
        left: rect.left,
        x: rect.left,
        y: rect.top,
        bottom: rect.top + rect.height,
        right: rect.left + rect.width,
    };
}

export function offset(element: unknown): Rect;
export function offset(element: ElementInput, coordinates: Coordinates): void;
export function offset(element: unknown, coordinates?: Coordinates): Rect | void {
    if (coordinates) {
        css(toElementInput(element), { left: 0, top: 0 });
    }
    const currentOffset = dimensions(element);
    if (element) {
        const { scrollY, scrollX } = toWindow(element);
        currentOffset.top += scrollY;
        currentOffset.bottom += scrollY;
        currentOffset.left += scrollX;
        currentOffset.right += scrollX;
    }
    if (!coordinates) {
        return currentOffset;
    }
    css(toElementInput(element), 'left', coordinates.left - currentOffset.left);
    css(toElementInput(element), 'top', coordinates.top - currentOffset.top);
}

export function position(element: ElementInput): Coordinates {
    const node = toHtmlElement(element);
    if (!node) {
        return { top: 0, left: 0 };
    }
    let { top, left } = offset(node);
    const { body, documentElement } = node.ownerDocument;
    let offsetParent: Element | null = node.offsetParent ?? documentElement;
    while (
        offsetParent &&
        (offsetParent === body || offsetParent === documentElement) &&
        css(offsetParent, 'position') === 'static'
    ) {
        offsetParent = offsetParent.parentElement;
    }
    if (offsetParent) {
        const parentOffset = offset(offsetParent);
        top -= parentOffset.top + toFloat(css(offsetParent, 'borderTopWidth'));
        left -= parentOffset.left + toFloat(css(offsetParent, 'borderLeftWidth'));
    }
    return {
        top: top - toFloat(css(node, 'marginTop')),
        left: left - toFloat(css(node, 'marginLeft')),
    };
}

export function offsetPosition(element: ElementInput): [number, number] {
    let node = toHtmlElement(element);
    if (!node) {
        return [0, 0];
    }
    const result: [number, number] = [node.offsetTop, node.offsetLeft];
    while ((node = node.offsetParent instanceof HTMLElement ? node.offsetParent : undefined)) {
        result[0] += node.offsetTop + toFloat(css(node, 'borderTopWidth'));
        result[1] += node.offsetLeft + toFloat(css(node, 'borderLeftWidth'));
        if (css(node, 'position') === 'fixed') {
            const win = toWindow(node);
            result[0] += win.scrollY;
            result[1] += win.scrollX;
            return result;
        }
    }
    return result;
}

export interface DimensionFunction {
    (element: unknown): number;
    (element: ElementInput, value: string | number | null): Element | undefined;
}

export const height = dimension('height');
export const width = dimension('width');

function dimension(property: Dimension): DimensionFunction {
    return ((element: unknown, value?: string | number | null) => {
        if (value === undefined) {
            if (isWindow(element)) {
                return property === 'height' ? element.innerHeight : element.innerWidth;
            }
            if (isDocument(element)) {
                const documentElement = element.documentElement;
                return property === 'height'
                    ? Math.max(documentElement.offsetHeight, documentElement.scrollHeight)
                    : Math.max(documentElement.offsetWidth, documentElement.scrollWidth);
            }
            const node = toHtmlElement(element);
            if (!node) {
                return 0;
            }
            const computed = css(node, property);
            const measured =
                computed === 'auto'
                    ? property === 'height'
                        ? node.offsetHeight
                        : node.offsetWidth
                    : toFloat(computed) || 0;
            return measured - boxModelAdjust(node, property);
        }
        const nodeInput = toElementInput(element);
        const adjusted =
            !value && value !== 0 ? '' : `${Number(value) + boxModelAdjust(nodeInput, property)}px`;
        return css(nodeInput, property, adjusted);
    }) as DimensionFunction;
}

export function boxModelAdjust(
    element: ElementInput,
    property: Dimension,
    sizing = 'border-box',
): number {
    return css(element, 'boxSizing') === sizing
        ? sumBy(
              dirs[property],
              (side) =>
                  toFloat(css(element, `padding-${side}`)) +
                  toFloat(css(element, `border-${side}-width`)),
          )
        : 0;
}

export function flipPosition(position: string): string {
    for (const sides of Object.values(dirs)) {
        const index = sides.indexOf(position as Side);
        if (index >= 0) {
            return sides[1 - index] ?? position;
        }
    }
    return position;
}

export function toPx(
    value: unknown,
    property: Dimension = 'width',
    element: Element | Window = window,
    offsetDimension = false,
): number {
    if (!isString(value)) {
        return toFloat(value);
    }
    return sumBy(parseCalc(value), (part) => {
        const unit = parseUnit(part);
        if (!unit) {
            return part;
        }
        const base =
            unit === 'vh'
                ? getViewportHeight()
                : unit === 'vw'
                  ? width(toWindow(element))
                  : offsetDimension && element instanceof HTMLElement
                    ? property === 'height'
                        ? element.offsetHeight
                        : element.offsetWidth
                    : dimensions(element)[property];
        return percent(base, part);
    });
}

const calcRe = /-?\d+(?:\.\d+)?(?:v[wh]|%|px)?/g;
const parseCalc = memoize(
    (calculation: string): string[] => calculation.replace(/\s/g, '').match(calcRe) ?? [],
);
const unitRe = /(?:v[hw]|%)$/;
const parseUnit = memoize((value: string): string | undefined => value.match(unitRe)?.[0]);

function percent(base: number, value: unknown): number {
    return (base * toFloat(value)) / 100;
}

let viewportHeight: number | undefined;
let viewportElement: HTMLElement | undefined;

function getViewportHeight(): number {
    if (viewportHeight) {
        return viewportHeight;
    }
    if (!viewportElement) {
        viewportElement = $('<div>');
        if (!viewportElement) {
            return window.innerHeight;
        }
        css(viewportElement, { height: '100vh', position: 'fixed' });
        on(window, 'resize', () => {
            viewportHeight = undefined;
        });
    }
    append(document.body, viewportElement);
    viewportHeight = viewportElement.clientHeight;
    remove(viewportElement);
    return viewportHeight;
}

function toHtmlElement(value: unknown): HTMLElement | undefined {
    const node = toNode(value);
    return node instanceof HTMLElement ? node : undefined;
}

function toElementInput(value: unknown): ElementInput {
    return isElement(value) ? value : undefined;
}
