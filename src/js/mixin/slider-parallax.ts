import { hasClass, includes, query, scrolledOver, toPx, trigger } from 'uikit-util';
import { resize, scroll } from '../api/observables';
import { defineMixin } from '../api/options';
import { ease } from './parallax';
import type { SliderInstance } from './types';

interface ParallaxSliderInstance extends SliderInstance {
    parallaxTarget: Element | undefined;
    parallaxStart: string | number;
    parallaxEnd: string | number;
    parallaxEasing: number;
    getIndexAt(percent: number): [number, number];
}

interface ParallaxUpdateData {
    parallax: [number, number];
}

export default defineMixin<ParallaxSliderInstance>()({
    props: {
        parallax: Boolean,
        parallaxTarget: Boolean,
        parallaxStart: String,
        parallaxEnd: String,
        parallaxEasing: Number,
    },

    data: {
        parallax: false,
        parallaxTarget: false,
        parallaxStart: 0,
        parallaxEnd: 0,
        parallaxEasing: 0,
    },

    observe: [
        resize<ParallaxSliderInstance>({
            target: ({ $el, parallaxTarget }) => (parallaxTarget ? [$el, parallaxTarget] : [$el]),
            filter: ({ parallax }) => parallax,
        }),
        scroll<ParallaxSliderInstance>({ filter: ({ parallax }) => parallax }),
    ],

    computed: {
        parallaxTarget(
            { parallaxTarget }: { parallaxTarget: string | Element | false },
            $el: HTMLElement,
        ): Element | undefined {
            return (parallaxTarget && query(parallaxTarget, $el)) || this.list;
        },
    },

    update: {
        read(): false | ParallaxUpdateData {
            if (!this.parallax) {
                return false;
            }

            const target = this.parallaxTarget;

            if (!target) {
                return false;
            }

            const start = toPx(this.parallaxStart, 'height', target, true);
            const end = toPx(this.parallaxEnd, 'height', target, true);
            const percent = ease(scrolledOver(target, start, end), this.parallaxEasing);

            return { parallax: this.getIndexAt(percent) };
        },

        write({ parallax }: ParallaxUpdateData): void {
            const [prevIndex, slidePercent] = parallax;

            const nextIndex = this.getValidIndex(prevIndex + Math.ceil(slidePercent));

            const prev = this.slides[prevIndex];
            const next = this.slides[nextIndex];

            const { triggerShow, triggerShown, triggerHide, triggerHidden } = useTriggers(this);

            if (~this.prevIndex) {
                for (const i of new Set([this.index, this.prevIndex])) {
                    if (!includes([nextIndex, prevIndex], i)) {
                        triggerHide(this.slides[i]);
                        triggerHidden(this.slides[i]);
                    }
                }
            }

            const changed = this.prevIndex !== prevIndex || this.index !== nextIndex;

            this.dir = 1;
            this.prevIndex = prevIndex;
            this.index = nextIndex;

            if (prev !== next) {
                triggerHide(prev);
            }

            triggerShow(next);

            if (changed) {
                triggerShown(prev);
            }

            this._translate(prev === next ? 1 : slidePercent, prev, next);
        },

        events: ['scroll', 'resize'],
    },

    methods: {
        getIndexAt(percent: number): [number, number] {
            const index = percent * (this.length - 1);
            return [Math.floor(index), index % 1];
        },
    },
});

function useTriggers(cmp: ParallaxSliderInstance): {
    triggerShow(element: HTMLElement | undefined): void;
    triggerShown(element: HTMLElement | undefined): void;
    triggerHide(element: HTMLElement | undefined): void;
    triggerHidden(element: HTMLElement | undefined): void;
} {
    const { clsSlideActive, clsEnter, clsLeave } = cmp;

    return { triggerShow, triggerShown, triggerHide, triggerHidden };

    function triggerShow(el: HTMLElement | undefined): void {
        if (hasClass(el, clsLeave)) {
            triggerHide(el);
            triggerHidden(el);
        }

        if (!hasClass(el, clsSlideActive)) {
            trigger(el, 'beforeitemshow', [cmp]);
            trigger(el, 'itemshow', [cmp]);
        }
    }

    function triggerShown(el: HTMLElement | undefined): void {
        if (hasClass(el, clsEnter)) {
            trigger(el, 'itemshown', [cmp]);
        }
    }

    function triggerHide(el: HTMLElement | undefined): void {
        if (!hasClass(el, clsSlideActive)) {
            triggerShow(el);
        }

        if (hasClass(el, clsEnter)) {
            triggerShown(el);
        }

        if (!hasClass(el, clsLeave)) {
            trigger(el, 'beforeitemhide', [cmp]);
            trigger(el, 'itemhide', [cmp]);
        }
    }

    function triggerHidden(el: HTMLElement | undefined): void {
        if (hasClass(el, clsLeave)) {
            trigger(el, 'itemhidden', [cmp]);
        }
    }
}
