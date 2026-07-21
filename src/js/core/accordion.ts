import {
    $,
    $$,
    attr,
    children,
    css,
    dimensions,
    filter,
    getIndex,
    hasClass,
    includes,
    isTag,
    scrollParent,
    sumBy,
    toFloat,
    toggleClass,
    Transition,
    unwrap,
    wrapAll,
} from 'drake-util';
import { generateId } from '../api/instance';
import { lazyload } from '../api/observables';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import { maybeDefaultPreventClick } from '../mixin/event';
import Togglable from '../mixin/togglable';
import type {
    ComponentInternalInstance,
    ComponentValueMap,
    FrameworkEvent,
    NodeInput,
} from '../types';
import { keyMap } from '../util/keys';
import type { IndexSpecifier } from '../util/lang';

interface AccordionItem extends HTMLElement {
    _wrapper?: HTMLElement;
}

interface AccordionProps {
    targets: string;
    toggle: string;
    content: string;
}

interface AccordionTransitionContext {
    content: string;
    duration: number;
    velocity: number;
    transition: string;
}

interface AccordionInstance extends ComponentInternalInstance, AccordionTransitionContext {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & { toggle: string };
    items: AccordionItem[];
    toggles: Array<HTMLElement | undefined>;
    contents: Array<HTMLElement | undefined>;
    targets: string;
    active: false | string | number;
    animation: boolean;
    collapsible: boolean;
    multiple: boolean;
    clsOpen: string;
    offset: number;
    toggle(item: IndexSpecifier, animate?: boolean): Promise<boolean[]>;
    toggleElement(
        targets: NodeInput,
        toggle: boolean,
        animate: (element: AccordionItem, show: boolean) => void | Promise<void>,
    ): Promise<boolean>;
}

type AccordionEvent = FrameworkEvent<Element> & { keyCode?: number };

export default defineComponent<AccordionInstance>()({
    mixins: [Class, Togglable],

    props: {
        animation: Boolean,
        targets: String,
        active: null,
        collapsible: Boolean,
        multiple: Boolean,
        toggle: String,
        content: String,
        offset: Number,
    },

    data: {
        targets: '> *',
        active: false,
        animation: true,
        collapsible: true,
        multiple: false,
        clsOpen: 'drk-open',
        toggle: '.drk-accordion-title',
        content: '.drk-accordion-content',
        offset: 0,
    },

    computed: {
        items: ({ targets }: AccordionProps, $el: Element) => $$<AccordionItem>(targets, $el),

        toggles({ toggle }: AccordionProps) {
            return this.items.map((item) => $(toggle, item));
        },

        contents({ content }: AccordionProps) {
            return this.items.map((item) => item._wrapper?.firstElementChild || $(content, item));
        },
    },

    watch: {
        items(items: AccordionItem[], prev?: AccordionItem[]) {
            if (prev || hasClass(items, this.clsOpen)) {
                return;
            }

            const active =
                (this.active !== false && items[Number(this.active)]) ||
                (!this.collapsible && items[0]);

            if (active) {
                this.toggle(active, false);
            }
        },

        toggles() {
            this.$emit();
        },

        contents(items: Array<HTMLElement | undefined>) {
            for (const el of items) {
                const isOpen = hasClass(
                    this.items.find((item) => Boolean(el && item.contains(el))),
                    this.clsOpen,
                );

                hide(el, !isOpen);
            }
            this.$emit();
        },
    },

    observe: lazyload<AccordionInstance>(),

    events: [
        {
            name: 'click keydown',

            delegate: ({ targets, $props }: AccordionInstance) => `${targets} ${$props.toggle}`,

            handler(e: AccordionEvent) {
                if (e.type === 'keydown' && e.keyCode !== keyMap.SPACE) {
                    return;
                }

                if (!(e.current instanceof HTMLElement)) {
                    return;
                }
                const item = this.toggles.indexOf(e.current);

                if (item === -1) {
                    return;
                }

                maybeDefaultPreventClick(e);

                if (!e.target) {
                    return;
                }
                const off = keepScrollPosition(e.target);
                this.toggle(item).finally(off);
            },
        },
        {
            name: 'show hide shown hidden',

            self: true,

            delegate: ({ targets }: AccordionInstance) => targets,

            handler() {
                this.$emit();
            },
        },
    ],

    update() {
        const activeItems = filter(this.items, `.${this.clsOpen}`);

        for (const [itemIndex, item] of this.items.entries()) {
            const toggle = this.toggles[itemIndex];
            const content = this.contents[itemIndex];

            if (!toggle || !content) {
                continue;
            }

            toggle.id = generateId(this, toggle);
            content.id = generateId(this, content);

            const active = includes(activeItems, item);
            attr(toggle, {
                role: isTag(toggle, 'a') ? 'button' : null,
                'aria-controls': content.id,
                'aria-expanded': active,
                'aria-disabled': !this.collapsible && activeItems.length < 2 && active,
            });

            attr(content, { role: 'region', 'aria-labelledby': toggle.id });
            if (isTag(content, 'ul')) {
                attr(children(content), 'role', 'presentation');
            }
        }
    },

    methods: {
        toggle(item: IndexSpecifier, animate?: boolean) {
            const selected = this.items[getIndex(item, this.items)];
            let items: Array<AccordionItem | undefined> = [selected];
            const activeItems = filter(this.items, `.${this.clsOpen}`);

            if (!this.multiple && !includes(activeItems, items[0])) {
                items = items.concat(activeItems);
            }

            if (!this.collapsible && activeItems.length < 2 && includes(activeItems, selected)) {
                items = [];
            }

            return Promise.all(
                items.map((el) =>
                    this.toggleElement(el, !includes(activeItems, el), (el, show) => {
                        toggleClass(el, this.clsOpen, show);

                        if (animate === false || !this.animation) {
                            hide($(this.content, el), !show);
                            return;
                        }

                        return transition(el, show, this);
                    }),
                ),
            );
        },
    },
});

function hide(el: HTMLElement | undefined, hidden: boolean): void {
    if (el) {
        el.hidden = hidden;
    }
}

async function transition(
    el: AccordionItem,
    show: boolean,
    context: AccordionTransitionContext,
): Promise<void> {
    const { content, velocity, transition } = context;
    let { duration } = context;
    const contentElement = el._wrapper?.firstElementChild || $(content, el);

    if (!(contentElement instanceof HTMLElement)) {
        return;
    }

    if (!el._wrapper) {
        const wrapper = wrapAll(contentElement, '<div>');
        if (wrapper instanceof HTMLElement) {
            el._wrapper = wrapper;
        }
    }

    const wrapper = el._wrapper;
    if (!wrapper) {
        return;
    }
    css(wrapper, 'overflow', 'hidden');
    const currentHeight = toFloat(css(wrapper, 'height'));

    await Transition.cancel(wrapper);
    hide(contentElement, false);

    const endHeight =
        sumBy(['marginTop', 'marginBottom'], (prop) => css(contentElement, prop)) +
        dimensions(contentElement).height;

    const percent = currentHeight / endHeight;
    duration = endHeight ? (velocity * endHeight + duration) * (show ? 1 - percent : percent) : 0;
    css(wrapper, 'height', currentHeight);

    await Transition.start(wrapper, { height: show ? endHeight : 0 }, duration, transition);

    unwrap(contentElement);
    delete el._wrapper;

    if (!show) {
        hide(contentElement, true);
    }
}

function keepScrollPosition(el: Element): () => number {
    const scrollElement = scrollParent(el, true);
    let frame = 0;
    (function scroll() {
        frame = requestAnimationFrame(() => {
            const { top } = dimensions(el);
            if (top < 0) {
                scrollElement.scrollTop += top;
            }
            scroll();
        });
    })();

    return () => requestAnimationFrame(() => cancelAnimationFrame(frame));
}
