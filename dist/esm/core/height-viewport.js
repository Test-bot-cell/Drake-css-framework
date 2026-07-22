import { isNumeric, endsWith, toFloat, isString } from '../util/lang.js';
import { query } from '../util/selector.js';
import { css } from '../util/style.js';
import { boxModelAdjust, dimensions, offset } from '../util/dimensions.js';
import { isVisible } from '../util/filter.js';
import { scrollParent, offsetViewport, scrollParents } from '../util/viewport.js';
import { viewport, resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Media from '../mixin/media.js';

var heightViewport = defineComponent()({
  mixins: [Media],
  props: {
    expand: Boolean,
    offsetTop: Boolean,
    offsetBottom: Boolean,
    min: Number,
    property: String
  },
  data: {
    expand: false,
    offsetTop: false,
    offsetBottom: false,
    min: 0,
    property: "min-height"
  },
  // check for offsetTop change
  observe: [
    viewport({ filter: ({ expand }) => expand }),
    resize({ target: ({ $el }) => scrollParents($el) })
  ],
  update: {
    read() {
      if (!isVisible(this.$el)) {
        return false;
      }
      if (!this.matchMedia) {
        return { minHeight: false };
      }
      const box = boxModelAdjust(this.$el, "height", "content-box");
      const { body, scrollingElement } = document;
      const scrollElement = scrollParent(this.$el);
      const { height: viewportHeight } = offsetViewport(
        scrollElement === body ? scrollingElement : scrollElement
      );
      const isScrollingElement = scrollingElement === scrollElement || body === scrollElement;
      let minHeight = `calc(${isScrollingElement ? "100vh" : `${viewportHeight}px`}`;
      if (this.expand) {
        const diff = dimensions(scrollElement).height - dimensions(this.$el).height;
        minHeight += ` - ${diff}px`;
      } else {
        if (this.offsetTop) {
          if (isScrollingElement) {
            const offsetTopEl = this.offsetTop === true ? this.$el : query(this.offsetTop, this.$el);
            const { top } = offset(offsetTopEl);
            minHeight += top > 0 && top < viewportHeight / 2 ? ` - ${top}px` : "";
          } else {
            minHeight += ` - ${boxModelAdjust(scrollElement, "height", css(scrollElement, "boxSizing"))}px`;
          }
        }
        if (this.offsetBottom === true) {
          minHeight += ` - ${dimensions(this.$el.nextElementSibling).height}px`;
        } else if (isNumeric(this.offsetBottom)) {
          minHeight += ` - ${this.offsetBottom}vh`;
        } else if (this.offsetBottom && endsWith(this.offsetBottom, "px")) {
          minHeight += ` - ${toFloat(this.offsetBottom)}px`;
        } else if (isString(this.offsetBottom)) {
          minHeight += ` - ${dimensions(query(this.offsetBottom, this.$el)).height}px`;
        }
      }
      minHeight += `${box ? ` - ${box}px` : ""})`;
      return { minHeight };
    },
    write({ minHeight }) {
      css(
        this.$el,
        this.property,
        minHeight === false ? "" : `max(${this.min || 0}px, ${minHeight})`
      );
    },
    events: ["resize"]
  }
});

export { heightViewport as default };
