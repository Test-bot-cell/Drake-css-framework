import { noop } from '../util/lang.js';
import { defineMixin } from '../api/options.js';
import fade from './internal/animate-fade.js';
import animateSlide from './internal/animate-slide.js';

var Animate = defineMixin()({
  props: {
    duration: Number,
    animation: Boolean
  },
  data: {
    duration: 150,
    animation: "slide"
  },
  methods: {
    animate(action, target = this.$el) {
      const name = this.animation;
      const animationFn = name === "fade" ? fade : name === "delayed-fade" ? (nextAction, nextTarget, nextDuration) => fade(nextAction, nextTarget, nextDuration, 40) : name ? animateSlide : (nextAction) => {
        nextAction();
        return Promise.resolve();
      };
      return animationFn(action, target, this.duration).catch(noop);
    }
  }
});

export { Animate as default };
