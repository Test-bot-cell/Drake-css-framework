import { width } from './dimensions.js';
import { on, getEventPos, once } from './event.js';
import { matches } from './filter.js';
import { css, resetProps } from './style.js';
import { scrollParents } from './viewport.js';

let prevented = false;
function preventBackgroundScroll(element) {
  const off = on(
    element,
    "touchstart",
    (event) => {
      var _a;
      if (((_a = event.targetTouches) == null ? void 0 : _a.length) !== 1 || !(event.target instanceof Element) || matches(event.target, 'input[type="range"]')) {
        return;
      }
      let previous = getEventPos(event).y;
      const offMove = on(
        element,
        "touchmove",
        (moveEvent) => {
          const position = getEventPos(moveEvent).y;
          if (position === previous) {
            return;
          }
          previous = position;
          const target = moveEvent.target instanceof Element ? moveEvent.target : element;
          if (!scrollParents(target).some((scrollParent) => {
            if (!element.contains(scrollParent)) {
              return false;
            }
            return scrollParent.clientHeight < scrollParent.scrollHeight;
          })) {
            moveEvent.preventDefault();
          }
        },
        { passive: false }
      );
      once(element, "scroll touchend touchcancel", offMove, { capture: true });
    },
    { passive: true }
  );
  if (prevented) {
    return off;
  }
  prevented = true;
  const scrollingElement = document.scrollingElement instanceof HTMLElement ? document.scrollingElement : document.documentElement;
  const properties = {
    overflowY: CSS.supports("overflow", "clip") ? "clip" : "hidden",
    touchAction: "none",
    scrollbarGutter: width(window) - scrollingElement.clientWidth ? "stable" : ""
  };
  css(scrollingElement, properties);
  return () => {
    prevented = false;
    off();
    resetProps(scrollingElement, properties);
  };
}

export { preventBackgroundScroll };
