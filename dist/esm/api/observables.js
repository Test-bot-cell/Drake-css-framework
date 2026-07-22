import { toNodes, isFunction } from '../util/lang.js';
import { on, isTouch, getEventPos, once, trigger } from '../util/event.js';
import { removeAttr } from '../util/attr.js';
import { $$ } from '../util/dom.js';
import { pointerUp, pointerCancel, pointerDown } from '../util/env.js';
import { observeResize, observeMutation, observeViewportResize, observeIntersection } from '../util/observer.js';
import { scrollParent } from '../util/viewport.js';
import { callUpdate } from './update.js';

function resize(options = {}) {
  return createObservable(
    (target, handler, observerOptions) => {
      const callback = (entries, observer) => handler(entries, observer);
      return observeResize(
        toElementInput(target),
        callback,
        isResizeOptions(observerOptions) ? observerOptions : void 0
      );
    },
    options,
    "resize"
  );
}
function intersection(options = {}) {
  return createObservable(
    (target, handler, observerOptions, args) => observeIntersection(
      toElementInput(target),
      (entries, observer) => handler(entries, observer),
      isIntersectionOptions(observerOptions) ? observerOptions : void 0,
      isIntersectionArgs(args) ? args : void 0
    ),
    options
  );
}
function mutation(options = {}) {
  return createObservable(
    (target, handler, observerOptions) => observeMutation(
      target,
      (records, observer) => handler(records, observer),
      isMutationOptions(observerOptions) ? observerOptions : void 0
    ),
    options
  );
}
function lazyload(options = {}) {
  return intersection({
    ...options,
    handler(entries, observer) {
      var _a, _b;
      const targets = isFunction(options.targets) ? options.targets(this) : (_a = options.targets) != null ? _a : this.$el;
      for (const element of toNodes(targets).filter(
        (node) => node instanceof Element
      )) {
        $$('[loading="lazy"]', element).slice(0, ((_b = options.preload) != null ? _b : 5) - 1).forEach((item) => removeAttr(item, "loading"));
      }
      for (const element of entries.filter(({ isIntersecting }) => isIntersecting).map(({ target }) => target)) {
        observer.unobserve(element);
      }
    }
  });
}
function viewport(options = {}) {
  return createObservable(
    (_target, handler) => ({
      disconnect: observeViewportResize(
        (event) => handler(event, emptyHandle)
      ).disconnect
    }),
    options,
    "resize"
  );
}
function scroll(options = {}) {
  return createObservable(
    (target, handler) => {
      const handle = {
        disconnect: on(
          toScrollTargets(target),
          "scroll",
          (event) => handler(event, handle),
          { passive: true }
        )
      };
      return handle;
    },
    options,
    "scroll"
  );
}
function swipe(options = {}) {
  const observable = {
    observe: ((target, handler) => ({
      observe() {
      },
      unobserve() {
      },
      disconnect: on(target, pointerDown, handler, { passive: true })
    })),
    handler: function(event) {
      if (!isTouch(event)) {
        return;
      }
      const position = getEventPos(event);
      const target = event.target instanceof Element ? event.target : void 0;
      once(document, `${pointerUp} ${pointerCancel} scroll`, (endEvent) => {
        const end = getEventPos(endEvent);
        if (endEvent.type !== "scroll" && target && end.x !== 0 && Math.abs(position.x - end.x) > 100 || end.y !== 0 && Math.abs(position.y - end.y) > 100) {
          setTimeout(() => {
            trigger(target, "swipe");
            trigger(
              target,
              `swipe${swipeDirection(position.x, position.y, end.x, end.y)}`
            );
          });
        }
      });
    },
    ...options
  };
  return observable;
}
function createObservable(observe, options, emit) {
  return {
    observe,
    handler: function() {
      callUpdate(this, emit);
    },
    ...options
  };
}
function swipeDirection(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? x1 - x2 > 0 ? "Left" : "Right" : y1 - y2 > 0 ? "Up" : "Down";
}
function toScrollTargets(elements) {
  return toNodes(elements).flatMap((node) => {
    var _a;
    const parentElement = scrollParent(node instanceof Element ? node : void 0, true);
    const target = parentElement === ((_a = node.ownerDocument) == null ? void 0 : _a.scrollingElement) ? node.ownerDocument : parentElement;
    return target ? [target] : [];
  });
}
function toElementInput(target) {
  return toNodes(target).filter((node) => node instanceof Element);
}
function isResizeOptions(value) {
  return typeof value === "object" && value !== null;
}
function isIntersectionOptions(value) {
  return typeof value === "object" && value !== null;
}
function isMutationOptions(value) {
  return typeof value === "object" && value !== null;
}
function isIntersectionArgs(value) {
  return typeof value === "object" && value !== null;
}
const emptyHandle = { disconnect() {
} };

export { intersection, lazyload, mutation, resize, scroll, swipe, viewport };
