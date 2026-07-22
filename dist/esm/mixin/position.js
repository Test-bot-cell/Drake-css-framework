import { includes } from '../util/lang.js';
import { isRtl } from '../util/env.js';
import { css } from '../util/style.js';
import { toPx, flipPosition, dimensions } from '../util/dimensions.js';
import { positionAt } from '../util/position.js';
import { scrollParent } from '../util/viewport.js';
import { defineMixin } from '../api/options.js';

const positionWithViewportOffset = positionAt;
var Position = defineMixin()({
  props: {
    pos: String,
    offset: Boolean,
    flip: Boolean,
    shift: Boolean,
    inset: Boolean
  },
  data: {
    pos: `bottom-${isRtl ? "right" : "left"}`,
    offset: false,
    flip: true,
    shift: true,
    inset: false
  },
  connected() {
    const [direction = "center", alignment = "center"] = this.$props.pos.split("-").concat("center");
    this.pos = [toDirection(direction), toDirection(alignment)];
    [this.dir, this.align] = this.pos;
    this.axis = includes(["top", "bottom"], this.dir) ? "y" : "x";
  },
  methods: {
    positionAt(element, target, boundary) {
      const offset = [
        this.getPositionOffset(element),
        this.getShiftOffset(element)
      ];
      const placement = [
        this.flip ? "flip" : void 0,
        this.shift ? "shift" : void 0
      ];
      const attach = {
        element: [this.inset ? this.dir : toDirection(flipPosition(this.dir)), this.align],
        target: [this.dir, this.align]
      };
      if (this.axis === "y") {
        attach.element.reverse();
        attach.target.reverse();
        offset.reverse();
        placement.reverse();
      }
      const restoreScrollPosition = storeScrollPosition(element);
      const elDim = dimensions(element);
      css(element, { top: -elDim.height, left: -elDim.width });
      positionWithViewportOffset(element, target, {
        attach,
        offset,
        boundary,
        placement,
        viewportOffset: this.getViewportOffset(element)
      });
      restoreScrollPosition();
    },
    getPositionOffset(element = this.$el) {
      return toPx(
        this.offset === false ? css(element, "--drk-position-offset") : this.offset,
        this.axis === "x" ? "width" : "height",
        element
      ) * (includes(["left", "top"], this.dir) ? -1 : 1) * (this.inset ? -1 : 1);
    },
    getShiftOffset(element = this.$el) {
      return this.align === "center" ? 0 : toPx(
        css(element, "--drk-position-shift-offset"),
        this.axis === "y" ? "width" : "height",
        element
      ) * (includes(["left", "top"], this.align) ? 1 : -1);
    },
    getViewportOffset(element) {
      return toPx(css(element, "--drk-position-viewport-offset"));
    }
  }
});
function storeScrollPosition(element) {
  const scrollElement = scrollParent(element);
  const { scrollTop } = scrollElement;
  return () => {
    if (scrollTop !== scrollElement.scrollTop) {
      scrollElement.scrollTop = scrollTop;
    }
  };
}
function toDirection(value) {
  return ["top", "right", "bottom", "left", "center"].includes(value) ? value === "top" || value === "right" || value === "bottom" || value === "left" ? value : "center" : "center";
}

export { Position as default, storeScrollPosition };
