import { css, isVisible, parent, query, scrollParent, scrolledOver, toPx } from 'uikit-util';
import { resize, scroll, viewport } from '../api/observables';
import { defineComponent } from '../api/options';
import Parallax, { ease } from '../mixin/parallax';
import type { ComponentInternalInstance, ComponentValueMap, CssProperties } from '../types';

interface ParallaxInstance extends ComponentInternalInstance {
    target: Element;
    viewport: number;
    easing: number;
    start: number;
    end: number;
    matchMedia: boolean;
    reset(): void;
    getCss(percent: number): CssProperties;
}

export default defineComponent<ParallaxInstance>()({
    mixins: [Parallax],

    props: {
        target: String,
        viewport: Number, // Deprecated
        easing: Number,
        start: String,
        end: String,
    },

    data: {
        target: false,
        viewport: 1,
        easing: 1,
        start: 0,
        end: 0,
    },

    computed: {
        target: ({ target }: { target: string | false }, $el: Element) =>
            getOffsetElement((target && query<Element>(target, $el)) || $el),

        start({ start }: { start: string | number }) {
            return toPx(start, 'height', this.target, true);
        },

        end({ end, viewport }: { end: string | number; viewport: number }) {
            return toPx(
                end || ((viewport = (1 - viewport) * 100) && `${viewport}vh+${viewport}%`),
                'height',
                this.target,
                true,
            );
        },
    },

    observe: [
        viewport<ParallaxInstance>(),
        scroll<ParallaxInstance>({ target: ({ target }) => target }),
        resize<ParallaxInstance>({
            target: ({ $el, target }) => [$el, target, scrollParent(target, true)].filter(isNode),
        }),
    ],

    update: {
        read(data: ComponentValueMap, types: ReadonlySet<string>) {
            let percent = typeof data.percent === 'number' ? data.percent : false;
            if (!types.has('scroll')) {
                percent = false;
            }

            if (!isVisible(this.$el)) {
                return false;
            }

            if (!this.matchMedia) {
                return;
            }

            const prev = percent;
            percent = ease(scrolledOver(this.target, this.start, this.end), this.easing);

            return {
                percent,
                style: prev === percent ? false : this.getCss(percent),
            };
        },

        write(data: ComponentValueMap) {
            if (!this.matchMedia) {
                this.reset();
                return;
            }

            if (isCssProperties(data.style)) {
                css(this.$el, data.style);
            }
        },

        events: ['scroll', 'resize'],
    },
});

// SVG elements do not inherit from HTMLElement
function getOffsetElement(el: Element | null | undefined): Element {
    return el ? ('offsetTop' in el ? el : getOffsetElement(parent(el))) : document.documentElement;
}

function isNode(value: Node | undefined): value is Node {
    return value instanceof Node;
}

function isCssProperties(value: unknown): value is CssProperties {
    if (!value || typeof value !== 'object') {
        return false;
    }
    return Object.values(value).every(
        (item) => item == null || typeof item === 'string' || typeof item === 'number',
    );
}
