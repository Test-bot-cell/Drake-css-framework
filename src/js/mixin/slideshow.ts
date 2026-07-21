import { addClass, removeClass } from 'uikit-util';
import { resize } from '../api/observables';
import { defineMixin } from '../api/options';
import type { ComponentInternalInstance } from '../types';
import Animations from './internal/slideshow-animations';
import Transitioner from './internal/slideshow-transitioner';
import Slider from './slider';
import type {
    ElementEvent,
    SlideshowAnimation,
    SlideshowAnimations,
    SlideshowTransitionerConstructor,
} from './types';

interface SlideshowInstance extends ComponentInternalInstance {
    animation: SlideshowAnimation & { name: string };
    Animations: SlideshowAnimations;
    Transitioner: SlideshowTransitionerConstructor;
    clsActive: string;
    clsActivated: string;
}

export default defineMixin<SlideshowInstance>()({
    mixins: [Slider],

    props: {
        animation: String,
    },

    data: {
        animation: 'slide',
        clsActivated: 'uk-transition-active',
        Animations,
        Transitioner,
    },

    computed: {
        animation({
            animation,
            Animations: animationRegistry,
        }: {
            animation: string;
            Animations: SlideshowAnimations;
        }): SlideshowAnimation & { name: string } {
            return {
                ...(animationRegistry[animation] || animationRegistry.slide),
                name: animation,
            };
        },

        transitionOptions(): { animation: SlideshowAnimation } {
            return { animation: this.animation };
        },
    },

    observe: resize<SlideshowInstance>(),

    events: [
        {
            name: 'itemshow',
            handler({ target }: ElementEvent): void {
                addClass(target, this.clsActive);
            },
        },

        {
            name: 'itemshown',
            handler({ target }: ElementEvent): void {
                addClass(target, this.clsActivated);
            },
        },

        {
            name: 'itemhidden',
            handler({ target }: ElementEvent): void {
                removeClass(target, this.clsActive, this.clsActivated);
            },
        },
    ],
});
