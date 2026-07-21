import {
    $,
    Animation,
    addClass,
    after,
    before,
    clamp,
    css,
    dimensions,
    height as getHeight,
    offset as getOffset,
    hasClass,
    index,
    intersectRect,
    isNumeric,
    isString,
    isVisible,
    noop,
    offsetPosition,
    parent,
    query,
    remove,
    removeClass,
    replaceClass,
    toFloat,
    toPx,
    toggleClass,
    trigger,
} from 'drake-util';
import { resize, scroll, viewport } from '../api/observables';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import Media from '../mixin/media';
import type { ComponentInternalInstance, ComponentValueMap } from '../types';
import { awaitFrame, awaitTimeout } from '../util/await';

type StickyProperty = boolean | number | string | Element;
type StickyDirection = 'up' | 'down';

type StickyData = ComponentValueMap & {
    resized?: boolean;
    height: number;
    width: number;
    margin: string | number;
    sticky: boolean;
    start: number;
    end: number;
    offset: number;
    overflow: number;
    elHeight: number;
    top: number;
    viewport: number;
    maxScrollHeight: number;
    scroll: number;
    prevScroll: number;
    dir: StickyDirection;
    prevDir: StickyDirection;
    below: boolean;
    offsetParentTop: number;
    overflowScroll: number;
    initScroll: number;
    initTimestamp: number;
};

interface StickyInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    _data: StickyData;
    position: 'top' | 'bottom';
    top: StickyProperty;
    bottom: StickyProperty;
    start: StickyProperty;
    end: StickyProperty;
    offset: string | number;
    offsetEnd: string | number;
    overflowFlip: boolean;
    animation: string;
    clsActive: string;
    clsInactive: string;
    clsFixed: string;
    clsBelow: string;
    selTarget: string;
    showOnUp: boolean;
    targetOffset: number | false;
    target: HTMLElement;
    placeholder: HTMLElement | null;
    isFixed: boolean;
    inactive: boolean;
    active: boolean;
    matchMedia: boolean;
    show(): void;
    hide(): void;
    update(): void;
    setActive(active: boolean): void;
}

export default defineComponent<StickyInstance>()({
    mixins: [Class, Media],

    props: {
        position: String,
        top: null,
        bottom: null,
        start: null,
        end: null,
        offset: String,
        offsetEnd: String,
        overflowFlip: Boolean,
        animation: String,
        clsActive: String,
        clsInactive: String,
        clsFixed: String,
        clsBelow: String,
        selTarget: String,
        showOnUp: Boolean,
        targetOffset: Number,
    },

    data: {
        position: 'top',
        top: false,
        bottom: false,
        start: false,
        end: false,
        offset: 0,
        offsetEnd: 0,
        overflowFlip: false,
        animation: '',
        clsActive: 'drk-active',
        clsInactive: '',
        clsFixed: 'drk-sticky-fixed',
        clsBelow: 'drk-sticky-below',
        selTarget: '',
        showOnUp: false,
        targetOffset: false,
    },

    computed: {
        target: ({ selTarget }: { selTarget: string }, $el: HTMLElement) =>
            (selTarget && $<HTMLElement>(selTarget, $el)) || $el,
    },

    connected() {
        this.start = coerce(this.start || this.top);
        this.end = coerce(this.end || this.bottom);

        this.placeholder =
            $<HTMLElement>('+ .drk-sticky-placeholder', this.$el) || createPlaceholder();
        this.isFixed = false;
        this.setActive(false);
    },

    beforeDisconnect() {
        if (this.isFixed) {
            this.hide();
            removeClass(this.target, this.clsInactive);
        }
        reset(this.$el);

        remove(this.placeholder);
        this.placeholder = null;
    },

    observe: [
        viewport<StickyInstance>(),
        scroll<StickyInstance>({ target: () => getScrollingElement() }),
        resize<StickyInstance>({
            target: ({ $el }) => {
                const visibleParent = getVisibleParent($el);
                return visibleParent
                    ? [$el, visibleParent, getScrollingElement()]
                    : [$el, getScrollingElement()];
            },
            handler(entries: ResizeObserverEntry[]): void {
                this.$emit(
                    this._data.resized &&
                        entries.some(({ target }) => target === getVisibleParent(this.$el))
                        ? 'update'
                        : 'resize',
                );
                this._data.resized = true;
            },
        }),
    ],

    events: [
        {
            name: 'load hashchange popstate',

            el: () => window,

            filter: ({ targetOffset }) => targetOffset !== false,

            async handler(): Promise<void> {
                const scrollingElement = getScrollingElement();

                if (!location.hash || scrollingElement.scrollTop === 0) {
                    return;
                }

                await awaitTimeout();

                const targetOffset = getOffset($(location.hash));
                const elOffset = getOffset(this.$el);

                if (this.isFixed && intersectRect(targetOffset, elOffset)) {
                    const referenceElement = this.placeholder ?? this.$el;
                    scrollingElement.scrollTop = Math.ceil(
                        targetOffset.top -
                            elOffset.height -
                            toPx(this.targetOffset, 'height', referenceElement) -
                            toPx(this.offset, 'height', referenceElement),
                    );
                }
            },
        },
    ],

    update: [
        {
            read(
                { height, width, margin, sticky }: StickyData,
                types: ReadonlySet<string>,
            ): Partial<StickyData> | undefined {
                this.inactive = !this.matchMedia || !isVisible(this.$el) || !this.$el.offsetHeight;

                if (this.inactive) {
                    return;
                }

                const dynamicViewport = getHeight(window);
                const maxScrollHeight = Math.max(
                    0,
                    getScrollingElement().scrollHeight - dynamicViewport,
                );

                if (!maxScrollHeight) {
                    this.inactive = true;
                    return;
                }

                const hide = this.isFixed && types.has('update');
                if (hide) {
                    preventTransition(this.target);
                    this.hide();
                }

                if (!this.active) {
                    ({ height, width } = dimensions(this.$el));
                    margin = css(this.$el, 'margin');
                }

                if (hide) {
                    this.show();
                }

                const viewport = toPx('100vh', 'height');

                let position = this.position;
                if (this.overflowFlip && height > viewport) {
                    position = position === 'top' ? 'bottom' : 'top';
                }

                const referenceElement = (this.isFixed ? this.placeholder : this.$el) || this.$el;
                const [initialOffset = 0, offsetEnd = 0] = [this.offset, this.offsetEnd].map(
                    (value) => toPx(value, 'height', sticky ? this.$el : referenceElement),
                );
                let offset = initialOffset;

                if (position === 'bottom' && (height < dynamicViewport || this.overflowFlip)) {
                    offset += dynamicViewport - height;
                }

                const elementBox = height + offset + offsetEnd;
                const overflow = this.overflowFlip ? 0 : Math.max(0, elementBox - viewport);
                const topOffset =
                    getOffset(referenceElement).top -
                    // offset possible `transform: translateY` animation 'drk-animation-slide-top' while hiding
                    new DOMMatrix(css(referenceElement, 'transform')).m42;
                const elHeight = dimensions(this.$el).height;

                const start =
                    (this.start === false
                        ? topOffset
                        : parseProp(this.start, this.$el, topOffset)) - offset;
                const end =
                    this.end === false
                        ? maxScrollHeight
                        : Math.min(
                              maxScrollHeight,
                              parseProp(this.end, this.$el, topOffset + height, true) -
                                  elHeight -
                                  offset +
                                  overflow,
                          );

                sticky =
                    !this.showOnUp &&
                    start + offset === topOffset &&
                    end ===
                        Math.min(
                            maxScrollHeight,
                            parseProp(true, this.$el, 0, true) - elHeight - offset + overflow,
                        ) &&
                    css(getVisibleParent(this.$el), 'overflowY') !== 'hidden';

                return {
                    start,
                    end,
                    offset,
                    overflow,
                    height,
                    elHeight,
                    width,
                    margin,
                    top: offsetPosition(referenceElement)[0],
                    sticky,
                    viewport,
                    maxScrollHeight,
                };
            },

            write({ height, width, margin, offset, sticky }: StickyData): void {
                if (this.inactive || sticky || !this.isFixed) {
                    reset(this.$el);
                }

                if (this.inactive) {
                    return;
                }

                if (sticky) {
                    height = width = margin = 0;
                    css(this.$el, { position: 'sticky', top: offset });
                }

                const { placeholder } = this;
                if (!placeholder) {
                    return;
                }

                css(placeholder, { height, width, margin });

                if (
                    parent(placeholder) !== parent(this.$el) ||
                    sticky !== index(placeholder) < index(this.$el)
                ) {
                    (sticky ? before : after)(this.$el, placeholder);
                    placeholder.hidden = true;
                }
            },

            events: ['resize'],
        },

        {
            read({
                scroll: prevScroll = 0,
                dir: prevDir = 'down',
                overflow,
                overflowScroll = 0,
                start,
                end,
                elHeight,
                height,
                sticky,
                maxScrollHeight,
            }: StickyData): Partial<StickyData> {
                const scroll = Math.min(getScrollingElement().scrollTop, maxScrollHeight);
                const dir = prevScroll <= scroll ? 'down' : 'up';
                const referenceElement = (this.isFixed ? this.placeholder : this.$el) || this.$el;

                return {
                    dir,
                    prevDir,
                    scroll,
                    prevScroll,
                    below:
                        scroll >
                        getOffset(referenceElement).top +
                            (sticky ? Math.min(height, elHeight) : height),
                    offsetParentTop: getOffset(referenceElement.offsetParent).top,
                    overflowScroll: clamp(
                        overflowScroll + clamp(scroll, start, end) - clamp(prevScroll, start, end),
                        0,
                        overflow,
                    ),
                };
            },

            write(data: StickyData, types: ReadonlySet<string>): void {
                const isScrollUpdate = types.has('scroll');
                const {
                    initTimestamp = 0,
                    dir,
                    prevDir,
                    scroll,
                    prevScroll = 0,
                    top,
                    start,
                    below,
                } = data;

                if (
                    scroll < 0 ||
                    (scroll === prevScroll && isScrollUpdate) ||
                    (this.showOnUp && !isScrollUpdate && !this.isFixed)
                ) {
                    return;
                }

                const now = Date.now();
                if (now - initTimestamp > 300 || dir !== prevDir) {
                    data.initScroll = scroll;
                    data.initTimestamp = now;
                }

                if (
                    this.showOnUp &&
                    !this.isFixed &&
                    Math.abs(data.initScroll - scroll) <= 30 &&
                    Math.abs(prevScroll - scroll) <= 10
                ) {
                    return;
                }

                if (
                    this.inactive ||
                    scroll < start ||
                    (this.showOnUp &&
                        (scroll <= start ||
                            (dir === 'down' && isScrollUpdate) ||
                            (dir === 'up' && !this.isFixed && !below)))
                ) {
                    if (!this.isFixed) {
                        if (Animation.inProgress(this.$el) && top > scroll) {
                            Animation.cancel(this.$el);
                            this.hide();
                        }

                        return;
                    }

                    if (this.animation && below) {
                        if (hasClass(this.$el, 'drk-animation-leave')) {
                            return;
                        }
                        Animation.out(this.$el, this.animation).then(() => this.hide(), noop);
                    } else {
                        this.hide();
                    }
                } else if (this.isFixed) {
                    this.update();
                } else if (this.animation && below) {
                    this.show();
                    Animation.in(this.$el, this.animation).catch(noop);
                } else {
                    preventTransition(this.target);
                    this.show();
                }
            },

            events: ['resize', 'resizeViewport', 'scroll'],
        },
    ],

    methods: {
        show(): void {
            this.isFixed = true;
            this.update();
            if (this.placeholder) {
                this.placeholder.hidden = false;
            }
        },

        hide(): void {
            const { offset, sticky } = this._data;
            this.setActive(false);
            removeClass(this.$el, this.clsFixed, this.clsBelow);
            if (sticky) {
                css(this.$el, 'top', offset);
            } else {
                reset(this.$el);
            }
            if (this.placeholder) {
                this.placeholder.hidden = true;
            }
            this.isFixed = false;
        },

        update(): void {
            const {
                width,
                scroll = 0,
                overflow,
                overflowScroll = 0,
                start,
                end,
                offset: initialOffset,
                offsetParentTop,
                sticky,
                below,
            } = this._data;
            let offset = initialOffset;
            const active = start !== 0 || scroll > start;

            if (!sticky) {
                let position = 'fixed';

                if (scroll > end) {
                    offset += end - offsetParentTop + overflowScroll - overflow;
                    position = 'absolute';
                }

                css(this.$el, { position, width, marginTop: 0 }, 'important');
            }

            css(this.$el, 'top', offset - overflowScroll);

            this.setActive(active);
            toggleClass(this.$el, this.clsBelow, below);
            addClass(this.$el, this.clsFixed);
        },

        setActive(active: boolean): void {
            const prev = this.active;
            this.active = active;
            if (active) {
                replaceClass(this.target, this.clsInactive, this.clsActive);
                if (prev !== active) {
                    trigger(this.$el, 'active');
                }
            } else {
                replaceClass(this.target, this.clsActive, this.clsInactive);
                if (prev !== active) {
                    preventTransition(this.target);
                    trigger(this.$el, 'inactive');
                }
            }
        },
    },
});

function parseProp(
    value: StickyProperty,
    el: HTMLElement,
    propOffset: number,
    padding = false,
): number {
    if (!value) {
        return 0;
    }

    if (isNumeric(value) || (isString(value) && value.match(/^-?\d/))) {
        return propOffset + toPx(value, 'height', el, true);
    } else {
        const refElement = value === true ? getVisibleParent(el) : query(value, el);
        return (
            getOffset(refElement).bottom -
            (padding && refElement?.contains(el)
                ? toFloat(css(refElement, 'paddingBottom')) +
                  toFloat(css(refElement, 'borderBottomWidth'))
                : 0)
        );
    }
}

function coerce(value: StickyProperty): StickyProperty {
    if (value === 'true') {
        return true;
    } else if (value === 'false') {
        return false;
    }
    return value;
}

function reset(el: HTMLElement): void {
    css(el, { position: '', top: '', marginTop: '', width: '' });
}

const clsTransitionDisable = 'drk-transition-disable';
async function preventTransition(element: Element): Promise<void> {
    if (!hasClass(element, clsTransitionDisable)) {
        addClass(element, clsTransitionDisable);
        await awaitFrame();
        removeClass(element, clsTransitionDisable);
    }
}

function getVisibleParent(element: Element): HTMLElement | undefined {
    let current = parent(element);
    while (current) {
        if (isVisible(current)) {
            return current;
        }
        current = parent(current);
    }
}

function getScrollingElement(): HTMLElement {
    return document.scrollingElement instanceof HTMLElement
        ? document.scrollingElement
        : document.documentElement;
}

function createPlaceholder(): HTMLDivElement {
    const placeholder = document.createElement('div');
    placeholder.className = 'drk-sticky-placeholder';
    return placeholder;
}
