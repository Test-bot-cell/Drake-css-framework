import { noop, includes, isEqual, toArray } from '../util/lang.js';
import { off, on, trigger, isTouch, getEventPos } from '../util/event.js';
import { css } from '../util/style.js';
import { selInput } from '../util/filter.js';
import { isRtl } from '../util/env.js';
import { defineMixin } from '../api/options.js';

const pointerOptions = { passive: false, capture: true };
const pointerDown = "touchstart mousedown";
const pointerMove = "touchmove mousemove";
const pointerUp = "touchend touchcancel mouseup click input scroll";
var SliderDrag = defineMixin()({
  props: {
    draggable: Boolean
  },
  data: {
    draggable: true,
    threshold: 10,
    angleThreshold: 45
  },
  created() {
    for (const key of ["start", "move", "end"]) {
      const fn = this[key];
      this[key] = (e) => {
        const pos = getEventPos(e);
        if (isRtl) {
          pos.x = -pos.x;
        }
        this.prevPos = isEqual(pos, this.pos) ? this.prevPos : this.pos;
        this.pos = pos;
        fn(e);
      };
    }
  },
  events: [
    {
      name: pointerDown,
      passive: true,
      delegate: ({ selList }) => `${String(selList)} > *`,
      handler(e) {
        var _a;
        if (!this.draggable || this.parallax || !isTouch(e) && hasSelectableText(e.target) || e.target.closest(selInput) || ((_a = e.button) != null ? _a : 0) > 0 || this.length < 2) {
          return;
        }
        this.start(e);
      }
    },
    {
      name: "dragstart",
      handler(e) {
        e.preventDefault();
      }
    },
    {
      // iOS workaround for slider stopping if swiping fast
      name: pointerMove,
      el: ({ list }) => list,
      handler: noop,
      ...pointerOptions
    }
  ],
  methods: {
    start() {
      var _a, _b, _c;
      this.drag = this.pos;
      if (this._transitioner) {
        this.percent = this._transitioner.percent();
        this.drag.x += ((_a = this._transitioner.getDistance()) != null ? _a : 0) * ((_b = this.percent) != null ? _b : 0) * this.dir;
        this._transitioner.cancel();
        this._transitioner.translate((_c = this.percent) != null ? _c : 0);
        this.dragging = true;
        this.stack = [];
      } else {
        this.prevIndex = this.index;
      }
      on(document, pointerMove, this.move, pointerOptions);
      on(document, pointerUp, this.end, { passive: true, capture: true, once: true });
      css(this.list, "userSelect", "none");
    },
    move(e) {
      if (!this.drag) {
        return;
      }
      const distance = this.pos.x - this.drag.x;
      if (distance === 0 || !this.dragging && getAngle(this.pos, this.drag) > this.angleThreshold || this.prevPos.x === this.pos.x || !this.dragging && Math.abs(distance) < this.threshold) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
      this.dragging = true;
      this.dir = distance < 0 ? 1 : -1;
      const { slides } = this;
      let { prevIndex } = this;
      let dis = Math.abs(distance);
      let nextIndex = this.getIndex(prevIndex + this.dir);
      let width = getDistance.call(this, prevIndex, nextIndex);
      while (nextIndex !== prevIndex && dis > width) {
        this.drag.x -= width * this.dir;
        prevIndex = nextIndex;
        dis -= width;
        nextIndex = this.getIndex(prevIndex + this.dir);
        width = getDistance.call(this, prevIndex, nextIndex);
      }
      this.percent = dis / width;
      const prev = slides[prevIndex];
      const next = slides[nextIndex];
      const changed = this.index !== nextIndex;
      const edge = prevIndex === nextIndex;
      let itemShown = false;
      for (const i of [this.index, this.prevIndex]) {
        if (!includes([nextIndex, prevIndex], i)) {
          trigger(slides[i], "itemhidden", [this]);
          if (edge) {
            itemShown = true;
            this.prevIndex = prevIndex;
          }
        }
      }
      if (this.index === prevIndex && this.prevIndex !== prevIndex || itemShown) {
        trigger(slides[this.index], "itemshown", [this]);
      }
      if (changed) {
        this.prevIndex = prevIndex;
        this.index = nextIndex;
        if (!edge) {
          trigger(prev, "beforeitemhide", [this]);
          trigger(prev, "itemhide", [this]);
        }
        trigger(next, "beforeitemshow", [this]);
        trigger(next, "itemshow", [this]);
      }
      this._transitioner = this._translate(Math.abs(this.percent), prev, !edge && next);
    },
    end() {
      var _a, _b;
      off(document, pointerMove, this.move, pointerOptions);
      if (this.dragging) {
        setTimeout(on(this.list, "click", (e) => e.preventDefault(), pointerOptions));
        this.dragging = null;
        if (this.index === this.prevIndex) {
          this.percent = 1 - ((_a = this.percent) != null ? _a : 0);
          this.dir *= -1;
          this._show(false, this.index, true);
          this._transitioner = null;
        } else {
          const dirChange = this.dir < 0 === this.prevPos.x > this.pos.x;
          if (dirChange) {
            trigger(this.slides[this.prevIndex], "itemhidden", [this]);
            trigger(this.slides[this.index], "itemshown", [this]);
            this.percent = 1 - ((_b = this.percent) != null ? _b : 0);
          } else {
            this.index = this.prevIndex;
          }
          this.show(
            this.dir > 0 && !dirChange || this.dir < 0 && dirChange ? "next" : "previous",
            true
          );
        }
      }
      css(this.list, { userSelect: "" });
      this.drag = this.percent = null;
    }
  }
});
function getDistance(prev, next) {
  var _a;
  return this._getTransitioner(prev, prev !== next && next).getDistance() || ((_a = this.slides[prev]) == null ? void 0 : _a.offsetWidth) || 0;
}
function hasSelectableText(el) {
  return css(el, "userSelect") !== "none" && toArray(el.childNodes).some(
    (child) => {
      var _a;
      return child.nodeType === 3 && Boolean((_a = child.textContent) == null ? void 0 : _a.trim());
    }
  );
}
function getAngle(pos1, pos2) {
  return Math.atan2(Math.abs(pos2.y - pos1.y), Math.abs(pos2.x - pos1.x)) * 180 / Math.PI;
}

export { SliderDrag as default };
