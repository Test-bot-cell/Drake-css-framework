import {
    $,
    $$,
    MouseTracker,
    addClass,
    append,
    attr,
    css,
    hasClass,
    includes,
    isSameSiteAnchor,
    isTouch,
    matches,
    observeResize,
    observeViewportResize,
    offset,
    offsetViewport,
    on,
    once,
    overflowParents,
    parent,
    pointerCancel,
    pointerDown,
    pointerEnter,
    pointerLeave,
    pointerUp,
    query,
    removeClass,
} from 'drake-util';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import Container from '../mixin/container';
import { maybeDefaultPreventClick } from '../mixin/event';
import Position, { storeScrollPosition } from '../mixin/position';
import Togglable from '../mixin/togglable';
import type {
    Axis,
    ComponentInternalInstance,
    CssProperties,
    ElementInput,
    FrameworkEvent,
    Rect,
    Side,
    Teardown,
} from '../types';
import { keyMap } from '../util/keys';
import { preventBackgroundScroll } from '../util/scroll';

type DropReference = Element | Window | undefined;
type DropPair = [DropReference, DropReference];
type DropSelector = boolean | string | Element | null | undefined;

interface DropProps {
    boundary: DropSelector;
    boundaryX: DropSelector;
    boundaryY: DropSelector;
    target: DropSelector;
    targetX: DropSelector;
    targetY: DropSelector;
}

export interface DropInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    mode: string | string[];
    toggle: boolean | string;
    boundary: DropPair;
    target: DropPair;
    targetEl?: HTMLElement | null;
    stretch: boolean | Axis | Axis[];
    delayShow: number;
    delayHide: number;
    autoUpdate: boolean;
    animateOut: boolean;
    bgScroll: boolean;
    closeOnScroll: boolean;
    selClose: string;
    clsEnter: string;
    container: Element | false | '' | undefined;
    tracker: MouseTracker;
    _style: CssProperties;
    showTimer: ReturnType<typeof setTimeout> | null;
    hideTimer: ReturnType<typeof setTimeout> | null;
    isDelayedHide: boolean;
    axis: Axis;
    inset: boolean;
    show(target?: HTMLElement | null, delay?: boolean): void;
    hide(delay?: boolean, animate?: boolean): void;
    clearTimers(): void;
    isActive(): boolean;
    isDelaying(): boolean;
    isToggled(element?: ElementInput): boolean;
    toggleElement(target: ElementInput, toggle: boolean, animate?: boolean): Promise<boolean>;
    position(): void;
    positionAt(element: Element, target: DropPair, boundary: DropPair): void;
    getViewportOffset(element: Element): number;
    getPositionOffset(element?: Element): number;
}

type DropPointerEvent = FrameworkEvent<Element> & { relatedTarget?: EventTarget | null };
type DropDirection = readonly [Axis, 'width' | 'height', Side, Side];

export let active: DropInstance | null | undefined;

export default defineComponent<DropInstance>()({
    mixins: [Class, Container, Position, Togglable],

    args: 'pos',

    props: {
        mode: 'list',
        toggle: Boolean,
        boundary: Boolean,
        boundaryX: Boolean,
        boundaryY: Boolean,
        target: Boolean,
        targetX: Boolean,
        targetY: Boolean,
        stretch: Boolean,
        delayShow: Number,
        delayHide: Number,
        autoUpdate: Boolean,
        animateOut: Boolean,
        bgScroll: Boolean,
        closeOnScroll: Boolean,
    },

    data: {
        mode: ['click', 'hover'],
        toggle: '- *',
        boundary: false,
        boundaryX: false,
        boundaryY: false,
        target: false,
        targetX: false,
        targetY: false,
        stretch: false,
        delayShow: 0,
        delayHide: 800,
        autoUpdate: true,
        animateOut: false,
        bgScroll: true,
        animation: ['drk-animation-fade'],
        cls: 'drk-open',
        container: false,
        closeOnScroll: false,
        selClose: '.drk-drop-close',
    },

    computed: {
        boundary({ boundary, boundaryX, boundaryY }: DropProps, $el: Element): DropPair {
            return [
                resolveReference(boundaryX || boundary, $el) || window,
                resolveReference(boundaryY || boundary, $el) || window,
            ];
        },

        target({ target, targetX, targetY }: DropProps, $el: Element): DropPair {
            targetX ||= target || this.targetEl;
            targetY ||= target || this.targetEl;

            return [
                targetX === true ? window : resolveReference(targetX, $el),
                targetY === true ? window : resolveReference(targetY, $el),
            ];
        },
    },

    created() {
        this.tracker = new MouseTracker();
    },

    connected() {
        addClass(this.$el, 'drk-drop');

        if (this.toggle && !this.targetEl) {
            this.targetEl = createToggleComponent(this);
        }
        attr(this.targetEl, 'aria-expanded', false);

        this._style = {
            width: this.$el.style.width,
            height: this.$el.style.height,
        };
    },

    disconnected() {
        if (this.isActive()) {
            this.hide(false);
            active = null;
        }
        css(this.$el, this._style);
    },

    events: [
        {
            name: 'click',

            delegate: ({ selClose }: DropInstance) => selClose,

            handler(e: FrameworkEvent<Element>) {
                maybeDefaultPreventClick(e);
                this.hide(false);
            },
        },

        {
            name: 'click',

            delegate: () => 'a[href*="#"]',

            handler({ defaultPrevented, current }: FrameworkEvent<Element>) {
                if (!(current instanceof HTMLAnchorElement)) {
                    return;
                }
                const { hash } = current;
                if (
                    !defaultPrevented &&
                    hash &&
                    isSameSiteAnchor(current) &&
                    !this.$el.contains($(hash) ?? null)
                ) {
                    this.hide(false);
                }
            },
        },

        {
            name: 'beforescroll',

            handler() {
                this.hide(false);
            },
        },

        {
            name: 'toggle',

            self: true,

            handler(e: FrameworkEvent, toggle: unknown) {
                e.preventDefault();

                if (this.isToggled()) {
                    this.hide(false);
                } else {
                    this.show(getToggleElement(toggle), false);
                }
            },
        },

        {
            name: 'toggleshow',

            self: true,

            handler(e: FrameworkEvent, toggle: unknown) {
                e.preventDefault();
                this.show(getToggleElement(toggle));
            },
        },

        {
            name: 'togglehide',

            self: true,

            handler(e: FrameworkEvent) {
                e.preventDefault();
                if (!matches(this.$el, ':focus,:hover')) {
                    this.hide();
                }
            },
        },

        {
            name: `${pointerEnter} focusin`,

            filter: ({ mode }: DropInstance) => includes(mode, 'hover'),

            handler(e: DropPointerEvent) {
                if (!isTouch(e)) {
                    this.clearTimers();
                }
            },
        },

        {
            name: `${pointerLeave} focusout`,

            filter: ({ mode }: DropInstance) => includes(mode, 'hover'),

            handler(e: DropPointerEvent) {
                if (!isTouch(e) && e.relatedTarget) {
                    this.hide();
                }
            },
        },

        {
            name: 'toggled',

            self: true,

            handler(_event: FrameworkEvent, toggled: unknown) {
                if (toggled) {
                    this.clearTimers();
                    this.position();
                }
            },
        },

        {
            name: 'show',

            self: true,

            handler() {
                setActive(this);

                this.tracker.init();
                attr(this.targetEl, 'aria-expanded', true);

                const handlers = [
                    listenForResize(this),
                    listenForEscClose(this),
                    listenForBackgroundClose(this),
                    this.autoUpdate && listenForScroll(this),
                    this.closeOnScroll && listenForScrollClose(this),
                ];

                once(this.$el, 'hide', () => handlers.forEach((handler) => handler && handler()), {
                    self: true,
                });

                if (!this.bgScroll) {
                    once(this.$el, 'hidden', preventBackgroundScroll(this.$el), { self: true });
                }
            },
        },

        {
            name: 'beforehide',

            self: true,

            handler() {
                this.clearTimers();
            },
        },

        {
            name: 'hide',

            handler({ target }: FrameworkEvent<Element>) {
                if (this.$el !== target) {
                    active =
                        active === null && this.$el.contains(target) && this.isToggled()
                            ? this
                            : active;
                    return;
                }

                active = this.isActive() ? null : active;
                this.tracker.cancel();
                attr(this.targetEl, 'aria-expanded', false);
            },
        },
    ],

    update: {
        write() {
            if (this.isToggled() && !hasClass(this.$el, this.clsEnter)) {
                this.position();
            }
        },
    },

    methods: {
        show(target?: HTMLElement | null, delay = true) {
            if (target === undefined) {
                target = this.targetEl;
            }
            if (this.isToggled() && target && this.targetEl && target !== this.targetEl) {
                this.hide(false, false);
            }

            this.targetEl = target;

            this.clearTimers();

            if (this.isActive()) {
                return;
            }

            if (active) {
                if (delay && active.isDelaying()) {
                    this.showTimer = setTimeout(() => matches(target, ':hover') && this.show(), 10);
                    return;
                }

                let prev: DropInstance | null | undefined;
                while (active && prev !== active && !active.$el.contains(this.$el)) {
                    prev = active;
                    active.hide(false, false);
                }
                delay = false;
            }

            if (this.container && parent(this.$el) !== this.container) {
                append(this.container, this.$el);
            }

            // Mark enter early so isToggled() detects show when using delayShow
            addClass(this.$el, this.clsEnter);

            this.showTimer = setTimeout(
                () => this.toggleElement(this.$el, true),
                (delay && this.delayShow) || 0,
            );
        },

        hide(delay = true, animate = true) {
            const hide = () => {
                // Ensure enter class is removed if show is canceled early
                removeClass(this.$el, this.clsEnter);
                this.toggleElement(this.$el, false, this.animateOut && animate);
            };

            this.clearTimers();

            this.isDelayedHide = delay;

            if (delay && this.isDelaying()) {
                this.hideTimer = setTimeout(this.hide, 50);
            } else if (delay && this.delayHide) {
                this.hideTimer = setTimeout(hide, this.delayHide);
            } else {
                hide();
            }
        },

        clearTimers() {
            clearTimeout(this.showTimer ?? undefined);
            clearTimeout(this.hideTimer ?? undefined);
            this.showTimer = null;
            this.hideTimer = null;
        },

        isActive() {
            return active === this;
        },

        isDelaying() {
            return [this.$el, ...$$('.drk-drop', this.$el)].some((el) => this.tracker.movesTo(el));
        },

        position() {
            const restoreScrollPosition = storeScrollPosition(this.$el);

            removeClass(this.$el, 'drk-drop-stack');
            css(this.$el, this._style);

            // Ensure none positioned element does not generate scrollbars
            this.$el.hidden = true;

            const viewports: [Rect, Rect] = [
                getViewport(this.$el, this.target[0]),
                getViewport(this.$el, this.target[1]),
            ];
            const viewportOffset = this.getViewportOffset(this.$el);

            const dirs: ReadonlyArray<readonly [0 | 1, DropDirection]> = [
                [0, ['x', 'width', 'left', 'right']],
                [1, ['y', 'height', 'top', 'bottom']],
            ];

            for (const [i, [axis, prop]] of dirs) {
                if (this.axis !== axis && includes([axis, true], this.stretch)) {
                    css(this.$el, {
                        [prop]: Math.min(
                            offset(this.boundary[i])[prop],
                            viewports[i][prop] - 2 * viewportOffset,
                        ),
                        [`overflow-${axis}`]: 'auto',
                    });
                }
            }

            const maxWidth = viewports[0].width - 2 * viewportOffset;

            this.$el.hidden = false;

            css(this.$el, 'maxWidth', '');

            if (this.$el.offsetWidth > maxWidth) {
                addClass(this.$el, 'drk-drop-stack');
            }

            css(this.$el, 'maxWidth', maxWidth);

            this.positionAt(this.$el, this.target, this.boundary);

            for (const [i, [axis, prop, start, end]] of dirs) {
                if (this.axis === axis && includes([axis, true], this.stretch)) {
                    const positionOffset = Math.abs(this.getPositionOffset());
                    const targetOffset = offset(this.target[i]);
                    const elOffset = offset(this.$el);

                    css(this.$el, {
                        [prop]:
                            (targetOffset[start] > elOffset[start]
                                ? targetOffset[this.inset ? end : start] -
                                  Math.max(
                                      offset(this.boundary[i])[start],
                                      viewports[i][start] + viewportOffset,
                                  )
                                : Math.min(
                                      offset(this.boundary[i])[end],
                                      viewports[i][end] - viewportOffset,
                                  ) - targetOffset[this.inset ? start : end]) - positionOffset,
                        [`overflow-${axis}`]: 'auto',
                    });

                    this.positionAt(this.$el, this.target, this.boundary);
                }
            }

            restoreScrollPosition();
        },
    },
});

function resolveReference(value: DropSelector, context: Element): Element | undefined {
    return value instanceof Element
        ? value
        : typeof value === 'string'
          ? query(value, context)
          : undefined;
}

function setActive(drop: DropInstance): void {
    active = drop;
}

function getViewport(el: Element, target: DropReference) {
    const viewport =
        target instanceof Element
            ? overflowParents(target).find((ancestor) => ancestor.contains(el))
            : undefined;
    return offsetViewport(viewport);
}

function getToggleElement(value: unknown): HTMLElement | undefined {
    if (typeof value !== 'object' || value === null || !('$el' in value)) {
        return undefined;
    }
    return value.$el instanceof HTMLElement ? value.$el : undefined;
}

function createToggleComponent(drop: DropInstance): HTMLElement | undefined {
    const el = typeof drop.toggle === 'string' ? query(drop.toggle, drop.$el) : undefined;

    if (el) {
        drop.$create('toggle', el, { target: drop.$el, mode: drop.mode });
        el.ariaHasPopup = 'true';
    }

    return el;
}

function listenForResize(drop: DropInstance): Teardown {
    const update = () => drop.$emit();
    const resizeTargets = drop.target.filter(
        (target): target is HTMLElement => target instanceof HTMLElement,
    );
    const off = [
        observeViewportResize(update),
        observeResize(overflowParents(drop.$el).concat(resizeTargets), update),
    ];
    return () => off.map((observer) => observer.disconnect());
}

function listenForScroll(drop: DropInstance, fn: () => void = () => drop.$emit()): Teardown {
    return on([document, ...overflowParents(drop.$el)], 'scroll', fn, {
        passive: true,
    });
}

function listenForEscClose(drop: DropInstance): Teardown {
    return on(document, 'keydown', (e: FrameworkEvent & { keyCode?: number }) => {
        if (e.keyCode === keyMap.ESC) {
            drop.hide(false);
        }
    });
}

function listenForScrollClose(drop: DropInstance): Teardown {
    return listenForScroll(drop, () => drop.hide(false));
}

function listenForBackgroundClose(drop: DropInstance): Teardown {
    return on(document, pointerDown, ({ target }: FrameworkEvent) => {
        if (target instanceof Node && drop.$el.contains(target)) {
            return;
        }

        once(
            document,
            `${pointerUp} ${pointerCancel} scroll`,
            ({ defaultPrevented, type, target: newTarget }: FrameworkEvent) => {
                if (
                    !defaultPrevented &&
                    type === pointerUp &&
                    target === newTarget &&
                    !(target instanceof Node && drop.targetEl?.contains(target))
                ) {
                    drop.hide(false);
                }
            },
            true,
        );
    });
}
