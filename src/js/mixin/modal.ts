import {
    $,
    addClass,
    append,
    css,
    dimensions,
    endsWith,
    includes,
    isFocusable,
    isSameSiteAnchor,
    last,
    matches,
    on,
    once,
    parent,
    pointerCancel,
    pointerDown,
    pointerUp,
    removeClass,
    toFloat,
} from 'drake-util';
import { defineMixin } from '../api/options';
import type { ComponentInternalInstance, FrameworkEvent, Teardown } from '../types';
import { awaitFrame } from '../util/await';
import { preventBackgroundScroll } from '../util/scroll';
import Class from './class';
import Container from './container';
import { maybeDefaultPreventClick } from './event';
import Togglable from './togglable';
import type { ElementEvent, TogglableInstance } from './types';

interface ModalInstance extends TogglableInstance {
    selPanel: string;
    selClose: string;
    escClose: boolean;
    bgClose: boolean;
    stack: boolean;
    role: string;
    overlay: boolean;
    clsPage: string;
    panel: HTMLElement | undefined;
    transitionElement: HTMLElement | undefined;
    container: Element | false | '' | undefined;
    target: HTMLElement | null;
    toggle(): Promise<boolean>;
    show(): Promise<boolean>;
    hide(): Promise<boolean>;
}

interface ModalClickEvent extends ElementEvent {
    current: HTMLElement;
}

interface KeyboardFrameworkEvent extends FrameworkEvent {
    keyCode: number;
}

const active: ModalInstance[] = [];

export default defineMixin<ModalInstance>()({
    mixins: [Class, Container, Togglable],

    props: {
        selPanel: String,
        selClose: String,
        escClose: Boolean,
        bgClose: Boolean,
        stack: Boolean,
        role: String,
    },

    data: {
        cls: 'drk-open',
        escClose: true,
        bgClose: true,
        overlay: true,
        stack: false,
        role: 'dialog',
    },

    computed: {
        panel: ({ selPanel }: { selPanel: string }, $el: HTMLElement) =>
            $<HTMLElement>(selPanel, $el),

        transitionElement(): HTMLElement | undefined {
            return this.panel;
        },
    },

    connected() {
        const el = this.panel || this.$el;
        el.role = this.role;

        if (this.overlay) {
            el.ariaModal = 'true';
        }
    },

    beforeDisconnect() {
        if (includes(active, this)) {
            void this.toggleElement(this.$el, false, false);
        }
    },

    events: [
        {
            name: 'click',

            delegate: ({ selClose }) => `${selClose},a[href*="#"]`,

            handler(e: ModalClickEvent): void {
                const { current, defaultPrevented } = e;
                const hash = current instanceof HTMLAnchorElement ? current.hash : '';
                if (
                    !defaultPrevented &&
                    hash &&
                    isSameSiteAnchor(current) &&
                    !this.$el.contains($(hash) ?? null)
                ) {
                    void this.hide();
                } else if (matches(current, this.selClose)) {
                    maybeDefaultPreventClick(e);
                    void this.hide();
                }
            },
        },

        {
            name: 'toggle',

            self: true,

            handler(e: FrameworkEvent, toggle?: ComponentInternalInstance): void {
                if (e.defaultPrevented) {
                    return;
                }

                e.preventDefault();

                this.target = toggle?.$el instanceof HTMLElement ? toggle.$el : null;
                if (this.isToggled() === includes(active, this)) {
                    void this.toggle();
                }
            },
        },

        {
            name: 'beforeshow',

            self: true,

            handler(e: FrameworkEvent): false | undefined {
                if (includes(active, this)) {
                    return false;
                }

                if (!this.stack && active.length) {
                    void Promise.all(active.map((modal) => modal.hide())).then(() => this.show());
                    e.preventDefault();
                } else {
                    active.push(this);
                }
            },
        },

        {
            name: 'show',

            self: true,

            handler(): void {
                if (this.stack) {
                    css(this.$el, 'zIndex', toFloat(css(this.$el, 'zIndex')) + active.length);
                }

                const handlers: Array<Teardown | false> = [
                    this.overlay && preventBackgroundFocus(this),
                    this.overlay && preventBackgroundScroll(this.$el),
                    this.bgClose && listenForBackgroundClose(this),
                    this.escClose && listenForEscClose(this),
                ];

                once(
                    this.$el,
                    'hidden',
                    () => handlers.forEach((handler) => handler && handler()),
                    { self: true },
                );

                addClass(document.documentElement, this.clsPage);

                setAriaExpanded(this.target, true);
            },
        },

        {
            name: 'shown',

            self: true,

            handler(): void {
                if (!isFocusable(this.$el)) {
                    this.$el.tabIndex = -1;
                }

                if (!matches(this.$el, ':focus-within')) {
                    this.$el.focus();
                }
            },
        },

        {
            name: 'hidden',

            self: true,

            handler(): void {
                if (includes(active, this)) {
                    active.splice(active.indexOf(this), 1);
                }

                css(this.$el, 'zIndex', '');

                const { target } = this;
                if (!active.some((modal) => modal.clsPage === this.clsPage)) {
                    removeClass(document.documentElement, this.clsPage);

                    queueMicrotask(() => {
                        if (target && isFocusable(target)) {
                            target.focus({ preventScroll: true });
                        }
                    });
                }

                setAriaExpanded(target, false);

                this.target = null;
            },
        },
    ],

    methods: {
        toggle(): Promise<boolean> {
            return this.isToggled() ? this.hide() : this.show();
        },

        async show(): Promise<boolean> {
            if (this.container && parent(this.$el) !== this.container) {
                append(this.container, this.$el);
                await awaitFrame();
            }

            return this.toggleElement(this.$el, true, (element, show) =>
                animate(element, show, this),
            );
        },

        hide(): Promise<boolean> {
            return this.toggleElement(this.$el, false, (element, show) =>
                animate(element, show, this),
            );
        },
    },
});

const rejectors = new WeakMap<HTMLElement, (reason?: unknown) => void>();

function animate(
    el: HTMLElement,
    show: boolean,
    { transitionElement, _toggle }: ModalInstance,
): Promise<void> {
    return new Promise<void>((resolve, reject) =>
        once(el, 'show hide', () => {
            rejectors.get(el)?.();
            rejectors.set(el, reject);

            _toggle(el, show);

            const off = once(
                transitionElement,
                'transitionstart',
                () => {
                    once(transitionElement, 'transitionend transitioncancel', () => resolve(), {
                        self: true,
                    });
                    clearTimeout(timer);
                },
                { self: true },
            );

            const timer = setTimeout(
                () => {
                    off();
                    resolve();
                },
                toMs(css(transitionElement, 'transitionDuration')),
            );
        }),
    ).then(() => {
        rejectors.delete(el);
    });
}

function toMs(time: string): number {
    return time ? (endsWith(time, 'ms') ? toFloat(time) : toFloat(time) * 1000) : 0;
}

function preventBackgroundFocus(modal: ModalInstance): Teardown {
    return on(document, 'focusin', (e) => {
        if (
            !(e.target instanceof Element) ||
            last(active) !== modal ||
            modal.$el.contains(e.target)
        ) {
            return;
        }

        const { left, top, width, height } = dimensions(e.target);
        const topEl = document.elementFromPoint(left + width / 2, top + height / 2);

        if (topEl && (e.target.contains(topEl) || topEl.contains(e.target))) {
            return;
        }

        modal.$el.focus();
    });
}

function listenForBackgroundClose(modal: ModalInstance): Teardown {
    return on(document, pointerDown, ({ target }) => {
        if (!(target instanceof Element)) {
            return;
        }
        if (
            last(active) !== modal ||
            (modal.overlay && !modal.$el.contains(target)) ||
            !modal.panel ||
            modal.panel.contains(target)
        ) {
            return;
        }

        once(
            document,
            `${pointerUp} ${pointerCancel} scroll`,
            ({ defaultPrevented, type, target: newTarget }) => {
                if (!defaultPrevented && type === pointerUp && target === newTarget) {
                    void modal.hide();
                }
            },
            true,
        );
    });
}

function listenForEscClose(modal: ModalInstance): Teardown {
    return on<KeyboardFrameworkEvent>(document, 'keydown', (e) => {
        if (e.keyCode === 27 && last(active) === modal) {
            void modal.hide();
        }
    });
}

function setAriaExpanded(el: HTMLElement | null, toggled: boolean): void {
    if (el?.ariaExpanded) {
        el.ariaExpanded = String(toggled);
    }
}
