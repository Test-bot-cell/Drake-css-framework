import {
    $$,
    dimensions,
    getCoveringElement,
    getTargetedElement,
    hasClass,
    isVisible,
    offset,
    offsetViewport,
    scrollParent,
    toggleClass,
    trigger,
} from 'uikit-util';
import { intersection, scroll } from '../api/observables';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance } from '../types';

interface ScrollspyNavProps {
    target: string;
    closest: boolean | string;
}

interface ScrollspyNavInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    links: HTMLAnchorElement[];
    targets: Element[];
    elements: Array<Element | null>;
    cls: string;
    scroll: boolean;
    offset: number;
}

export default defineComponent<ScrollspyNavInstance>()({
    props: {
        cls: String,
        closest: Boolean,
        scroll: Boolean,
        target: String,
        offset: Number,
    },

    data: {
        cls: 'uk-active',
        closest: false,
        scroll: false,
        target: 'a[href]:not([role="button"])',
        offset: 0,
    },

    computed: {
        links: {
            get({ target }: ScrollspyNavProps, $el: Element) {
                return $$<HTMLAnchorElement>(target, $el).filter((link) =>
                    Boolean(getTargetedElement(link)),
                );
            },
            observe: () => '*',
        },

        targets() {
            return this.links
                .map((el) => getTargetedElement(el))
                .filter((target): target is Element => Boolean(target));
        },

        elements({ closest }: ScrollspyNavProps) {
            return this.links.map((el) => el.closest(String(closest || '*')));
        },
    },

    watch: {
        links(links: HTMLAnchorElement[]) {
            if (this.scroll) {
                this.$create('scroll', links, { offset: this.offset });
            }
        },
    },

    observe: [intersection<ScrollspyNavInstance>(), scroll<ScrollspyNavInstance>()],

    update: [
        {
            read() {
                const { targets } = this;
                const { length } = targets;

                if (!length || !isVisible(this.$el)) {
                    return false;
                }

                const scrollElement = scrollParent(targets, true);
                const { scrollTop, scrollHeight } = scrollElement;
                const viewport = offsetViewport(scrollElement);
                const max = scrollHeight - viewport.height;
                let active: number | false = false;

                if (scrollTop >= max) {
                    active = length - 1;
                } else {
                    const offsetBy =
                        this.offset +
                        dimensions(getCoveringElement()).height +
                        viewport.height * 0.1;

                    for (let i = 0; i < targets.length; i++) {
                        const target = targets[i];
                        if (!target || offset(target).top - viewport.top - offsetBy > 0) {
                            break;
                        }
                        active = +i;
                    }
                }

                return { active };
            },

            write({ active }: { active: number | false }) {
                const { elements } = this;
                const changed = active !== false && !hasClass(elements[active], this.cls);

                this.links.forEach((el) => el.blur());
                for (let i = 0; i < elements.length; i++) {
                    toggleClass(elements[i], this.cls, +i === active);
                }

                if (changed) {
                    trigger(this.$el, 'active', [active, elements[active]]);
                }
            },

            events: ['scroll', 'resize'],
        },
    ],
});
