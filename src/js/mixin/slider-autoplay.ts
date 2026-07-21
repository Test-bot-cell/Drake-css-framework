import { attr, isVisible, matches } from 'uikit-util';
import { defineMixin } from '../api/options';
import type { SliderInstance } from './types';

interface AutoplaySliderInstance extends SliderInstance {
    autoplay: boolean;
    autoplayInterval: number;
    pauseOnHover: boolean;
    interval?: number;
    startAutoplay(): void;
    stopAutoplay(): void;
}

export default defineMixin<AutoplaySliderInstance>()({
    props: {
        autoplay: Boolean,
        autoplayInterval: Number,
        pauseOnHover: Boolean,
    },

    data: {
        autoplay: false,
        autoplayInterval: 7000,
        pauseOnHover: true,
    },

    connected() {
        attr(this.list, 'aria-live', this.autoplay ? 'off' : 'polite');
        if (this.autoplay) {
            this.startAutoplay();
        }
    },

    disconnected() {
        this.stopAutoplay();
    },

    update(this: AutoplaySliderInstance): void {
        attr(this.slides, 'tabindex', '-1');
    },

    events: [
        {
            name: 'visibilitychange',

            el: () => document,

            filter: ({ autoplay }) => autoplay,

            handler(): void {
                if (document.hidden) {
                    this.stopAutoplay();
                } else {
                    this.startAutoplay();
                }
            },
        },
    ],

    methods: {
        startAutoplay(): void {
            this.stopAutoplay();

            this.interval = setInterval(() => {
                if (!(
                    this.stack.length ||
                    !isVisible(this.$el) ||
                    (this.draggable &&
                        matches(this.$el, ':focus-within') &&
                        !matches(this.$el, ':focus')) ||
                    (this.pauseOnHover && matches(this.$el, ':hover'))
                )) {
                    void this.show('next');
                }
            }, this.autoplayInterval);
        },

        stopAutoplay(): void {
            clearInterval(this.interval);
        },
    },
});
