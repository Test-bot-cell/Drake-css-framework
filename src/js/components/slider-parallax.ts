import { css, endsWith, fastdom, noop, Transition } from 'drake-util';
import { defineComponent } from '../api/options';
import Parallax from '../mixin/parallax';
import type {
    ComponentInternalInstance,
    ComponentOptions,
    CssProperties,
    FrameworkEvent,
} from '../types';

interface SliderParallaxInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $options: ComponentOptions & { id: string };
    item: Element | null;
    matchMedia: boolean;
    getCss(percent: number): CssProperties;
    reset(): void;
}

interface TransitionDetail {
    percent: number;
    duration: number;
    timing: string;
    dir: number;
}

export default defineComponent<SliderParallaxInstance>()({
    mixins: [Parallax],

    beforeConnect() {
        this.item = this.$el.closest(`.${this.$options.id.replace('parallax', 'items')} > *`);
    },

    disconnected() {
        this.item = null;
    },

    events: [
        {
            name: 'itemin itemout',

            self: true,

            el: ({ item }: SliderParallaxInstance) => item,

            handler({ type, detail }: FrameworkEvent) {
                if (!isTransitionDetail(detail)) {
                    return;
                }
                const { percent, duration, timing, dir } = detail;
                fastdom.read(() => {
                    if (!this.matchMedia) {
                        return;
                    }

                    const propsFrom = this.getCss(getCurrentPercent(type, dir, percent));
                    const propsTo = this.getCss(isIn(type) ? 0.5 : dir > 0 ? 1 : 0);
                    fastdom.write(() => {
                        css(this.$el, propsFrom);
                        Transition.start(this.$el, propsTo, duration, timing).catch(noop);
                    });
                });
            },
        },

        {
            name: 'transitioncanceled transitionend',

            self: true,

            el: ({ item }: SliderParallaxInstance) => item,

            handler() {
                Transition.cancel(this.$el);
            },
        },

        {
            name: 'itemtranslatein itemtranslateout',

            self: true,

            el: ({ item }: SliderParallaxInstance) => item,

            handler({ type, detail }: FrameworkEvent) {
                if (!isTranslationDetail(detail)) {
                    return;
                }
                const { percent, dir } = detail;
                fastdom.read(() => {
                    if (!this.matchMedia) {
                        this.reset();
                        return;
                    }

                    const props = this.getCss(getCurrentPercent(type, dir, percent));
                    fastdom.write(() => css(this.$el, props));
                });
            },
        },
    ],
});

function isIn(type: string): boolean {
    return endsWith(type, 'in');
}

function getCurrentPercent(type: string, dir: number, percent: number): number {
    percent /= 2;

    return isIn(type) !== dir < 0 ? percent : 1 - percent;
}

function isTranslationDetail(value: unknown): value is Pick<TransitionDetail, 'percent' | 'dir'> {
    return isRecord(value) && typeof value.percent === 'number' && typeof value.dir === 'number';
}

function isTransitionDetail(value: unknown): value is TransitionDetail {
    return (
        isRecord(value) &&
        typeof value.percent === 'number' &&
        typeof value.dir === 'number' &&
        typeof value.duration === 'number' &&
        typeof value.timing === 'string'
    );
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
    return typeof value === 'object' && value !== null;
}
