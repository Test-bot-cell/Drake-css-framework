import { lazyload } from '../../api/observables.js';
import { defineMixin } from '../../api/options.js';

var SliderPreload = defineMixin()({
  observe: lazyload({
    target: (instance) => isSliderPreloadInstance(instance) ? instance.slides : [],
    targets: (instance) => isSliderPreloadInstance(instance) ? instance.getAdjacentSlides().filter((slide) => slide instanceof HTMLElement) : []
  }),
  methods: {
    getAdjacentSlides() {
      return [1, -1].map((i) => this.slides[this.getIndex(this.index + i)]);
    }
  }
});
function isSliderPreloadInstance(instance) {
  return Array.isArray(instance.slides) && instance.slides.every((slide) => slide instanceof HTMLElement) && typeof instance.index === "number" && typeof instance.getIndex === "function" && typeof instance.getAdjacentSlides === "function";
}

export { SliderPreload as default };
