import { css } from '../util/style.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import SliderParallax from '../mixin/slider-parallax.js';
import SliderReactive from '../mixin/slider-reactive.js';
import Slideshow from '../mixin/slideshow.js';
import SliderPreload from './internal/slider-preload.js';
import Animations from './internal/slideshow-animations.js';

var slideshow = defineComponent()({
  mixins: [Class, Slideshow, SliderReactive, SliderParallax, SliderPreload],
  props: {
    ratio: String,
    minHeight: String,
    maxHeight: String
  },
  data: {
    ratio: "16:9",
    minHeight: void 0,
    maxHeight: void 0,
    selList: ".drk-slideshow-items",
    attrItem: "drk-slideshow-item",
    selNav: ".drk-slideshow-nav",
    Animations
  },
  watch: {
    list(value) {
      if (!(value instanceof HTMLElement)) {
        return;
      }
      css(value, {
        aspectRatio: this.ratio ? this.ratio.replace(":", "/") : void 0,
        minHeight: this.minHeight,
        maxHeight: this.maxHeight,
        width: "100%"
      });
    }
  },
  methods: {
    getAdjacentSlides() {
      return [1, -1].map((i) => this.slides[this.getIndex(this.index + i)]);
    }
  }
});

export { slideshow as default };
