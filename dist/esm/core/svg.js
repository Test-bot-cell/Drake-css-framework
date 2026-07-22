import { addClass } from '../util/class.js';
import { once } from '../util/event.js';
import { includes, memoize } from '../util/lang.js';
import { css } from '../util/style.js';
import { attr, removeAttr } from '../util/attr.js';
import { isTag } from '../util/dom.js';
import { mutation } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Svg, { parseSVG } from '../mixin/svg.js';
import { getMaxPathLength } from '../util/svg.js';

var svg = defineComponent()({
  mixins: [Svg],
  args: "src",
  props: {
    src: String,
    icon: String,
    attributes: "list",
    strokeAnimation: Boolean
  },
  data: {
    strokeAnimation: false
  },
  observe: [
    mutation({
      async handler() {
        const svg = await this.svg;
        if (svg) {
          applyAttributes.call(this, svg);
        }
      },
      options: {
        attributes: true,
        attributeFilter: ["id", "class", "style"]
      }
    })
  ],
  async connected() {
    if (includes(this.src, "#")) {
      const [src = "", icon] = this.src.split("#", 2);
      this.src = src;
      this.icon = icon;
    }
    const svg = await this.svg;
    if (svg) {
      applyAttributes.call(this, svg);
      if (this.strokeAnimation) {
        applyAnimation(svg);
      }
    }
  },
  methods: {
    async getSvg() {
      if (isLazyImage(this.$el) && !this.$el.complete) {
        await new Promise((resolve) => once(this.$el, "load", () => resolve()));
      }
      return parseSVG(await loadSVG(this.src), this.icon) || Promise.reject("SVG not found.");
    }
  }
});
function applyAttributes(el) {
  const { $el } = this;
  addClass(el, attr($el, "class"), "drk-svg");
  for (let i = 0; i < $el.style.length; i++) {
    const prop = $el.style[i];
    if (prop) {
      css(el, prop, css($el, prop));
    }
  }
  for (const attribute of this.attributes) {
    const [prop, value] = attribute.split(":", 2);
    if (prop && value !== void 0) {
      attr(el, prop, value);
    }
  }
  el.ariaHidden = this.$el.ariaHidden;
  if (!this.$el.id) {
    removeAttr(el, "id");
  }
}
const loadSVG = memoize(async (src) => {
  if (src) {
    const response = await fetch(src);
    if (response.headers.get("Content-Type") === "image/svg+xml") {
      return response.text();
    }
  }
  return Promise.reject();
});
function applyAnimation(el) {
  const length = getMaxPathLength(el);
  if (length) {
    css(el, "--drk-animation-stroke", length);
  }
}
function isLazyImage(element) {
  return isTag(element, "img") && element.getAttribute("loading") === "lazy";
}

export { svg as default };
