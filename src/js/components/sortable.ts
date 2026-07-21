import {
    $$,
    addClass,
    append,
    assign,
    attr,
    before,
    children,
    css,
    dimensions,
    findIndex,
    getEventPos,
    height,
    index,
    isInput,
    isTag,
    off,
    offsetViewport,
    on,
    parent,
    pointerDown,
    pointerMove,
    pointerUp,
    pointInRect,
    remove,
    removeClass,
    resetProps,
    scrollParents,
    toggleClass,
    Transition,
    trigger,
} from 'uikit-util';
import { defineComponent } from '../api/options';
import Animate from '../mixin/animate';
import Class from '../mixin/class';
import type { ComponentInternalInstance, ComponentValueMap, FrameworkEvent, Point } from '../types';

interface SortableOrigin extends Point {
    target: Node;
    index: number;
    offsetTop?: number;
    offsetLeft?: number;
}

type SortableUpdateData = ComponentValueMap & { moved?: HTMLElement };

interface SortableInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    group: string | false;
    threshold: number;
    clsItem: string;
    clsPlaceholder: string;
    clsDrag: string;
    clsDragState: string;
    clsBase: string;
    clsNoDrag: string;
    clsEmpty: string;
    clsCustom: string;
    handle: string | false;
    pos: Point;
    target: HTMLElement;
    items: HTMLElement[];
    isEmpty: boolean;
    handles: HTMLElement[];
    drag: HTMLElement | null | undefined;
    placeholder: HTMLElement;
    origin: SortableOrigin;
    touched: Set<SortableInstance> | null;
    animate(action: () => unknown, target?: HTMLElement): Promise<void>;
    init(event: FrameworkEvent): void;
    start(event: FrameworkEvent): void;
    move(event: FrameworkEvent): void;
    end(): void;
    insert(element: HTMLElement, target?: Element | null): void;
    remove(element: HTMLElement): void;
    getSortable(element: Element | null): SortableInstance | undefined;
}

export default defineComponent<SortableInstance>()({
    mixins: [Class, Animate],

    props: {
        group: String,
        threshold: Number,
        clsItem: String,
        clsPlaceholder: String,
        clsDrag: String,
        clsDragState: String,
        clsBase: String,
        clsNoDrag: String,
        clsEmpty: String,
        clsCustom: String,
        handle: String,
    },

    data: {
        group: false,
        threshold: 5,
        clsItem: 'uk-sortable-item',
        clsPlaceholder: 'uk-sortable-placeholder',
        clsDrag: 'uk-sortable-drag',
        clsDragState: 'uk-drag',
        clsBase: 'uk-sortable',
        clsNoDrag: 'uk-sortable-nodrag',
        clsEmpty: 'uk-sortable-empty',
        clsCustom: '',
        handle: false,
        pos: {},
    },

    events: {
        name: pointerDown,
        passive: false,
        handler(e: FrameworkEvent) {
            this.init(e);
        },
    },

    computed: {
        target: (_props: ComponentValueMap, $el: HTMLElement) =>
            $el instanceof HTMLTableElement ? ($el.tBodies[0] ?? $el) : $el,

        items(): HTMLElement[] {
            return children(this.target).filter(
                (item): item is HTMLElement => item instanceof HTMLElement,
            );
        },

        isEmpty() {
            return !this.items.length;
        },

        handles({ handle }: { handle: string | false }, $el: HTMLElement) {
            return handle ? $$(handle, $el) : this.items;
        },
    },

    watch: {
        isEmpty(empty: unknown) {
            toggleClass(this.target, this.clsEmpty, Boolean(empty));
        },

        handles(handles: unknown, prev: unknown) {
            const props = { touchAction: 'none', userSelect: 'none' };
            resetProps(toHtmlElements(prev), props);
            css(toHtmlElements(handles), props);
        },
    },

    update: {
        write(data: SortableUpdateData) {
            if (!this.drag || !parent(this.placeholder)) {
                return;
            }

            const {
                pos: { x, y },
                origin: { offsetTop, offsetLeft },
                placeholder,
            } = this;
            if (offsetTop === undefined || offsetLeft === undefined) {
                return;
            }

            css(this.drag, {
                top: y - offsetTop,
                left: x - offsetLeft,
            });

            const sortable = this.getSortable(document.elementFromPoint(x, y));

            if (!sortable) {
                return;
            }

            const { items } = sortable;

            if (items.some(Transition.inProgress)) {
                return;
            }

            const target = findTarget(items, { x, y });

            if (items.length && (!target || target === placeholder)) {
                return;
            }

            const previous = this.getSortable(placeholder);
            if (!previous) {
                return;
            }
            const insertTarget = findInsertTarget(
                sortable.target,
                target,
                placeholder,
                { x, y },
                sortable === previous && data.moved !== target,
            );

            if (insertTarget === false) {
                return;
            }

            if (insertTarget && placeholder === insertTarget) {
                return;
            }

            if (sortable !== previous) {
                previous.remove(placeholder);
                data.moved = target;
            } else {
                delete data.moved;
            }

            sortable.insert(placeholder, insertTarget);

            this.touched?.add(sortable);
        },

        events: ['move'],
    },

    methods: {
        init(e: FrameworkEvent) {
            const { target, defaultPrevented } = e;
            if (!(target instanceof Node)) {
                return;
            }
            const targetElement = target instanceof Element ? target : target.parentElement;
            if (!targetElement) {
                return;
            }
            const button = e instanceof MouseEvent ? e.button : 0;
            const [placeholder] = this.items.filter((el) => el.contains(target));

            if (
                !placeholder ||
                defaultPrevented ||
                button > 0 ||
                (target instanceof Element && isInput(target)) ||
                targetElement.closest(`.${this.clsNoDrag}`) ||
                (this.handle && !targetElement.closest(this.handle))
            ) {
                return;
            }

            e.preventDefault();

            this.pos = getEventPos(e);
            this.touched = new Set([this]);
            this.placeholder = placeholder;
            this.origin = { target, index: index(placeholder), ...this.pos };

            on(document, pointerMove, this.move);
            on(document, pointerUp, this.end);

            if (!this.threshold) {
                this.start(e);
            }
        },

        start(e: FrameworkEvent) {
            this.drag = appendDrag(this.$container, this.placeholder);
            const { left, top } = dimensions(this.placeholder);
            assign(this.origin, { offsetLeft: this.pos.x - left, offsetTop: this.pos.y - top });

            addClass(this.drag, this.clsDrag, this.clsCustom);
            addClass(this.placeholder, this.clsPlaceholder);
            addClass(this.items, this.clsItem);
            addClass(document.documentElement, this.clsDragState);

            trigger(this.$el, 'start', [this, this.placeholder]);

            trackScroll(this.pos);

            this.move(e);
        },

        move: throttle(function (this: SortableInstance, e: FrameworkEvent) {
            assign(this.pos, getEventPos(e));

            if (
                !this.drag &&
                (Math.abs(this.pos.x - this.origin.x) > this.threshold ||
                    Math.abs(this.pos.y - this.origin.y) > this.threshold)
            ) {
                this.start(e);
            }
            this.$emit('move');
        }),

        end() {
            off(document, pointerMove, this.move);
            off(document, pointerUp, this.end);

            if (!this.drag) {
                return;
            }

            untrackScroll();

            const sortable = this.getSortable(this.placeholder);
            if (!sortable) {
                return;
            }

            if (this === sortable) {
                if (this.origin.index !== index(this.placeholder)) {
                    trigger(this.$el, 'moved', [this, this.placeholder]);
                }
            } else {
                trigger(sortable.$el, 'added', [sortable, this.placeholder]);
                trigger(this.$el, 'removed', [this, this.placeholder]);
            }

            trigger(this.$el, 'stop', [this, this.placeholder]);

            remove(this.drag);
            this.drag = null;

            const touched = this.touched;
            for (const { clsPlaceholder, clsItem } of touched ?? []) {
                for (const sortable of touched ?? []) {
                    removeClass(sortable.items, clsPlaceholder, clsItem);
                }
            }
            this.touched = null;
            removeClass(document.documentElement, this.clsDragState);
        },

        insert(element: HTMLElement, target?: Element | null) {
            addClass(this.items, this.clsItem);

            if (target && target.previousElementSibling !== element) {
                this.animate(() => before(target, element));
            } else if (!target && this.target.lastElementChild !== element) {
                this.animate(() => append(this.target, element));
            }
        },

        remove(element: HTMLElement) {
            if (this.target.contains(element)) {
                this.animate(() => remove(element));
            }
        },

        getSortable(element: Element | null): SortableInstance | undefined {
            let current = element;
            while (current) {
                const sortable = this.$getComponent(current, 'sortable');

                if (
                    isSortable(sortable) &&
                    (sortable === this || (this.group !== false && sortable.group === this.group))
                ) {
                    return sortable;
                }
                current = parent(current) ?? null;
            }
        },
    },
});

let trackTimer: number | undefined;
function trackScroll(pos: Point): void {
    let last = Date.now();
    trackTimer = setInterval(() => {
        const { x } = pos;
        let { y } = pos;
        y += document.scrollingElement?.scrollTop ?? 0;

        const dist = (Date.now() - last) * 0.3;
        last = Date.now();

        scrollParents(document.elementFromPoint(x, pos.y))
            .reverse()
            .some((scrollEl) => {
                let { scrollTop: scroll } = scrollEl;
                const { scrollHeight } = scrollEl;

                const { top, bottom, height } = offsetViewport(scrollEl);

                if (top < y && top + 35 > y) {
                    scroll -= dist;
                } else if (bottom > y && bottom - 35 < y) {
                    scroll += dist;
                } else {
                    return false;
                }

                if (scroll > 0 && scroll < scrollHeight - height) {
                    scrollEl.scrollTop = scroll;
                    return true;
                }
                return false;
            });
    }, 15);
}

function untrackScroll(): void {
    clearInterval(trackTimer);
}

function appendDrag(container: Element, element: HTMLElement): HTMLElement {
    let clone: HTMLElement;
    if (isTag(element, 'li', 'tr')) {
        clone = document.createElement('div');
        const clonedElement = element.cloneNode(true);
        if (!(clonedElement instanceof Element)) {
            throw new TypeError('Sortable drag source clone must be an element');
        }
        append(clone, clonedElement.children);
        for (const attribute of element.getAttributeNames()) {
            attr(clone, attribute, element.getAttribute(attribute));
        }
    } else {
        const clonedNode = element.cloneNode(true);
        if (!(clonedNode instanceof HTMLElement)) {
            throw new TypeError('Sortable drag clone must be an HTML element');
        }
        clone = clonedNode;
    }

    append(container, clone);

    css(clone, 'margin', '0', 'important');
    css(clone, {
        boxSizing: 'border-box',
        width: element.offsetWidth,
        height: element.offsetHeight,
        padding: css(element, 'padding'),
    });

    height(clone.firstElementChild, height(element.firstElementChild));

    return clone;
}

function findTarget(items: HTMLElement[], point: Point): HTMLElement | undefined {
    return items[findIndex(items, (item) => pointInRect(point, dimensions(item)))];
}

function findInsertTarget(
    list: HTMLElement,
    target: HTMLElement | undefined,
    placeholder: HTMLElement,
    point: Point,
    sameList: boolean,
): Element | null | false | undefined {
    if (!children(list).length) {
        return;
    }
    if (!target) {
        return;
    }

    const rect = dimensions(target);
    if (!sameList) {
        if (!isHorizontal(list, placeholder)) {
            return point.y < rect.top + rect.height / 2 ? target : target.nextElementSibling;
        }

        return target;
    }

    const placeholderRect = dimensions(placeholder);
    const sameRow = linesIntersect(
        [rect.top, rect.bottom],
        [placeholderRect.top, placeholderRect.bottom],
    );

    const [pointerPos, lengthProp, startProp, endProp]: [
        number,
        'width' | 'height',
        'left' | 'top',
        'right' | 'bottom',
    ] = sameRow ? [point.x, 'width', 'left', 'right'] : [point.y, 'height', 'top', 'bottom'];

    const diff =
        placeholderRect[lengthProp] < rect[lengthProp]
            ? rect[lengthProp] - placeholderRect[lengthProp]
            : 0;

    if (placeholderRect[startProp] < rect[startProp]) {
        if (diff && pointerPos < rect[startProp] + diff) {
            return false;
        }

        return target.nextElementSibling;
    }

    if (diff && pointerPos > rect[endProp] - diff) {
        return false;
    }

    return target;
}

function isHorizontal(list: HTMLElement, placeholder: HTMLElement): boolean {
    const single = children(list).length === 1;

    if (single) {
        append(list, placeholder);
    }

    const items = children(list);
    const isHorizontal = items.some((el, i) => {
        const rectA = dimensions(el);
        return items.slice(i + 1).some((el) => {
            const rectB = dimensions(el);
            return !linesIntersect([rectA.left, rectA.right], [rectB.left, rectB.right]);
        });
    });

    if (single) {
        remove(placeholder);
    }

    return isHorizontal;
}

function linesIntersect(lineA: [number, number], lineB: [number, number]): boolean {
    return lineA[1] > lineB[0] && lineB[1] > lineA[0];
}

function throttle<I, Args extends unknown[]>(
    fn: (this: I, ...args: Args) => void,
): (this: I, ...args: Args) => void {
    let throttled = false;
    return function (this: I, ...args: Args): void {
        if (!throttled) {
            throttled = true;
            fn.call(this, ...args);
            requestAnimationFrame(() => (throttled = false));
        }
    };
}

function toHtmlElements(value: unknown): HTMLElement[] {
    return Array.isArray(value)
        ? value.filter((item): item is HTMLElement => item instanceof HTMLElement)
        : [];
}

function isSortable(instance: ComponentInternalInstance | undefined): instance is SortableInstance {
    return (
        Boolean(instance) &&
        typeof instance?.group !== 'undefined' &&
        typeof instance.insert === 'function' &&
        typeof instance.remove === 'function'
    );
}
