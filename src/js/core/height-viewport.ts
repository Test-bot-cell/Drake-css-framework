import {
    boxModelAdjust,
    css,
    dimensions,
    endsWith,
    isNumeric,
    isString,
    isVisible,
    offset,
    offsetViewport,
    query,
    scrollParent,
    scrollParents,
    toFloat,
} from 'uikit-util';
import { resize, viewport } from '../api/observables';
import { defineComponent } from '../api/options';
import Media from '../mixin/media';
import type { ComponentInternalInstance } from '../types';

interface HeightViewportInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    expand: boolean;
    offsetTop: boolean | string;
    offsetBottom: boolean | number | string;
    min: number;
    property: string;
    matchMedia: boolean;
}

export default defineComponent<HeightViewportInstance>()({
    mixins: [Media],

    props: {
        expand: Boolean,
        offsetTop: Boolean,
        offsetBottom: Boolean,
        min: Number,
        property: String,
    },

    data: {
        expand: false,
        offsetTop: false,
        offsetBottom: false,
        min: 0,
        property: 'min-height',
    },

    // check for offsetTop change
    observe: [
        viewport<HeightViewportInstance>({ filter: ({ expand }) => expand }),
        resize<HeightViewportInstance>({ target: ({ $el }) => scrollParents($el) }),
    ],

    update: {
        read() {
            if (!isVisible(this.$el)) {
                return false;
            }

            if (!this.matchMedia) {
                return { minHeight: false };
            }

            const box = boxModelAdjust(this.$el, 'height', 'content-box');

            const { body, scrollingElement } = document;
            const scrollElement = scrollParent(this.$el);
            const { height: viewportHeight } = offsetViewport(
                scrollElement === body ? scrollingElement : scrollElement,
            );

            const isScrollingElement = scrollingElement === scrollElement || body === scrollElement;

            // on mobile devices (iOS and Android) window.innerHeight !== 100vh
            let minHeight = `calc(${isScrollingElement ? '100vh' : `${viewportHeight}px`}`;

            if (this.expand) {
                const diff = dimensions(scrollElement).height - dimensions(this.$el).height;
                minHeight += ` - ${diff}px`;
            } else {
                if (this.offsetTop) {
                    if (isScrollingElement) {
                        const offsetTopEl =
                            this.offsetTop === true ? this.$el : query(this.offsetTop, this.$el);
                        const { top } = offset(offsetTopEl);
                        minHeight += top > 0 && top < viewportHeight / 2 ? ` - ${top}px` : '';
                    } else {
                        minHeight += ` - ${boxModelAdjust(scrollElement, 'height', css(scrollElement, 'boxSizing'))}px`;
                    }
                }

                if (this.offsetBottom === true) {
                    minHeight += ` - ${dimensions(this.$el.nextElementSibling).height}px`;
                } else if (isNumeric(this.offsetBottom)) {
                    minHeight += ` - ${this.offsetBottom}vh`;
                } else if (this.offsetBottom && endsWith(this.offsetBottom, 'px')) {
                    minHeight += ` - ${toFloat(this.offsetBottom)}px`;
                } else if (isString(this.offsetBottom)) {
                    minHeight += ` - ${dimensions(query(this.offsetBottom, this.$el)).height}px`;
                }
            }

            minHeight += `${box ? ` - ${box}px` : ''})`;

            return { minHeight };
        },

        write({ minHeight }: { minHeight: false | string }) {
            css(
                this.$el,
                this.property,
                minHeight === false ? '' : `max(${this.min || 0}px, ${minHeight})`,
            );
        },

        events: ['resize'],
    },
});
