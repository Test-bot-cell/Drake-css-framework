import {
    $$,
    css,
    filter,
    data as getData,
    once,
    removeClass,
    toggleClass,
    trigger,
} from 'uikit-util';
import { intersection } from '../api/observables';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance, Teardown } from '../types';
import { awaitTimeout } from '../util/await';

const clsInView = 'uk-scrollspy-inview';

interface ScrollspyProps {
    target: string | false;
}

interface ScrollspyState {
    cls: string;
    show?: boolean;
    inview?: boolean;
    queued?: boolean;
    off?: Teardown;
}

interface ScrollspyInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    cls: string;
    elements: HTMLElement[];
    hidden: boolean;
    repeat: boolean;
    delay: number;
    margin: string;
    elementData?: Map<Element, ScrollspyState>;
    toggle(element: Element, inview: boolean): void;
}

interface ScrollspyUpdateData {
    promise?: Promise<void>;
}

export default defineComponent<ScrollspyInstance>()({
    args: 'cls',

    props: {
        cls: String,
        target: String,
        hidden: Boolean,
        margin: String,
        repeat: Boolean,
        delay: Number,
    },

    data: () => ({
        cls: '',
        target: false,
        hidden: true,
        margin: '-1px',
        repeat: false,
        delay: 0,
    }),

    computed: {
        elements: ({ target }: ScrollspyProps, $el: HTMLElement) =>
            target ? $$(target, $el) : [$el],
    },

    watch: {
        elements(elements: HTMLElement[]) {
            if (this.hidden) {
                // use `opacity:0` instead of `visibility:hidden` to make content focusable with keyboard
                css(filter(elements, `:not(.${clsInView})`), 'opacity', 0);
            }
        },
    },

    connected() {
        this.elementData = new Map();
    },

    disconnected() {
        for (const [el, state] of this.elementData?.entries() ?? []) {
            removeClass(el, clsInView, state.cls || '');
        }
        delete this.elementData;
    },

    observe: intersection<ScrollspyInstance>({
        target: ({ elements }) => elements,
        handler(records) {
            const elements = this.elementData;
            if (!elements) {
                return;
            }
            for (const { target: el, isIntersecting } of records) {
                if (!elements.has(el)) {
                    elements.set(el, {
                        cls: getData(el, 'uk-scrollspy-class') || this.cls,
                    });
                }

                const state = elements.get(el);
                if (!state || (!this.repeat && state.show)) {
                    continue;
                }

                state.show = isIntersecting;
            }

            this.$emit();
        },
        options: ({ margin }: ScrollspyInstance) => ({ rootMargin: margin }),
        args: { intersecting: false },
    }),

    update: [
        {
            write(data: ScrollspyUpdateData) {
                for (const [el, state] of this.elementData?.entries() ?? []) {
                    if (state.show && !state.inview && !state.queued) {
                        state.queued = true;

                        data.promise = (data.promise || Promise.resolve()).then(async () => {
                            await awaitTimeout(state.show ? this.delay : 0);
                            this.toggle(el, true);
                            setTimeout(() => {
                                state.queued = false;
                                this.$emit();
                            }, 300);
                        });
                    } else if (!state.show && state.inview && !state.queued && this.repeat) {
                        this.toggle(el, false);
                    }
                }
            },
        },
    ],

    methods: {
        toggle(el: Element, inview: boolean) {
            const state = this.elementData?.get(el);

            if (!state) {
                return;
            }

            state.off?.();

            css(el, 'opacity', !inview && this.hidden ? 0 : '');

            toggleClass(el, clsInView, inview);
            toggleClass(el, state.cls);

            const animationClasses = state.cls.match(/\buk-animation-[\w-]+/g);
            if (animationClasses) {
                const removeAnimationClasses = () => removeClass(el, animationClasses);
                if (inview) {
                    state.off = once(el, 'animationcancel animationend', removeAnimationClasses, {
                        self: true,
                    });
                } else {
                    removeAnimationClasses();
                }
            }

            trigger(el, inview ? 'inview' : 'outview');

            state.inview = inview;
        },
    },
});
