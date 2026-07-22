import { addClass, removeClass } from '../util/class.js';
import { resize } from '../api/observables.js';
import { defineMixin } from '../api/options.js';
import animations from './internal/slideshow-animations.js';
import Transitioner from './internal/slideshow-transitioner.js';
import Slider from './slider.js';

var Slideshow = defineMixin()({
  mixins: [Slider],
  props: {
    animation: String
  },
  data: {
    animation: "slide",
    clsActivated: "drk-transition-active",
    Animations: animations,
    Transitioner
  },
  computed: {
    animation({
      animation,
      Animations: animationRegistry
    }) {
      return {
        ...animationRegistry[animation] || animationRegistry.slide,
        name: animation
      };
    },
    transitionOptions() {
      return { animation: this.animation };
    }
  },
  observe: resize(),
  events: [
    {
      name: "itemshow",
      handler({ target }) {
        addClass(target, this.clsActive);
      }
    },
    {
      name: "itemshown",
      handler({ target }) {
        addClass(target, this.clsActivated);
      }
    },
    {
      name: "itemhidden",
      handler({ target }) {
        removeClass(target, this.clsActive, this.clsActivated);
      }
    }
  ]
});

export { Slideshow as default };
