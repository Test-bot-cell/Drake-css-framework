import { Transition } from '../util/animation.js';
import { noop, endsWith } from '../util/lang.js';
import { css } from '../util/style.js';
import { fastdom } from '../util/fastdom.js';
import { defineComponent } from '../api/options.js';
import Parallax from '../mixin/parallax.js';

var sliderParallax = defineComponent()({
  mixins: [Parallax],
  beforeConnect() {
    this.item = this.$el.closest(`.${this.$options.id.replace("parallax", "items")} > *`);
  },
  disconnected() {
    this.item = null;
  },
  events: [
    {
      name: "itemin itemout",
      self: true,
      el: ({ item }) => item,
      handler({ type, detail }) {
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
      }
    },
    {
      name: "transitioncanceled transitionend",
      self: true,
      el: ({ item }) => item,
      handler() {
        Transition.cancel(this.$el);
      }
    },
    {
      name: "itemtranslatein itemtranslateout",
      self: true,
      el: ({ item }) => item,
      handler({ type, detail }) {
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
      }
    }
  ]
});
function isIn(type) {
  return endsWith(type, "in");
}
function getCurrentPercent(type, dir, percent) {
  percent /= 2;
  return isIn(type) !== dir < 0 ? percent : 1 - percent;
}
function isTranslationDetail(value) {
  return isRecord(value) && typeof value.percent === "number" && typeof value.dir === "number";
}
function isTransitionDetail(value) {
  return isRecord(value) && typeof value.percent === "number" && typeof value.dir === "number" && typeof value.duration === "number" && typeof value.timing === "string";
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}

export { sliderParallax as default };
