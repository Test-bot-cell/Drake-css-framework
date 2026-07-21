import { addClass, attr, css, includes, isTag, memoize, once, removeAttr } from 'uikit-util';
import { mutation } from '../api/observables';
import { defineComponent } from '../api/options';
import Svg, { parseSVG } from '../mixin/svg';
import type { ComponentInternalInstance } from '../types';
import { getMaxPathLength } from '../util/svg';

interface SvgCoreInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    src: string;
    icon?: string;
    attributes: string[];
    strokeAnimation: boolean;
    svg: Promise<Element | undefined> | null;
    getSvg(): Promise<Element>;
}

export default defineComponent<SvgCoreInstance>()({
    mixins: [Svg],

    args: 'src',

    props: {
        src: String,
        icon: String,
        attributes: 'list',
        strokeAnimation: Boolean,
    },

    data: {
        strokeAnimation: false,
    },

    observe: [
        mutation<SvgCoreInstance>({
            async handler() {
                const svg = await this.svg;
                if (svg) {
                    applyAttributes.call(this, svg);
                }
            },
            options: {
                attributes: true,
                attributeFilter: ['id', 'class', 'style'],
            },
        }),
    ],

    async connected() {
        if (includes(this.src, '#')) {
            const [src = '', icon] = this.src.split('#', 2);
            this.src = src;
            this.icon = icon;
        }

        const svg = await this.svg;
        if (svg) {
            applyAttributes.call(this, svg);
            if (this.strokeAnimation) {
                applyAnimation(svg);
            }
        }
    },

    methods: {
        async getSvg() {
            if (isLazyImage(this.$el) && !this.$el.complete) {
                await new Promise<void>((resolve) => once(this.$el, 'load', () => resolve()));
            }

            return parseSVG(await loadSVG(this.src), this.icon) || Promise.reject('SVG not found.');
        },
    },
});

function applyAttributes(this: SvgCoreInstance, el: Element): void {
    const { $el } = this;

    addClass(el, attr($el, 'class'), 'uk-svg');

    for (let i = 0; i < $el.style.length; i++) {
        const prop = $el.style[i];
        if (prop) {
            css(el, prop, css($el, prop));
        }
    }

    for (const attribute of this.attributes) {
        const [prop, value] = attribute.split(':', 2);
        if (prop && value !== undefined) {
            attr(el, prop, value);
        }
    }

    el.ariaHidden = this.$el.ariaHidden;

    if (!this.$el.id) {
        removeAttr(el, 'id');
    }
}

const loadSVG = memoize(async (src: string): Promise<string> => {
    if (src) {
        const response = await fetch(src);
        if (response.headers.get('Content-Type') === 'image/svg+xml') {
            return response.text();
        }
    }

    return Promise.reject();
});

function applyAnimation(el: Element): void {
    const length = getMaxPathLength(el);

    if (length) {
        css(el, '--uk-animation-stroke', length);
    }
}

function isLazyImage(element: Element): element is HTMLImageElement {
    return isTag(element, 'img') && element.getAttribute('loading') === 'lazy';
}
