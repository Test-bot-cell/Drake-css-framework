import { lazyload } from '../../api/observables';
import { defineMixin } from '../../api/options';
import type { ComponentInternalInstance } from '../../types';

interface SliderPreloadInstance extends ComponentInternalInstance {
    slides: HTMLElement[];
    index: number;
    getIndex(index: number): number;
    getAdjacentSlides(): (HTMLElement | undefined)[];
}

export default defineMixin<SliderPreloadInstance>()({
    observe: lazyload({
        target: (instance) => (isSliderPreloadInstance(instance) ? instance.slides : []),
        targets: (instance) =>
            isSliderPreloadInstance(instance)
                ? instance
                      .getAdjacentSlides()
                      .filter((slide): slide is HTMLElement => slide instanceof HTMLElement)
                : [],
    }),

    methods: {
        getAdjacentSlides(): (HTMLElement | undefined)[] {
            return [1, -1].map((i) => this.slides[this.getIndex(this.index + i)]);
        },
    },
});

function isSliderPreloadInstance(
    instance: ComponentInternalInstance,
): instance is SliderPreloadInstance {
    return (
        Array.isArray(instance.slides) &&
        instance.slides.every((slide) => slide instanceof HTMLElement) &&
        typeof instance.index === 'number' &&
        typeof instance.getIndex === 'function' &&
        typeof instance.getAdjacentSlides === 'function'
    );
}
