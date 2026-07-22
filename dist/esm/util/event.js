import { isString, isArray, toNode, toNodes } from './lang.js';
import { findAll } from './selector.js';

function on(targets, types, selectorOrListener, listenerOrCapture, capture = false) {
  const selector = typeof selectorOrListener === "function" ? false : selectorOrListener;
  const suppliedListener = typeof selectorOrListener === "function" ? selectorOrListener : listenerOrCapture;
  const options = typeof selectorOrListener === "function" ? listenerOrCapture : capture;
  if (typeof suppliedListener !== "function") {
    return () => void 0;
  }
  let listener = suppliedListener;
  if (listener.length > 1) {
    listener = withDetail(listener);
  }
  if (typeof options === "object" && options.self) {
    listener = selfFilter(listener);
  }
  if (selector) {
    listener = delegate(selector, listener);
  }
  const eventTargets = toEventTargets(targets);
  const eventTypes = isString(types) ? types.split(" ") : [...types];
  const domListener = (event) => {
    listener(event);
  };
  const domOptions = normalizeOptions(options);
  for (const type of eventTypes) {
    for (const target of eventTargets) {
      target.addEventListener(type, domListener, domOptions);
    }
  }
  return () => off(eventTargets, eventTypes, domListener, domOptions);
}
function off(targets, types, listener, capture = false) {
  const eventTypes = isString(types) ? types.split(" ") : types;
  const options = normalizeOptions(capture);
  for (const type of eventTypes) {
    for (const target of toEventTargets(targets)) {
      target.removeEventListener(type, listener, options);
    }
  }
}
function once(targets, types, selectorOrListener, listenerOrCapture, captureOrCondition, maybeCondition) {
  const selector = typeof selectorOrListener === "function" ? false : selectorOrListener;
  const listener = typeof selectorOrListener === "function" ? selectorOrListener : listenerOrCapture;
  const capture = typeof selectorOrListener === "function" ? listenerOrCapture : captureOrCondition;
  const condition = typeof selectorOrListener === "function" ? captureOrCondition : maybeCondition;
  if (typeof listener !== "function") {
    return () => void 0;
  }
  let teardown = () => void 0;
  teardown = on(
    targets,
    types,
    selector,
    ((event) => {
      var _a;
      const result = (_a = condition == null ? void 0 : condition(event)) != null ? _a : true;
      if (result) {
        teardown();
        listener(event, result);
      }
    }),
    capture
  );
  return teardown;
}
function trigger(targets, event, detail) {
  return toEventTargets(targets).map((target) => target.dispatchEvent(createEvent(event, true, true, detail))).every(Boolean);
}
function createEvent(event, bubbles = true, cancelable = false, detail) {
  return isString(event) ? new CustomEvent(event, { bubbles, cancelable, detail }) : event;
}
function delegate(selector, listener) {
  return (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const currentTarget = event.currentTarget;
    const current = selector[0] === ">" ? isQueryContext(currentTarget) ? findAll(selector, currentTarget).reverse().find((element) => element.contains(event.target)) : void 0 : event.target.closest(selector);
    if (current) {
      event.current = current;
      listener(event);
      delete event.current;
    }
  };
}
function isQueryContext(value) {
  return value !== null && typeof value === "object" && "querySelectorAll" in value;
}
function withDetail(listener) {
  return (event) => isArray(event.detail) ? listener(event, ...event.detail) : listener(event);
}
function selfFilter(listener) {
  return (event) => {
    if (event.target === event.currentTarget || event.target === event.current) {
      return listener(event);
    }
  };
}
function normalizeOptions(capture) {
  if (typeof capture !== "object" || capture === null) {
    return capture != null ? capture : false;
  }
  const options = { ...capture };
  delete options.self;
  return options;
}
function isEventTarget(target) {
  return target !== null && typeof target === "object" && "addEventListener" in target;
}
function toEventTargets(target) {
  if (isString(target)) {
    return findAll(target);
  }
  if (isEventTarget(target)) {
    return [target];
  }
  if (isArray(target)) {
    return target.map((item) => isEventTarget(item) ? item : toNode(item)).filter(isEventTarget);
  }
  return toNodes(target).filter(isEventTarget);
}
function isTouch(event) {
  return event !== null && typeof event === "object" && ("pointerType" in event && event.pointerType === "touch" || "touches" in event && Boolean(event.touches));
}
function getEventPos(event) {
  var _a, _b;
  const touch = "touches" in event ? (_b = (_a = event.touches) == null ? void 0 : _a[0]) != null ? _b : "changedTouches" in event ? event.changedTouches[0] : void 0 : void 0;
  const source = touch != null ? touch : event;
  return {
    x: "clientX" in source && typeof source.clientX === "number" ? source.clientX : 0,
    y: "clientY" in source && typeof source.clientY === "number" ? source.clientY : 0
  };
}

export { createEvent, getEventPos, isTouch, off, on, once, toEventTargets, trigger };
