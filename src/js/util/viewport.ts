import type { ElementInput, Rect } from '../types';
import { hasClass } from './class';
import { dimensions, offset, offsetPosition } from './dimensions';
import { isVisible, parent, parents } from './filter';
import { clamp, findIndex, includes, intersectRect, isNode, toFloat, toWindow } from './lang';
import { css } from './style';

export function isInView(element: ElementInput, offsetTop = 0, offsetLeft = 0): boolean {
    const node = firstElement(element);
    if (!node || !isVisible(node)) {
        return false;
    }
    const viewports = overflowParents(node).map((scrollParent) => {
        const { top, left, bottom, right } = offsetViewport(scrollParent);
        return {
            top: top - offsetTop,
            left: left - offsetLeft,
            bottom: bottom + offsetTop,
            right: right + offsetLeft,
            width: right - left + 2 * offsetLeft,
            height: bottom - top + 2 * offsetTop,
            x: left - offsetLeft,
            y: top - offsetTop,
        } satisfies Rect;
    });
    return intersectRect(...viewports, offset(node));
}

export function scrollIntoView(
    element: ElementInput,
    { offset: initialOffset = 0 }: { offset?: number } = {},
): Promise<void> {
    const node = firstHtmlElement(element);
    if (!node) {
        return Promise.resolve();
    }
    const scrollableParents = isVisible(node) ? scrollParents(node, false, ['hidden']) : [];
    let offsetBy = initialOffset;
    const operation = scrollableParents.reduce<() => Promise<void>>(
        (next, scrollElement, index) => {
            const { scrollTop, scrollHeight, offsetHeight } = scrollElement;
            const viewport = offsetViewport(scrollElement);
            const maxScroll = scrollHeight - viewport.height;
            const previous = scrollableParents[index - 1];
            const elementRect = previous ? offsetViewport(previous) : offset(node);
            let top = Math.ceil(elementRect.top - viewport.top - offsetBy + scrollTop);

            if (offsetBy > 0 && offsetHeight < elementRect.height + offsetBy) {
                top += offsetBy;
            } else {
                offsetBy = 0;
            }
            if (top > maxScroll) {
                offsetBy -= top - maxScroll;
                top = maxScroll;
            } else if (top < 0) {
                offsetBy -= top;
                top = 0;
            }
            return () =>
                animateScroll(
                    scrollElement,
                    top - scrollTop,
                    node,
                    maxScroll,
                    scrollableParents,
                ).then(next);
        },
        () => Promise.resolve(),
    );
    return operation();
}

function animateScroll(
    element: HTMLElement,
    top: number,
    target: HTMLElement,
    maxScroll: number,
    scrollableParents: HTMLElement[],
): Promise<void> {
    return new Promise((resolve) => {
        const scroll = element.scrollTop;
        const duration = 40 * Math.pow(Math.abs(top), 0.375);
        const start = Date.now();
        const isDocumentScroller = scrollingElement(element) === element;
        const targetTop = offset(target).top + (isDocumentScroller ? 0 : scroll);
        let previousDifference = 0;
        let frames = 15;

        const step = () => {
            const percent = 0.5 * (1 - Math.cos(Math.PI * clamp((Date.now() - start) / duration)));
            let difference = 0;
            if (scrollableParents[0] === element && scroll + top < maxScroll) {
                const covering = getCoveringElement(target);
                difference =
                    offset(target).top +
                    (isDocumentScroller ? 0 : element.scrollTop) -
                    targetTop -
                    (covering ? dimensions(covering).height : 0);
            }
            if (css(element, 'scrollBehavior') !== 'auto') {
                css(element, 'scrollBehavior', 'auto');
            }
            element.scrollTop = scroll + (top + difference) * percent;
            css(element, 'scrollBehavior', '');
            if (percent === 1 && (previousDifference === difference || !frames--)) {
                resolve();
            } else {
                previousDifference = difference;
                requestAnimationFrame(step);
            }
        };
        step();
    });
}

export function scrolledOver(element: ElementInput, startOffset = 0, endOffset = 0): number {
    const node = firstHtmlElement(element);
    if (!node || !isVisible(node)) {
        return 0;
    }
    const scrollElement = scrollParent(node, true);
    const { scrollHeight, scrollTop } = scrollElement;
    const viewportHeight = offsetViewport(scrollElement).height;
    const maxScroll = scrollHeight - viewportHeight;
    const elementOffsetTop = offsetPosition(node)[0] - offsetPosition(scrollElement)[0];
    const start = Math.max(0, elementOffsetTop - viewportHeight + startOffset);
    const end = Math.min(maxScroll, elementOffsetTop + node.offsetHeight - endOffset);
    return start < end ? clamp((scrollTop - start) / (end - start)) : 1;
}

export function scrollParents(
    element: ElementInput,
    scrollable = false,
    properties: readonly string[] = [],
): HTMLElement[] {
    const node = firstElement(element);
    if (!node) {
        return [document.documentElement];
    }
    const scrollElement = scrollingElement(node);
    let ancestors = parents(node).reverse();
    ancestors = ancestors.slice(ancestors.indexOf(scrollElement) + 1);
    const fixedIndex = findIndex(ancestors, (ancestor) => hasPosition(ancestor, 'fixed'));
    if (fixedIndex >= 0) {
        ancestors = ancestors.slice(fixedIndex);
    }
    return [scrollElement]
        .concat(
            ancestors.filter(
                (ancestor) =>
                    css(ancestor, 'overflow')
                        .split(' ')
                        .some((property) =>
                            includes(['auto', 'scroll', ...properties], property),
                        ) &&
                    (!scrollable || ancestor.scrollHeight > offsetViewport(ancestor).height),
            ),
        )
        .reverse();
}

export function scrollParent(
    element: ElementInput,
    scrollable = false,
    properties: readonly string[] = [],
): HTMLElement {
    return scrollParents(element, scrollable, properties)[0] ?? document.documentElement;
}

export function overflowParents(element: ElementInput): HTMLElement[] {
    return scrollParents(element, false, ['hidden', 'clip']);
}

export function offsetViewport(scrollElement: unknown): Rect {
    const win = toWindow(scrollElement);
    const documentScroller = scrollingElement(scrollElement);
    const useWindow = !isNode(scrollElement) || scrollElement.contains(documentScroller);

    if (useWindow && win.visualViewport) {
        const viewport = win.visualViewport;
        const height = Math.round(viewport.height * viewport.scale);
        const width = Math.round(viewport.width * viewport.scale);
        const top = viewport.pageTop;
        const left = viewport.pageLeft;
        return {
            height,
            width,
            top,
            left,
            x: left,
            y: top,
            bottom: top + height,
            right: left + width,
        };
    }

    const rect = offset(useWindow ? win : scrollElement);
    const element = firstElement(scrollElement);
    if (element && css(element, 'display') === 'inline') {
        return rect;
    }

    const { body, documentElement } = win.document;
    const viewportElement = useWindow
        ? documentScroller === documentElement || documentScroller.clientHeight < body.clientHeight
            ? documentScroller
            : body
        : (firstHtmlElement(scrollElement) ?? documentScroller);

    adjustViewportDimension(rect, viewportElement, 'width', 'left', 'right');
    adjustViewportDimension(rect, viewportElement, 'height', 'top', 'bottom');
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
}

function adjustViewportDimension(
    rect: Rect,
    viewportElement: HTMLElement,
    property: 'width' | 'height',
    start: 'left' | 'top',
    end: 'right' | 'bottom',
): void {
    const subpixel = rect[property] % 1;
    rect[start] += toFloat(css(viewportElement, `border-${start}-width`));
    const clientSize =
        property === 'width' ? viewportElement.clientWidth : viewportElement.clientHeight;
    rect[property] = clientSize - (subpixel ? (subpixel < 0.5 ? -subpixel : 1 - subpixel) : 0);
    rect[end] = rect[property] + rect[start];
}

export function getCoveringElement(target?: ElementInput): Element | undefined {
    const suppliedTarget = firstElement(target);
    const document = toWindow(suppliedTarget).document;
    const node = suppliedTarget ?? document.body;
    const { left, width, top } = dimensions(node);
    for (const position of top ? [0, top] : [0]) {
        let covering: Element | undefined;
        for (const element of document.elementsFromPoint(left + width / 2, position)) {
            const relevant =
                !element.contains(node) &&
                !hasClass(element, 'drk-togglable-leave') &&
                ((hasPosition(element, 'fixed') &&
                    zIndex(
                        parents(node)
                            .reverse()
                            .find(
                                (ancestor) =>
                                    !ancestor.contains(element) && !hasPosition(ancestor, 'static'),
                            ),
                    ) < zIndex(element)) ||
                    (hasPosition(element, 'sticky') &&
                        (!suppliedTarget || Boolean(parent(element)?.contains(node)))));
            if (
                relevant &&
                (!covering || dimensions(covering).height < dimensions(element).height)
            ) {
                covering = element;
            }
        }
        if (covering) {
            return covering;
        }
    }
}

function zIndex(element?: ElementInput): number {
    return toFloat(css(element, 'zIndex'));
}

function hasPosition(element: ElementInput, position: string): boolean {
    return css(element, 'position') === position;
}

function scrollingElement(element: unknown): HTMLElement {
    const document = toWindow(element).document;
    return document.scrollingElement instanceof HTMLElement
        ? document.scrollingElement
        : document.documentElement;
}

function firstElement(element?: unknown): Element | undefined {
    if (element instanceof Element) {
        return element;
    }
    if (
        element &&
        typeof element === 'object' &&
        (Symbol.iterator in element || 'length' in element)
    ) {
        return Array.from(element as ArrayLike<unknown> | Iterable<unknown>).find(
            (item): item is Element => item instanceof Element,
        );
    }
}

function firstHtmlElement(element?: unknown): HTMLElement | undefined {
    const node = firstElement(element);
    return node instanceof HTMLElement ? node : undefined;
}
