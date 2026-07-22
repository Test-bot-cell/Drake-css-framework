import { hasClass, addClass, removeClass } from '../util/class.js';
import { trigger } from '../util/event.js';
import { isNumber, clamp, getIndex } from '../util/lang.js';
import { $ } from '../util/dom.js';
import { isRtl } from '../util/env.js';
import { children } from '../util/filter.js';
import { defineMixin } from '../api/options.js';
import { awaitFrame } from '../util/await.js';
import I18n from './i18n.js';
import SliderAutoplay from './slider-autoplay.js';
import SliderDrag from './slider-drag.js';
import SliderNav from './slider-nav.js';

const easeOutQuad = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const easeOutQuart = "cubic-bezier(0.165, 0.84, 0.44, 1)";
var Slider = defineMixin()({
  mixins: [SliderAutoplay, SliderDrag, SliderNav, I18n],
  props: {
    clsActivated: String,
    easing: String,
    index: Number,
    finite: Boolean,
    velocity: Number
  },
  data: () => ({
    easing: "ease",
    finite: false,
    velocity: 1,
    index: 0,
    prevIndex: -1,
    stack: [],
    percent: 0,
    clsActive: "drk-active",
    clsActivated: "",
    clsEnter: "drk-slide-enter",
    clsLeave: "drk-slide-leave",
    clsSlideActive: "drk-slide-active",
    Transitioner: false,
    transitionOptions: {}
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
    duration: ({ velocity }, $el) => speedUp($el.offsetWidth / velocity),
    list: ({ selList }, $el) => $(selList, $el),
    maxIndex() {
      return this.length - 1;
    },
    slides() {
      return children(this.list).filter(
        (slide) => slide instanceof HTMLElement
      );
    },
    length() {
      return this.slides.length;
    }
  },
  watch: {
    slides(_slides, prev) {
      if (prev) {
        this.$emit();
      }
    }
  },
  events: [
    {
      name: "itemshow",
      handler({ target }) {
        addClass(target, this.clsEnter, this.clsSlideActive);
      }
    },
    {
      name: "itemshown",
      handler({ target }) {
        removeClass(target, this.clsEnter);
      }
    },
    {
      name: "itemhide",
      handler({ target }) {
        addClass(target, this.clsLeave);
      }
    },
    {
      name: "itemhidden",
      handler({ target }) {
        removeClass(target, this.clsLeave, this.clsSlideActive);
      }
    }
  ],
  methods: {
    async show(index, force = false) {
      var _a;
      if (this.dragging || !this.length || this.parallax) {
        return;
      }
      const { stack } = this;
      const queueIndex = force ? 0 : stack.length;
      const reset = () => {
        stack.splice(queueIndex, 1);
        const queued2 = stack.shift();
        if (queued2 !== void 0) {
          void this.show(queued2, true);
        }
      };
      if (force) {
        stack.unshift(index);
      } else {
        stack.push(index);
      }
      if (!force && stack.length > 1) {
        if (stack.length === 2) {
          (_a = this._transitioner) == null ? void 0 : _a.forward(Math.min(this.duration, 200));
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
      if (prev && !trigger(prev, "beforeitemhide", [this]) || !trigger(next, "beforeitemshow", [this, prev])) {
        this.index = this.prevIndex;
        reset();
        return;
      }
      if (prev) {
        trigger(prev, "itemhide", [this]);
      }
      trigger(next, "itemshow", [this]);
      await this._show(prev, next, force);
      if (prev) {
        trigger(prev, "itemhidden", [this]);
      }
      trigger(next, "itemshown", [this]);
      stack.shift();
      this._transitioner = null;
      await awaitFrame();
      const queued = stack.shift();
      if (queued !== void 0) {
        void this.show(queued, true);
      }
    },
    getIndex(index = this.index, prev = this.index) {
      return clamp(
        getIndex(index, this.slides, prev, this.finite),
        0,
        Math.max(0, this.maxIndex)
      );
    },
    getValidIndex(index = this.index, prevIndex = this.prevIndex) {
      return this.getIndex(index, prevIndex);
    },
    async _show(prev, next, force) {
      var _a;
      this._transitioner = this._getTransitioner(prev, next, this.dir, {
        easing: force ? typeof next !== "number" && next.offsetWidth < 600 ? easeOutQuad : easeOutQuart : this.easing,
        ...this.transitionOptions
      });
      if (!force && !prev) {
        this._translate(1);
        return;
      }
      const { length } = this.stack;
      return this._transitioner[length > 1 ? "forward" : "show"](
        length > 1 ? Math.min(this.duration, 75 + 75 / (length - 1)) : this.duration,
        (_a = this.percent) != null ? _a : 0
      );
    },
    _translate(percent, prev = this.prevIndex, next = this.index) {
      const transitioner = this._getTransitioner(prev === next ? false : prev, next);
      transitioner.translate(percent);
      return transitioner;
    },
    _getTransitioner(prev = this.prevIndex, next = this.index, dir = this.dir || 1, options = this.transitionOptions) {
      return new this.Transitioner(
        isNumber(prev) ? this.slides[prev] : prev || void 0,
        isNumber(next) ? this.slides[next] : next || void 0,
        dir * (isRtl ? -1 : 1),
        options
      );
    }
  }
});
function getDirection(index, prevIndex) {
  return index === "next" ? 1 : index === "previous" ? -1 : Number(index) < prevIndex ? -1 : 1;
}
function speedUp(x) {
  return 0.5 * x + 300;
}

export { Slider as default, speedUp };
