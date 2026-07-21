import type { Axis, Dimension, Rect, Side } from '../types';
import { offset } from './dimensions';
import { clamp, isArray } from './lang';
import { css } from './style';
import { offsetViewport, overflowParents } from './viewport';

type Direction = Side | 'center';
type Attach = [Direction, Direction];
type Placement = 'flip' | 'shift' | undefined;
type Pair<T> = [T, T];

const dirs: readonly [
    readonly [Dimension, Axis, Side, Side],
    readonly [Dimension, Axis, Side, Side],
] = [
    ['width', 'x', 'left', 'right'],
    ['height', 'y', 'top', 'bottom'],
];

export interface PositionOptions {
    attach?: {
        element?: Attach;
        target?: Attach;
    };
    offset?: Pair<number>;
    placement?: Pair<Placement>;
    boundary?: Element | Pair<Element>;
    recursion?: boolean;
}

interface ResolvedPositionOptions {
    attach: {
        element: Attach;
        target: Attach;
    };
    offset: Pair<number>;
    placement: Pair<Placement>;
    boundary?: Element | Pair<Element>;
    recursion?: boolean;
}

export function positionAt(
    element: Element,
    target: Element | Pair<Element>,
    options: PositionOptions = {},
): void {
    const resolved = resolveOptions(options);
    const targets: Pair<Element> = isArray(target) ? toPair(target) : [target, target];
    const coordinates = getPosition(element, targets, resolved);
    if (coordinates) {
        offset(element, coordinates);
    }
}

function resolveOptions(options: PositionOptions): ResolvedPositionOptions {
    return {
        ...options,
        attach: {
            element: options.attach?.element ?? ['left', 'top'],
            target: options.attach?.target ?? ['left', 'top'],
        },
        offset: options.offset ?? [0, 0],
        placement: options.placement ?? [undefined, undefined],
    };
}

function getPosition(
    element: Element,
    target: Pair<Element>,
    options: ResolvedPositionOptions,
): Rect | false {
    const position = attachTo(element, target, options);
    const {
        boundary,
        viewportOffset = 0,
        placement,
    } = options as ResolvedPositionOptions & {
        viewportOffset?: number;
    };
    let offsetPosition = position;

    for (const index of [0, 1] as const) {
        const [property, , start, end] = dirs[index];
        const viewport = getViewport(element, target[index], viewportOffset, boundary, index);
        if (isWithin(position, viewport, index)) {
            continue;
        }

        let offsetBy = 0;
        if (placement[index] === 'flip') {
            const attach = options.attach.target[index];
            if (
                (attach === end && position[end] <= viewport[end]) ||
                (attach === start && position[start] >= viewport[start])
            ) {
                continue;
            }
            offsetBy = flip(element, target, options, index)[start] - position[start];
            const scrollArea = getScrollArea(element, target[index], viewportOffset, index);
            if (!isWithin(applyOffset(position, offsetBy, index), scrollArea, index)) {
                if (isWithin(position, scrollArea, index)) {
                    continue;
                }
                if (options.recursion) {
                    return false;
                }
                const newPosition = flipAxis(element, target, options);
                if (newPosition && isWithin(newPosition, scrollArea, index === 0 ? 1 : 0)) {
                    return newPosition;
                }
                continue;
            }
        } else if (placement[index] === 'shift') {
            const targetDimensions = offset(target[index]);
            offsetBy =
                clamp(
                    clamp(position[start], viewport[start], viewport[end] - position[property]),
                    targetDimensions[start] - position[property] + options.offset[index],
                    targetDimensions[end] - options.offset[index],
                ) - position[start];
        }
        offsetPosition = applyOffset(offsetPosition, offsetBy, index);
    }
    return offsetPosition;
}

function attachTo(
    element: Element,
    target: Pair<Element>,
    options: Pick<ResolvedPositionOptions, 'attach' | 'offset'>,
): Rect {
    let elementOffset = offset(element);
    for (const index of [0, 1] as const) {
        const [property, , start, end] = dirs[index];
        const targetOffset =
            options.attach.target[index] === options.attach.element[index]
                ? offsetViewport(target[index])
                : offset(target[index]);
        elementOffset = applyOffset(
            elementOffset,
            targetOffset[start] -
                elementOffset[start] +
                moveBy(options.attach.target[index], end, targetOffset[property]) -
                moveBy(options.attach.element[index], end, elementOffset[property]) +
                options.offset[index],
            index,
        );
    }
    return elementOffset;
}

function applyOffset(position: Rect, value: number, index: 0 | 1): Rect {
    const [, axis, start, end] = dirs[index];
    const result = { ...position };
    result[start] = position[start] + value;
    result[end] = position[end] + value;
    result[axis] = result[start];
    return result;
}

function moveBy(attach: Direction, end: Side, dimension: number): number {
    return attach === 'center' ? dimension / 2 : attach === end ? dimension : 0;
}

function getViewport(
    element: Element,
    target: Element,
    viewportOffset: number,
    boundary: Element | Pair<Element> | undefined,
    index: 0 | 1,
): Rect {
    let viewport = getIntersectionArea(...commonScrollParents(element, target).map(offsetViewport));
    const [, , start, end] = dirs[index];
    if (viewportOffset) {
        viewport[start] += viewportOffset;
        viewport[end] -= viewportOffset;
    }
    if (boundary) {
        viewport = getIntersectionArea(
            viewport,
            offset(isArray(boundary) ? boundary[index] : boundary),
        );
    }
    return viewport;
}

function getScrollArea(
    element: Element,
    target: Element,
    viewportOffset: number,
    index: 0 | 1,
): Rect {
    const [property, axis, start, end] = dirs[index];
    const scrollElement = commonScrollParents(element, target)[0] ?? document.documentElement;
    const viewport = offsetViewport(scrollElement);
    if (['auto', 'scroll'].includes(css(scrollElement, `overflow-${axis}`))) {
        const scrollStart = start === 'top' ? scrollElement.scrollTop : scrollElement.scrollLeft;
        const scrollSize =
            property === 'height' ? scrollElement.scrollHeight : scrollElement.scrollWidth;
        viewport[start] -= scrollStart;
        viewport[end] = viewport[start] + scrollSize;
    }
    viewport[start] += viewportOffset;
    viewport[end] -= viewportOffset;
    return viewport;
}

function commonScrollParents(element: Element, target: Element): HTMLElement[] {
    return overflowParents(target).filter((parent) => parent.contains(element));
}

function getIntersectionArea(...rects: Rect[]): Rect {
    const area: Rect = {
        top: 0,
        left: 0,
        bottom: Number.POSITIVE_INFINITY,
        right: Number.POSITIVE_INFINITY,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    };
    for (const rect of rects) {
        area.top = Math.max(area.top, rect.top);
        area.left = Math.max(area.left, rect.left);
        area.bottom = Math.min(area.bottom, rect.bottom);
        area.right = Math.min(area.right, rect.right);
    }
    area.width = area.right - area.left;
    area.height = area.bottom - area.top;
    area.x = area.left;
    area.y = area.top;
    return area;
}

function isWithin(first: Rect, second: Rect, index: 0 | 1): boolean {
    const [, , start, end] = dirs[index];
    return first[start] >= second[start] && first[end] <= second[end];
}

function flip(
    element: Element,
    target: Pair<Element>,
    options: ResolvedPositionOptions,
    index: 0 | 1,
): Rect {
    return attachTo(element, target, {
        attach: {
            element: flipAttach(options.attach.element, index),
            target: flipAttach(options.attach.target, index),
        },
        offset: flipOffset(options.offset, index),
    });
}

function flipAxis(
    element: Element,
    target: Pair<Element>,
    options: ResolvedPositionOptions,
): Rect | false {
    return getPosition(element, target, {
        ...options,
        attach: {
            element: toPair(options.attach.element.map(flipAttachAxis).reverse()),
            target: toPair(options.attach.target.map(flipAttachAxis).reverse()),
        },
        offset: toPair([...options.offset].reverse()),
        placement: toPair([...options.placement].reverse()),
        recursion: true,
    });
}

function flipAttach(attach: Attach, index: 0 | 1): Attach {
    const result: Attach = [...attach];
    const directionIndex = (dirs[index] as readonly string[]).indexOf(attach[index]);
    if (directionIndex >= 0) {
        result[index] = dirs[index][1 - (directionIndex % 2) + 2] as Direction;
    }
    return result;
}

function flipAttachAxis(property: Direction): Direction {
    for (const index of [0, 1] as const) {
        const directionIndex = (dirs[index] as readonly string[]).indexOf(property);
        if (directionIndex >= 0) {
            return dirs[index === 0 ? 1 : 0][(directionIndex % 2) + 2] as Direction;
        }
    }
    return property;
}

function flipOffset(offset: Pair<number>, index: 0 | 1): Pair<number> {
    const result: Pair<number> = [...offset];
    result[index] *= -1;
    return result;
}

function toPair<T>(values: readonly T[]): Pair<T> {
    if (values.length < 2 || values[0] === undefined || values[1] === undefined) {
        throw new TypeError('Expected a pair of values.');
    }
    return [values[0], values[1]];
}
