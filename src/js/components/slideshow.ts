import { css } from 'uikit-util';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import SliderParallax from '../mixin/slider-parallax';
import SliderReactive from '../mixin/slider-reactive';
import Slideshow from '../mixin/slideshow';
import type { ComponentInternalInstance } from '../types';
import SliderPreload from './internal/slider-preload';
import Animations from './internal/slideshow-animations';

interface SlideshowInstance extends ComponentInternalInstance {
    ratio: string;
    minHeight: string | undefined;
    maxHeight: string | undefined;
    list: HTMLElement;
    slides: HTMLElement[];
    index: number;
    getIndex(index: number): number;
    getAdjacentSlides(): (HTMLElement | undefined)[];
}

export default defineComponent<SlideshowInstance>()({
    mixins: [Class, Slideshow, SliderReactive, SliderParallax, SliderPreload],

    props: {
        ratio: String,
        minHeight: String,
        maxHeight: String,
    },

    data: {
        ratio: '16:9',
        minHeight: undefined,
        maxHeight: undefined,
        selList: '.uk-slideshow-items',
        attrItem: 'uk-slideshow-item',
        selNav: '.uk-slideshow-nav',
        Animations,
    },

    watch: {
        list(value: unknown) {
            if (!(value instanceof HTMLElement)) {
                return;
            }
            css(value, {
                aspectRatio: this.ratio ? this.ratio.replace(':', '/') : undefined,
                minHeight: this.minHeight,
                maxHeight: this.maxHeight,
                width: '100%',
            });
        },
    },

    methods: {
        getAdjacentSlides(): (HTMLElement | undefined)[] {
            return [1, -1].map((i) => this.slides[this.getIndex(this.index + i)]);
        },
    },
});
