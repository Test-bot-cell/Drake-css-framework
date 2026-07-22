import { pick } from '../util/lang.js';
import { isVisible } from '../util/filter.js';
import { css } from '../util/style.js';
import { dimensions, boxModelAdjust } from '../util/dimensions.js';
import { $$ } from '../util/dom.js';
import { resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import { getRows } from './margin.js';

var heightMatch = defineComponent()({
  args: "target",
  props: {
    target: String,
    row: Boolean
  },
  data: {
    target: "> *",
    row: true
  },
  computed: {
    elements: ({ target }, $el) => $$(target, $el)
  },
  observe: resize({
    target: ({ $el, elements }) => [
      $el,
      ...elements,
      ...elements.flatMap((el) => Array.from(el.children))
    ]
  }),
  events: {
    // Hidden elements may change height when fonts load
    name: "loadingdone",
    el: () => document.fonts,
    handler() {
      this.$emit("resize");
    }
  },
  update: {
    read() {
      return {
        rows: (this.row ? getRows(this.elements) : [this.elements]).map(match)
      };
    },
    write({ rows }) {
      for (const { heights, elements } of rows) {
        elements.forEach((el, i) => css(el, "minHeight", heights[i]));
      }
    },
    events: ["resize"]
  }
});
function match(elements) {
  if (elements.length < 2) {
    return { heights: [""], elements };
  }
  const heights = elements.map(getHeight);
  const max = Math.max(...heights);
  return {
    heights: elements.map((_el, i) => {
      const height = heights[i];
      return height !== void 0 && height.toFixed(2) === max.toFixed(2) ? "" : max;
    }),
    elements
  };
}
function getHeight(element) {
  const style = pick(element.style, ["display", "minHeight"]);
  if (!isVisible(element)) {
    css(element, "display", "block", "important");
  }
  css(element, "minHeight", "");
  const height = dimensions(element).height - boxModelAdjust(element, "height", "content-box");
  css(element, style);
  return height;
}

export { heightMatch as default };
