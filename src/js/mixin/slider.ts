import {
    $,
    addClass,
    children,
    clamp,
    getIndex,
    hasClass,
    isNumber,
    isRtl,
    removeClass,
    trigger,
    type IndexSpecifier,
} from 'drake-util';
import { defineMixin } from '../api/options';
import { awaitFrame } from '../util/await';
import I18n from './i18n';
import SliderAutoplay from './slider-autoplay';
import SliderDrag from './slider-drag';
import SliderNav from './slider-nav';
import type { ElementEvent, SliderIndex, SliderInstance } from './types';

const easeOutQuad = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const easeOutQuart = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

export default defineMixin<SliderInstance>()({
    mixins: [SliderAutoplay, SliderDrag, SliderNav, I18n],

    props: {
        clsActivated: String,
        easing: String,
        index: Number,
        finite: Boolean,
        velocity: Number,
    },

    data: () => ({
        easing: 'ease',
        finite: false,
        velocity: 1,
        index: 0,
        prevIndex: -1,
        stack: [],
        percent: 0,
        clsActive: 'drk-active',
        clsActivated: '',
        clsEnter: 'drk-slide-enter',
        clsLeave: 'drk-slide-leave',
        clsSlideActive: 'drk-slide-active',
        Transitioner: false,
        transitionOptions: {},
    }),

    connected() {
        this.prevIndex = -1;
        this.index = this.getValidIndex(this.$props.index);
        this.stack = [];
    },

    disconnected() {
        removeClass(this.slides, this.clsActive);
    },

    computed: {
        duration: ({ velocity }: { velocity: number }, $el: HTMLElement) =>
            speedUp($el.offsetWidth / velocity),

        list: ({ selList }: { selList: string }, $el: HTMLElement) => $<HTMLElement>(selList, $el),

        maxIndex(): number {
            return this.length - 1;
        },

        slides(): HTMLElement[] {
            return children(this.list).filter(
                (slide): slide is HTMLElement => slide instanceof HTMLElement,
            );
        },

        length(): number {
            return this.slides.length;
        },
    },

    watch: {
        slides(_slides: HTMLElement[], prev: HTMLElement[] | undefined): void {
            if (prev) {
                this.$emit();
            }
        },
    },

    events: [
        {
            name: 'itemshow',
            handler({ target }: ElementEvent): void {
                addClass(target, this.clsEnter, this.clsSlideActive);
            },
        },
        {
            name: 'itemshown',
            handler({ target }: ElementEvent): void {
                removeClass(target, this.clsEnter);
            },
        },
        {
            name: 'itemhide',
            handler({ target }: ElementEvent): void {
                addClass(target, this.clsLeave);
            },
        },
        {
            name: 'itemhidden',
            handler({ target }: ElementEvent): void {
                removeClass(target, this.clsLeave, this.clsSlideActive);
            },
        },
    ],

    methods: {
        async show(index: SliderIndex, force = false): Promise<void> {
            if (this.dragging || !this.length || this.parallax) {
                return;
            }

            const { stack } = this;
            const queueIndex = force ? 0 : stack.length;
            const reset = () => {
                stack.splice(queueIndex, 1);

                const queued = stack.shift();
                if (queued !== undefined) {
                    void this.show(queued, true);
                }
            };

            if (force) {
                stack.unshift(index);
            } else {
                stack.push(index);
            }

            if (!force && stack.length > 1) {
                if (stack.length === 2) {
                    this._transitioner?.forward(Math.min(this.duration, 200));
                }

                return;
            }

            const prevIndex = this.getIndex(this.index);
            const prev = hasClass(this.slides, this.clsActive) && this.slides[prevIndex];
            const nextIndex = this.getIndex(index, this.index);
            const next = this.slides[nextIndex];

            if (!next) {
                reset();
                return;
            }

            if (prev === next) {
                reset();
                return;
            }

            this.dir = getDirection(index, prevIndex);
            this.prevIndex = prevIndex;
            this.index = nextIndex;

            if (
                (prev && !trigger(prev, 'beforeitemhide', [this])) ||
                !trigger(next, 'beforeitemshow', [this, prev])
            ) {
                this.index = this.prevIndex;
                reset();
                return;
            }

            if (prev) {
                trigger(prev, 'itemhide', [this]);
            }
            trigger(next, 'itemshow', [this]);

            await this._show(prev, next, force);

            if (prev) {
                trigger(prev, 'itemhidden', [this]);
            }
            trigger(next, 'itemshown', [this]);

            stack.shift();
            this._transitioner = null;

            await awaitFrame();
            const queued = stack.shift();
            if (queued !== undefined) {
                void this.show(queued, true);
            }
        },

        getIndex(this: SliderInstance, index: SliderIndex = this.index, prev = this.index): number {
            return clamp(
                getIndex(index, this.slides, prev, this.finite),
                0,
                Math.max(0, this.maxIndex),
            );
        },

        getValidIndex(
            this: SliderInstance,
            index: SliderIndex = this.index,
            prevIndex = this.prevIndex,
        ): number {
            return this.getIndex(index, prevIndex);
        },

        async _show(
            prev: HTMLElement | false | undefined,
            next: number | HTMLElement,
            force: boolean,
        ): Promise<void> {
            this._transitioner = this._getTransitioner(prev, next, this.dir, {
                easing: force
                    ? typeof next !== 'number' && next.offsetWidth < 600
                        ? easeOutQuad
                        : easeOutQuart
                    : this.easing,
                ...this.transitionOptions,
            });

            if (!force && !prev) {
                this._translate(1);
                return;
            }

            const { length } = this.stack;
            return this._transitioner[length > 1 ? 'forward' : 'show'](
                length > 1 ? Math.min(this.duration, 75 + 75 / (length - 1)) : this.duration,
                this.percent ?? 0,
            );
        },

        _translate(
            this: SliderInstance,
            percent: number,
            prev: number | HTMLElement | false = this.prevIndex,
            next: number | HTMLElement | false = this.index,
        ) {
            const transitioner = this._getTransitioner(prev === next ? false : prev, next);
            transitioner.translate(percent);
            return transitioner;
        },

        _getTransitioner(
            this: SliderInstance,
            prev: number | HTMLElement | false = this.prevIndex,
            next: number | HTMLElement | false = this.index,
            dir = this.dir || 1,
            options = this.transitionOptions,
        ) {
            return new this.Transitioner(
                isNumber(prev) ? this.slides[prev] : prev || undefined,
                isNumber(next) ? this.slides[next] : next || undefined,
                dir * (isRtl ? -1 : 1),
                options,
            );
        },
    },
});

function getDirection(index: IndexSpecifier, prevIndex: number): number {
    return index === 'next' ? 1 : index === 'previous' ? -1 : Number(index) < prevIndex ? -1 : 1;
}

export function speedUp(x: number): number {
    return 0.5 * x + 300; // parabola through (400,500; 600,600; 1800,1200)
}
