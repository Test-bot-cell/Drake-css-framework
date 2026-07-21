import {
    $,
    $$,
    addClass,
    after,
    css,
    findIndex,
    getIndex,
    hasClass,
    height,
    includes,
    isInput,
    isRtl,
    matches,
    noop,
    observeResize,
    offset,
    on,
    once,
    parents,
    pointerEnter,
    pointerLeave,
    pointerMove,
    query,
    remove,
    selFocusable,
    toFloat,
    Transition,
} from 'drake-util';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import Container from '../mixin/container';
import type {
    ComponentInternalInstance,
    ComponentValueMap,
    FrameworkEvent,
    ObservableHandle,
    Teardown,
} from '../types';
import { keyMap } from '../util/keys';
import { active, type DropInstance } from './drop';

type DropnavSelector = boolean | string | Element;

interface DropnavProps {
    dropbarAnchor: DropnavSelector;
    dropbar: DropnavSelector;
    clsDrop: string;
    selNavItem: string;
}

interface DropnavInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & { dropbar?: unknown };
    align: string;
    boundary: DropnavSelector;
    dropbarAnchor: HTMLElement;
    dropbar: HTMLElement | null;
    dropContainer: Element;
    dropdowns: HTMLElement[];
    items: HTMLElement[];
    duration: number;
    container: Element | false | '' | undefined;
    clsDrop: string;
    clsDropbar: string;
    selNavItem: string;
    flip: boolean;
    target: DropnavSelector;
    targetY: DropnavSelector;
    _dropbar?: HTMLElement;
    _observer?: ObservableHandle<Element>;
    getActive(): DropInstance | undefined;
    transitionTo(newHeight: number, element?: HTMLElement): Promise<void>;
    getDropdown(element: Element): DropInstance | undefined;
    isDropbarDrop(element: Element): boolean;
    getDropbarOffset(offsetTop: number): number;
    initializeDropdowns(): void;
}

type DropnavKeyboardEvent = FrameworkEvent<Element> & { keyCode?: number };

export default defineComponent<DropnavInstance>()({
    mixins: [Class, Container],

    props: {
        align: String,
        boundary: Boolean,
        dropbar: Boolean,
        dropbarAnchor: Boolean,
        duration: Number,
        mode: Boolean,
        offset: Boolean,
        stretch: Boolean,
        delayShow: Boolean,
        delayHide: Boolean,
        target: Boolean,
        targetX: Boolean,
        targetY: Boolean,
        animation: Boolean,
        animateOut: Boolean,
        closeOnScroll: Boolean,
    },

    data: {
        align: isRtl ? 'right' : 'left',
        clsDrop: 'drk-dropdown',
        clsDropbar: 'drk-dropnav-dropbar',
        boundary: true,
        dropbar: false,
        dropbarAnchor: false,
        flip: true,
        delayShow: 160,
        duration: 200,
        container: false,
        selNavItem: '> li > a, > ul > li > a',
    },

    computed: {
        dropbarAnchor: ({ dropbarAnchor }: DropnavProps, $el: HTMLElement) =>
            resolveDropnavElement(dropbarAnchor, $el) || $el,

        dropbar({ dropbar }: DropnavProps) {
            if (!dropbar) {
                return null;
            }

            const element =
                this._dropbar ||
                resolveDropnavElement(dropbar, this.$el) ||
                $(`+ .${this.clsDropbar}`, this.$el);

            return element || (this._dropbar = document.createElement('div'));
        },

        dropContainer(_props: DropnavProps, $el: Element) {
            return this.container || $el;
        },

        dropdowns({ clsDrop }: DropnavProps, $el: Element) {
            const dropdowns = $$<HTMLElement>(`.${clsDrop}`, $el);

            if (this.dropContainer !== $el) {
                for (const el of $$(`.${clsDrop}`, this.dropContainer)) {
                    const target = this.getDropdown(el)?.targetEl;
                    if (!includes(dropdowns, el) && target && this.$el.contains(target)) {
                        dropdowns.push(el);
                    }
                }
            }

            return dropdowns;
        },

        items({ selNavItem }: DropnavProps, $el: Element) {
            return $$<HTMLElement>(selNavItem, $el);
        },
    },

    watch: {
        dropbar(dropbar: HTMLElement | null) {
            addClass(
                dropbar,
                'drk-dropbar',
                'drk-dropbar-top',
                this.clsDropbar,
                `drk-${this.$options.name}-dropbar`,
            );
        },

        dropdowns() {
            this.initializeDropdowns();
        },
    },

    connected() {
        this.initializeDropdowns();

        preventInitialPointerEnter(this.$el);
    },

    disconnected() {
        remove(this._dropbar);
        delete this._dropbar;
    },

    events: [
        {
            name: 'mouseover focusin',

            delegate: ({ selNavItem }: DropnavInstance) => selNavItem,

            handler({ current }: FrameworkEvent<Element>) {
                const active = this.getActive();
                if (
                    active &&
                    includes(active.mode, 'hover') &&
                    active.targetEl &&
                    current &&
                    !current.contains(active.targetEl) &&
                    !active.isDelaying()
                ) {
                    active.hide(false);
                }
            },
        },

        {
            name: 'keydown',

            self: true,

            delegate: ({ selNavItem }: DropnavInstance) => selNavItem,

            handler(e: DropnavKeyboardEvent) {
                const { current, keyCode } = e;
                const active = this.getActive();

                if (keyCode === keyMap.DOWN) {
                    if (active && active.targetEl === current) {
                        e.preventDefault();
                        $(selFocusable, active.$el)?.focus();
                    } else {
                        const dropdown = this.dropdowns.find(
                            (el) => this.getDropdown(el)?.targetEl === current,
                        );

                        if (dropdown) {
                            e.preventDefault();
                            if (current instanceof HTMLElement) {
                                current.click();
                            }
                            once(dropdown, 'show', (event: FrameworkEvent<Element>) => {
                                if (event.target) {
                                    $(selFocusable, event.target)?.focus();
                                }
                            });
                        }
                    }
                }

                handleNavItemNavigation(e, this.items, active);
            },
        },

        {
            name: 'keydown',

            el: ({ dropContainer }: DropnavInstance) => dropContainer,

            delegate: ({ clsDrop }: DropnavInstance) => `.${clsDrop}`,

            handler(e: DropnavKeyboardEvent) {
                const { current, keyCode, target } = e;

                if (isInput(target) || !includes(this.dropdowns, current)) {
                    return;
                }

                const active = this.getActive();
                let next: number | 'last' | 'previous' | 'next' = -1;

                if (keyCode === keyMap.HOME) {
                    next = 0;
                } else if (keyCode === keyMap.END) {
                    next = 'last';
                } else if (keyCode === keyMap.UP) {
                    next = 'previous';
                } else if (keyCode === keyMap.DOWN) {
                    next = 'next';
                } else if (keyCode === keyMap.ESC) {
                    active?.targetEl?.focus();
                }

                if (next !== -1) {
                    e.preventDefault();
                    const elements = $$(selFocusable, current);
                    elements[
                        getIndex(
                            next,
                            elements,
                            findIndex(elements, (el) => matches(el, ':focus')),
                        )
                    ]?.focus();
                    return;
                }

                handleNavItemNavigation(e, this.items, active);
            },
        },

        {
            name: 'mouseleave',

            el: ({ dropbar }: DropnavInstance) => dropbar,

            filter: ({ dropbar }: DropnavInstance) => Boolean(dropbar),

            handler() {
                const active = this.getActive();

                if (
                    active &&
                    includes(active.mode, 'hover') &&
                    !this.dropdowns.some((el) => matches(el, ':hover'))
                ) {
                    active.hide();
                }
            },
        },

        {
            name: 'beforeshow',

            el: ({ dropContainer }: DropnavInstance) => dropContainer,

            filter: ({ dropbar }: DropnavInstance) => Boolean(dropbar),

            handler({ target }: FrameworkEvent<Element>) {
                if (
                    !(target instanceof HTMLElement) ||
                    !this.dropbar ||
                    !this.isDropbarDrop(target)
                ) {
                    return;
                }

                if (this.dropbar.previousElementSibling !== this.dropbarAnchor) {
                    after(this.dropbarAnchor, this.dropbar);
                }

                addClass(target, `${this.clsDrop}-dropbar`);
            },
        },

        {
            name: 'show',

            el: ({ dropContainer }: DropnavInstance) => dropContainer,

            filter: ({ dropbar }: DropnavInstance) => Boolean(dropbar),

            handler({ target }: FrameworkEvent<Element>) {
                if (
                    !(target instanceof HTMLElement) ||
                    !this.dropbar ||
                    !this.isDropbarDrop(target)
                ) {
                    return;
                }
                const dropdownElement = target;

                const drop = this.getDropdown(dropdownElement);
                if (!drop) {
                    return;
                }
                const dropbar = this.dropbar;
                const adjustHeight = () => {
                    const maxBottom = Math.max(
                        ...parents(dropdownElement, `.${this.clsDrop}`)
                            .concat(dropdownElement)
                            .map((el) => offset(el).bottom),
                    );

                    offset(dropbar, {
                        left: offset(dropbar).left,
                        top: this.getDropbarOffset(drop.getPositionOffset()),
                    });
                    this.transitionTo(
                        maxBottom -
                            offset(dropbar).top +
                            toFloat(css(dropdownElement, 'marginBottom')),
                        dropdownElement,
                    );
                };
                const resizeTargets = [drop.$el, ...drop.target].filter(
                    (element): element is Element => element instanceof Element,
                );
                this._observer = observeResize(resizeTargets, adjustHeight);
                adjustHeight();
            },
        },

        {
            name: 'beforehide',

            el: ({ dropContainer }: DropnavInstance) => dropContainer,

            filter: ({ dropbar }: DropnavInstance) => Boolean(dropbar),

            handler(e: FrameworkEvent<Element>) {
                const active = this.getActive();

                if (
                    matches(this.dropbar, ':hover') &&
                    active &&
                    active.$el === e.target &&
                    this.isDropbarDrop(active.$el) &&
                    includes(active.mode, 'hover') &&
                    active.isDelayedHide &&
                    !this.items.some((el) => active.targetEl !== el && matches(el, ':focus'))
                ) {
                    e.preventDefault();
                }
            },
        },

        {
            name: 'hide',

            el: ({ dropContainer }: DropnavInstance) => dropContainer,

            filter: ({ dropbar }: DropnavInstance) => Boolean(dropbar),

            handler({ target }: FrameworkEvent<Element>) {
                if (!target || !this.isDropbarDrop(target)) {
                    return;
                }

                this._observer?.disconnect();

                const active = this.getActive();

                if (!active || active.$el === target) {
                    this.transitionTo(0);
                }
            },
        },
    ],

    methods: {
        getActive() {
            return includes(this.dropdowns, active?.$el) && active;
        },

        async transitionTo(newHeight: number, el?: HTMLElement) {
            const { dropbar } = this;
            if (!dropbar) {
                return;
            }
            const oldHeight = height(dropbar);

            if (oldHeight >= newHeight) {
                el = undefined;
            }

            await Transition.cancel(el ? [el, dropbar] : dropbar);

            if (el) {
                const diff = offset(el).top - offset(dropbar).top - oldHeight;
                if (diff > 0) {
                    css(el, 'transitionDelay', `${(diff / newHeight) * this.duration}ms`);
                }
            }

            css(el, 'clipPath', `polygon(0 0,100% 0,100% ${oldHeight}px,0 ${oldHeight}px)`);
            height(dropbar, oldHeight);

            await Promise.all([
                Transition.start(dropbar, { height: newHeight }, this.duration),
                Transition.start(
                    el,
                    { clipPath: `polygon(0 0,100% 0,100% ${newHeight}px,0 ${newHeight}px)` },
                    this.duration,
                ).finally(() => css(el, { clipPath: '', transitionDelay: '' })),
            ]).catch(noop);
        },

        getDropdown(el: Element) {
            const component = this.$getComponent(el, 'drop') || this.$getComponent(el, 'dropdown');
            return isDropInstance(component) ? component : undefined;
        },

        isDropbarDrop(el: Element) {
            return includes(this.dropdowns, el) && hasClass(el, this.clsDrop);
        },

        getDropbarOffset(offsetTop: number) {
            const { $el, target, targetY } = this;
            const targetElement = resolveDropnavElement(targetY || target, $el) || $el;
            const { top, height } = offset(targetElement);
            return top + height + offsetTop;
        },

        initializeDropdowns() {
            this.$create(
                'drop',
                this.dropdowns.filter((el) => !this.getDropdown(el)),
                {
                    ...this.$props,
                    flip: this.flip && !this.$props.dropbar,
                    shift: true,
                    pos: `bottom-${this.align}`,
                    boundary: false,
                    boundaryX: this.boundary === true ? this.$el : this.boundary,
                },
            );
        },
    },
});

function handleNavItemNavigation(
    e: DropnavKeyboardEvent,
    toggles: HTMLElement[],
    currentDrop: DropInstance | undefined,
): void {
    const { current, keyCode } = e;
    let next: number | 'last' | 'previous' | 'next' = -1;

    if (keyCode === keyMap.HOME) {
        next = 0;
    } else if (keyCode === keyMap.END) {
        next = 'last';
    } else if (keyCode === keyMap.LEFT) {
        next = 'previous';
    } else if (keyCode === keyMap.RIGHT) {
        next = 'next';
    } else if (keyCode === keyMap.TAB) {
        currentDrop?.targetEl?.focus();
        currentDrop?.hide(false);
    }

    if (next !== -1) {
        e.preventDefault();
        currentDrop?.hide(false);
        const currentToggle = currentDrop?.targetEl || current;
        const currentIndex =
            currentToggle instanceof HTMLElement ? toggles.indexOf(currentToggle) : -1;
        toggles[getIndex(next, toggles, currentIndex)]?.focus();
    }
}

// Prevents initial pointer events from opening dropdowns on page load (Safari/Firefox)
function preventInitialPointerEnter(el: HTMLElement): void {
    let handlers: Teardown[] = [];
    const off: Teardown = () => handlers.forEach((handler) => handler());
    handlers = [
        once(el.ownerDocument, pointerMove, (e) => {
            if (!(e.target instanceof Node && el.contains(e.target))) {
                off();
            }
        }),
        on(el, `mouseenter ${pointerEnter}`, (e) => e.stopPropagation(), { capture: true }),
        on(el, `mouseleave ${pointerLeave}`, off, { capture: true }),
    ];
}

function resolveDropnavElement(value: DropnavSelector, context: Element): HTMLElement | undefined {
    if (value instanceof HTMLElement) {
        return value;
    }
    return typeof value === 'string' ? query<HTMLElement>(value, context) : undefined;
}

function isDropInstance(value: unknown): value is DropInstance {
    return (
        typeof value === 'object' &&
        value !== null &&
        '$el' in value &&
        value.$el instanceof HTMLElement &&
        'hide' in value &&
        typeof value.hide === 'function' &&
        'getPositionOffset' in value &&
        typeof value.getPositionOffset === 'function'
    );
}
