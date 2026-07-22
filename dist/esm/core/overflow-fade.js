import { toggleClass, hasClass } from '../util/class.js';
import { isTouch, on, getEventPos } from '../util/event.js';
import { clamp } from '../util/lang.js';
import { css } from '../util/style.js';
import { children, selInput, isInput } from '../util/filter.js';
import { pointerDown, pointerMove, pointerUp, pointerCancel } from '../util/env.js';
import { mutation, resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';

var overflowFade = defineComponent()({
  data: {
    threshold: 5,
    fadeDuration: 0.05
  },
  events: [
    {
      name: "scroll",
      self: true,
      passive: true,
      handler() {
        this.$emit();
      }
    },
    {
      name: pointerDown,
      handler: handleMouseDrag
    }
  ],
  observe: [
    mutation({
      options: {
        subtree: true,
        childList: true
      }
    }),
    resize({
      target: ({ $el }) => [$el, ...children($el)]
    })
  ],
  update: {
    read() {
      const overflow = [
        this.$el.scrollWidth - this.$el.clientWidth,
        this.$el.scrollHeight - this.$el.clientHeight
      ];
      return { overflow };
    },
    write({ overflow }) {
      var _a, _b;
      for (let i = 0; i < 2; i++) {
        const current = (_a = overflow[i]) != null ? _a : 0;
        const previous = i > 0 ? (_b = overflow[i - 1]) != null ? _b : 0 : 0;
        toggleClass(
          this.$el,
          `${this.$options.id}-${i ? "vertical" : "horizontal"}`,
          Boolean(current && !previous)
        );
        if (!previous) {
          const dir = i ? "Top" : "Left";
          const scrollPosition = dir === "Top" ? this.$el.scrollTop : this.$el.scrollLeft;
          const percent = current ? scrollPosition / current : 0;
          const toValue = (value) => current ? clamp((this.fadeDuration - value) / this.fadeDuration) : 1;
          css(this.$el, {
            "--drk-overflow-fade-start-opacity": toValue(percent),
            "--drk-overflow-fade-end-opacity": toValue(1 - percent)
          });
        }
      }
    },
    events: ["resize"]
  }
});
function handleMouseDrag(e) {
  const { target, button, defaultPrevented } = e;
  if (defaultPrevented || button > 0 || isTouch(e) || target && target.closest(selInput) || isInput(target)) {
    return;
  }
  e.preventDefault();
  const pointerOptions = { passive: false, capture: true };
  const { $el: element, threshold, $options } = this;
  let started = false;
  const off = on(document, pointerMove, move(e), pointerOptions);
  on(document, [pointerUp, pointerCancel], end, { capture: true, once: true });
  function move(startEvent) {
    const origin = getEventPos(startEvent);
    let pos = origin;
    let lastPos = pos;
    return function(event) {
      lastPos = pos;
      pos = getEventPos(event);
      const isVertical = hasClass(element, `${$options.id}-vertical`);
      const prop = isVertical ? "y" : "x";
      started || (started = Math.abs(pos[prop] - origin[prop]) > threshold);
      if (started) {
        const delta = lastPos[prop] - pos[prop];
        if (isVertical) {
          element.scrollTop += delta;
        } else {
          element.scrollLeft += delta;
        }
      }
    };
  }
  function end() {
    off();
    if (started) {
      setTimeout(on(element, "click", (event) => event.preventDefault(), pointerOptions));
    }
  }
}

export { overflowFade as default };
