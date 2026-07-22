import { query } from '../util/selector.js';
import { css } from '../util/style.js';
import { toPx } from '../util/dimensions.js';
import { isVisible, parent } from '../util/filter.js';
import { scrolledOver, scrollParent } from '../util/viewport.js';
import { viewport, scroll, resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Parallax, { ease } from '../mixin/parallax.js';

var parallax = defineComponent()({
  mixins: [Parallax],
  props: {
    target: String,
    viewport: Number,
    // Deprecated
    easing: Number,
    start: String,
    end: String
  },
  data: {
    target: false,
    viewport: 1,
    easing: 1,
    start: 0,
    end: 0
  },
  computed: {
    target: ({ target }, $el) => getOffsetElement(target && query(target, $el) || $el),
    start({ start }) {
      return toPx(start, "height", this.target, true);
    },
    end({ end, viewport: viewport2 }) {
      return toPx(
        end || (viewport2 = (1 - viewport2) * 100) && `${viewport2}vh+${viewport2}%`,
        "height",
        this.target,
        true
      );
    }
  },
  observe: [
    viewport(),
    scroll({ target: ({ target }) => target }),
    resize({
      target: ({ $el, target }) => [$el, target, scrollParent(target, true)].filter(isNode)
    })
  ],
  update: {
    read(data, types) {
      let percent = typeof data.percent === "number" ? data.percent : false;
      if (!types.has("scroll")) {
        percent = false;
      }
      if (!isVisible(this.$el)) {
        return false;
      }
      if (!this.matchMedia) {
        return;
      }
      const prev = percent;
      percent = ease(scrolledOver(this.target, this.start, this.end), this.easing);
      return {
        percent,
        style: prev === percent ? false : this.getCss(percent)
      };
    },
    write(data) {
      if (!this.matchMedia) {
        this.reset();
        return;
      }
      if (isCssProperties(data.style)) {
        css(this.$el, data.style);
      }
    },
    events: ["scroll", "resize"]
  }
});
function getOffsetElement(el) {
  return el ? "offsetTop" in el ? el : getOffsetElement(parent(el)) : document.documentElement;
}
function isNode(value) {
  return value instanceof Node;
}
function isCssProperties(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  return Object.values(value).every(
    (item) => item == null || typeof item === "string" || typeof item === "number"
  );
}

export { parallax as default };
