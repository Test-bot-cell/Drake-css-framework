import { toggleClass } from '../util/class.js';
import { children, isVisible } from '../util/filter.js';
import { offsetPosition } from '../util/dimensions.js';
import { isRtl } from '../util/env.js';
import { mutation, resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';

var Margin = defineComponent()({
  props: {
    margin: String,
    firstColumn: Boolean
  },
  data: {
    margin: "drk-margin-small-top",
    firstColumn: "drk-first-column"
  },
  observe: [
    mutation({
      options: {
        childList: true
      }
    }),
    mutation({
      options: {
        attributes: true,
        attributeFilter: ["style"]
      }
    }),
    resize({
      handler(mutations) {
        var _a;
        for (const { target, borderBoxSize } of mutations) {
          const { inlineSize = 0, blockSize = 0 } = (_a = borderBoxSize[0]) != null ? _a : {};
          if (target === this.$el && !inlineSize && !blockSize) {
            return;
          }
        }
        this.$emit("resize");
      },
      target: ({ $el }) => [$el, ...children($el)]
    })
  ],
  update: {
    read() {
      return {
        rows: getRows(children(this.$el))
      };
    },
    write({ rows }) {
      for (const row of rows) {
        for (const el of row) {
          toggleClass(el, this.margin, rows[0] !== row);
          toggleClass(el, this.firstColumn, row[isRtl ? row.length - 1 : 0] === el);
        }
      }
    },
    events: ["resize"]
  }
});
function getRows(elements) {
  const htmlElements = elements.filter(
    (element) => element instanceof HTMLElement
  );
  const sorted = [[]];
  const withOffset = htmlElements.some(
    (el, i) => {
      var _a;
      return i > 0 && ((_a = htmlElements[i - 1]) == null ? void 0 : _a.offsetParent) !== el.offsetParent;
    }
  );
  for (const el of htmlElements) {
    if (!isVisible(el)) {
      continue;
    }
    const offset = getOffset(el, withOffset);
    for (let i = sorted.length - 1; i >= 0; i--) {
      const current = sorted[i];
      if (!current) {
        continue;
      }
      if (!current[0]) {
        current.push(el);
        break;
      }
      const offsetCurrent = getOffset(current[0], withOffset);
      if (offset.top >= offsetCurrent.bottom - 1 && offset.top !== offsetCurrent.top) {
        sorted.push([el]);
        break;
      }
      if (offset.bottom - 1 > offsetCurrent.top || offset.top === offsetCurrent.top) {
        let j = current.length - 1;
        for (; j >= 0; j--) {
          const candidate = current[j];
          if (!candidate) {
            continue;
          }
          const offsetCurrent2 = getOffset(candidate, withOffset);
          if (offset.left >= offsetCurrent2.left) {
            break;
          }
        }
        current.splice(j + 1, 0, el);
        break;
      }
      if (i === 0) {
        sorted.unshift([el]);
        break;
      }
    }
  }
  return sorted;
}
function getOffset(element, offset = false) {
  let { offsetTop, offsetLeft } = element;
  const { offsetHeight, offsetWidth } = element;
  if (offset) {
    [offsetTop, offsetLeft] = offsetPosition(element);
  }
  return {
    top: offsetTop,
    left: offsetLeft,
    bottom: offsetTop + offsetHeight,
    right: offsetLeft + offsetWidth
  };
}

export { Margin as default, getRows };
