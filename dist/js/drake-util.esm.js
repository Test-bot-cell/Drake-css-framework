/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

const { hasOwnProperty, toString } = Object.prototype;
function hasOwn(object, key) {
  return hasOwnProperty.call(object, key);
}
const hyphenateRe = /\B([A-Z])/g;
const hyphenate = memoize(
  (value) => value.replace(hyphenateRe, "-$1").toLowerCase()
);
const camelizeRe = /-(\w)/g;
const camelize = memoize(
  (value) => (value.charAt(0).toLowerCase() + value.slice(1)).replace(
    camelizeRe,
    (_, character) => character.toUpperCase()
  )
);
const ucfirst = memoize((value) => value.charAt(0).toUpperCase() + value.slice(1));
function startsWith(value, search) {
  return typeof value === "string" && value.startsWith(search);
}
function endsWith(value, search) {
  return typeof value === "string" && value.endsWith(search);
}
function includes(value, search) {
  if (typeof value === "string") {
    return typeof search === "string" && value.includes(search);
  }
  return Array.isArray(value) && value.includes(search);
}
function findIndex(array, predicate) {
  var _a;
  return (_a = array == null ? void 0 : array.findIndex(predicate)) != null ? _a : -1;
}
const isArray = Array.isArray;
function toArray(value) {
  return Array.from(value);
}
const assign = Object.assign;
function isFunction(value) {
  return typeof value === "function";
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isPlainObject(value) {
  return toString.call(value) === "[object Object]";
}
function isWindow(value) {
  return isObject(value) && value === value.window;
}
function isDocument(value) {
  return nodeType(value) === 9;
}
function isNode(value) {
  return nodeType(value) >= 1;
}
function isElement(value) {
  return nodeType(value) === 1;
}
function nodeType(value) {
  return !isWindow(value) && isObject(value) && typeof value.nodeType === "number" ? value.nodeType : 0;
}
function isBoolean(value) {
  return typeof value === "boolean";
}
function isString(value) {
  return typeof value === "string";
}
function isNumber(value) {
  return typeof value === "number";
}
function isNumeric(value) {
  return isNumber(value) || isString(value) && value.trim() !== "" && !Number.isNaN(Number(value));
}
function isEmpty(value) {
  return !(isArray(value) ? value.length : isObject(value) ? Object.keys(value).length : false);
}
function isUndefined(value) {
  return value === void 0;
}
function toBoolean(value) {
  return isBoolean(value) ? value : value === "true" || value === "1" || value === "" ? true : value === "false" || value === "0" ? false : value;
}
function toNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? false : number;
}
function toFloat(value) {
  return Number.parseFloat(String(value)) || 0;
}
function toNode(value) {
  return toNodes(value)[0];
}
function toNodes(value) {
  if (isNode(value)) {
    return [value];
  }
  if (!isCollection(value)) {
    return [];
  }
  return Array.from(value).filter(isNode);
}
function isCollection(value) {
  if (!isObject(value)) {
    return false;
  }
  return typeof value.length === "number" || Symbol.iterator in value && typeof value[Symbol.iterator] === "function";
}
function toWindow(value) {
  var _a;
  if (isWindow(value)) {
    return value;
  }
  const node = toNode(value);
  const document = isDocument(node) ? node : node == null ? void 0 : node.ownerDocument;
  return (_a = document == null ? void 0 : document.defaultView) != null ? _a : window;
}
function isEqual(value, other) {
  return value === other || isObject(value) && isObject(other) && Object.keys(value).length === Object.keys(other).length && each(value, (item, key) => item === other[key]);
}
function swap(value, first, second) {
  return value.replace(
    new RegExp(`${first}|${second}`, "g"),
    (match) => match === first ? second : first
  );
}
function last(array) {
  return array[array.length - 1];
}
function each(object, callback) {
  const record = object;
  for (const key in record) {
    if (callback(record[key], key) === false) {
      return false;
    }
  }
  return true;
}
function sortBy(array, property) {
  return array.slice().sort((first, second) => {
    const firstValue = toComparable(first[property]);
    const secondValue = toComparable(second[property]);
    return firstValue > secondValue ? 1 : secondValue > firstValue ? -1 : 0;
  });
}
function toComparable(value) {
  return typeof value === "number" || typeof value === "string" ? value : 0;
}
function sumBy(array, iteratee) {
  return array.reduce((sum, item) => {
    const value = isFunction(iteratee) ? iteratee(item) : isObject(item) ? item[iteratee] : item;
    return sum + toFloat(value);
  }, 0);
}
function uniqueBy(array, property) {
  const seen = /* @__PURE__ */ new Set();
  return array.filter((item) => {
    const value = item[property];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
function pick(object, properties) {
  const result = {};
  for (const property of properties) {
    result[property] = object[property];
  }
  return result;
}
function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(toNumber(value) || 0, min), max);
}
function noop() {
}
function intersectRect(...rects) {
  return Math.min(...rects.map(({ bottom }) => bottom)) - Math.max(...rects.map(({ top }) => top)) > 0 && Math.min(...rects.map(({ right }) => right)) - Math.max(...rects.map(({ left }) => left)) > 0;
}
function pointInRect(point, rect) {
  return point.x <= rect.right && point.x >= rect.left && point.y <= rect.bottom && point.y >= rect.top;
}
function ratio(dimensions, property, value) {
  const otherProperty = property === "width" ? "height" : "width";
  return {
    ...dimensions,
    [otherProperty]: dimensions[property] ? Math.round(value * dimensions[otherProperty] / dimensions[property]) : dimensions[otherProperty],
    [property]: value
  };
}
function contain(dimensions, maximum) {
  let result = { ...dimensions };
  for (const property of ["width", "height"]) {
    if (result[property] > maximum[property]) {
      result = ratio(result, property, maximum[property]);
    }
  }
  return result;
}
function cover(dimensions, maximum) {
  let result = contain(dimensions, maximum);
  for (const property of ["width", "height"]) {
    if (result[property] < maximum[property]) {
      result = ratio(result, property, maximum[property]);
    }
  }
  return result;
}
const Dimensions = { ratio, contain, cover };
function getIndex(index, elements, current = 0, finite = false) {
  const nodes = toNodes(elements);
  const { length } = nodes;
  if (!length) {
    return -1;
  }
  let resolved = isNumeric(index) ? toNumber(index) || 0 : index === "next" ? current + 1 : index === "previous" ? current - 1 : index === "last" ? length - 1 : nodes.indexOf(index);
  if (finite) {
    return clamp(resolved, 0, length - 1);
  }
  resolved %= length;
  return resolved < 0 ? resolved + length : resolved;
}
function memoize(callback) {
  const cache = /* @__PURE__ */ new Map();
  return (key, ...args) => {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
    const value = callback(key, ...args);
    cache.set(key, value);
    return value;
  };
}

function addClass(element, ...classes) {
  for (const node of toNodes(element)) {
    const additions = toClasses(classes).filter((className) => !hasClass(node, className));
    if (additions.length) {
      node.classList.add(...additions);
    }
  }
}
function removeClass(element, ...classes) {
  for (const node of toNodes(element)) {
    const removals = toClasses(classes).filter((className) => hasClass(node, className));
    if (removals.length) {
      node.classList.remove(...removals);
    }
  }
}
function replaceClass(element, oldClass, newClass) {
  const newClasses = toClasses(newClass);
  const oldClasses = toClasses(oldClass).filter((className) => !includes(newClasses, className));
  removeClass(element, oldClasses);
  addClass(element, newClasses);
}
function hasClass(element, value) {
  const [className] = toClasses(value);
  return Boolean(
    className && toNodes(element).some((node) => node.classList.contains(className))
  );
}
function toggleClass(element, value, force) {
  const classes = toClasses(value);
  const toggle = isUndefined(force) ? void 0 : Boolean(force);
  for (const node of toNodes(element)) {
    for (const className of classes) {
      node.classList.toggle(className, toggle);
    }
  }
}
function toClasses(value) {
  if (!value) {
    return [];
  }
  return isArray(value) ? value.flatMap((item) => toClasses(item)) : String(value).split(" ").filter(Boolean);
}

function attr(element, name, value) {
  var _a;
  if (isObject(name)) {
    for (const key in name) {
      const attributeValue = name[key];
      if (isAttributeValue(attributeValue)) {
        attr(element, key, attributeValue);
      }
    }
    return;
  }
  if (isUndefined(value)) {
    return (_a = toNode(element)) == null ? void 0 : _a.getAttribute(name);
  }
  for (const item of toNodes(element)) {
    if (value === null) {
      removeAttr(item, name);
    } else {
      item.setAttribute(name, String(value));
    }
  }
}
function isAttributeValue(value) {
  return ["string", "number", "boolean"].includes(typeof value) || value === null;
}
function hasAttr(element, name) {
  return toNodes(element).some((item) => item.hasAttribute(name));
}
function removeAttr(element, name) {
  toNodes(element).forEach((item) => item.removeAttribute(name));
}
function data(element, attribute) {
  for (const name of [attribute, `data-${attribute}`]) {
    if (hasAttr(element, name)) {
      return attr(element, name);
    }
  }
}

const inBrowser = typeof window !== "undefined";
const isRtl = inBrowser && document.dir === "rtl";
const hasTouch = inBrowser && "ontouchstart" in window;
const hasPointerEvents = inBrowser && window.PointerEvent;
const pointerDown = hasPointerEvents ? "pointerdown" : hasTouch ? "touchstart" : "mousedown";
const pointerMove = hasPointerEvents ? "pointermove" : hasTouch ? "touchmove" : "mousemove";
const pointerUp = hasPointerEvents ? "pointerup" : hasTouch ? "touchend" : "mouseup";
const pointerEnter = hasPointerEvents ? "pointerenter" : hasTouch ? "" : "mouseenter";
const pointerLeave = hasPointerEvents ? "pointerleave" : hasTouch ? "" : "mouseleave";
const pointerCancel = hasPointerEvents ? "pointercancel" : "touchcancel";

const voidElements = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
function isVoidElement(element) {
  return toNodes(element).some((item) => voidElements.has(item.tagName.toLowerCase()));
}
function isVisible(element) {
  return toNodes(element).some((item) => {
    if (inBrowser && typeof item.checkVisibility === "function") {
      return item.checkVisibility();
    }
    return item instanceof HTMLElement && Boolean(item.offsetWidth || item.offsetHeight) || item.getClientRects().length > 0;
  });
}
const selInput = "input,select,textarea,button";
function isInput(element) {
  return toNodes(element).some((item) => matches(item, selInput));
}
const selFocusable = `${selInput},a[href],[tabindex]`;
function isFocusable(element) {
  return matches(element, selFocusable);
}
function parent(element) {
  var _a;
  return (_a = toNode(element)) == null ? void 0 : _a.parentElement;
}
function filter(elements, selector) {
  return toNodes(elements).filter((element) => matches(element, selector));
}
function matches(element, selector) {
  return toNodes(element).some((item) => item.matches(selector));
}
function parents(element, selector) {
  const result = [];
  let current = parent(element);
  while (current) {
    if (!selector || matches(current, selector)) {
      result.push(current);
    }
    current = current.parentElement;
  }
  return result;
}
function children(element, selector) {
  const node = toNode(element);
  const result = node ? toArray(node.children) : [];
  return selector ? filter(result, selector) : result;
}
function index(element, reference) {
  const node = toNode(element);
  if (!node) {
    return -1;
  }
  const referenceNode = toNode(reference);
  return referenceNode ? toNodes(element).indexOf(referenceNode) : children(parent(node)).indexOf(node);
}
function isSameSiteAnchor(element) {
  const node = toNode(element);
  return node instanceof HTMLAnchorElement && ["origin", "pathname", "search"].every(
    (part) => node[part] === location[part]
  );
}
function getTargetedElement(element) {
  var _a;
  const anchor = toNode(element);
  if (!(anchor instanceof HTMLAnchorElement) || !isSameSiteAnchor(anchor)) {
    return;
  }
  const { hash, ownerDocument } = anchor;
  const id = decodeURIComponent(hash).slice(1);
  return id ? (_a = ownerDocument.getElementById(id)) != null ? _a : ownerDocument.getElementsByName(id)[0] : ownerDocument.documentElement;
}

function query(selector, context) {
  return find(selector, getContext(selector, context));
}
function queryAll(selector, context) {
  return findAll(selector, getContext(selector, context));
}
function find(selector, context) {
  var _a;
  if (!isString(selector)) {
    return toNode(selector);
  }
  return (_a = _query(selector, context != null ? context : document, "querySelector")) != null ? _a : void 0;
}
function findAll(selector, context) {
  if (!isString(selector)) {
    return toNodes(selector);
  }
  return toNodes(_query(selector, context != null ? context : document, "querySelectorAll"));
}
function getContext(selector, context = document) {
  return isDocument(context) || isString(selector) && parseSelector(selector).isContextSelector ? context : context.ownerDocument;
}
const addStarRe = /([!>+~-])(?=\s+[!>+~-]|\s*$)/g;
const splitSelectorRe = /(\([^)]*\)|[^,])+/g;
const parseSelector = memoize((selector) => {
  var _a, _b;
  const selectors = [];
  let isContextSelector = false;
  for (let item of (_a = selector.match(splitSelectorRe)) != null ? _a : []) {
    item = item.trim().replace(addStarRe, "$1 *");
    isContextSelector || (isContextSelector = ["!", "+", "~", "-", ">"].includes((_b = item[0]) != null ? _b : ""));
    selectors.push(item);
  }
  return { selector: selectors.join(","), selectors, isContextSelector };
});
const positionRe = /(\([^)]*\)|\S)*/;
function parsePositionSelector(selector) {
  var _a, _b;
  const value = selector.slice(1).trim();
  const position = (_b = (_a = value.match(positionRe)) == null ? void 0 : _a[0]) != null ? _b : "";
  return [position, value.slice(position.length + 1)];
}
function _query(selector, context, queryFunction) {
  var _a, _b;
  const parsed = parseSelector(selector);
  if (!parsed.isContextSelector) {
    return parsed.selector ? doQuery(context, queryFunction, parsed.selector) : null;
  }
  let combined = "";
  const isSingle = parsed.selectors.length === 1;
  for (let item of parsed.selectors) {
    let current = context;
    if (item[0] === "!") {
      const [positionSelector, remainingSelector] = parsePositionSelector(item);
      item = remainingSelector;
      current = context instanceof Element ? (_b = (_a = context.parentElement) == null ? void 0 : _a.closest(positionSelector)) != null ? _b : null : null;
      if (!item && isSingle) {
        return current;
      }
    }
    if (current instanceof Element && item[0] === "-") {
      const [positionSelector, remainingSelector] = parsePositionSelector(item);
      item = remainingSelector;
      const previous = current.previousElementSibling;
      current = previous && matches(previous, positionSelector) ? previous : null;
      if (!item && isSingle) {
        return current;
      }
    }
    if (!current) {
      continue;
    }
    if (isSingle) {
      if (current instanceof Element && (item[0] === "~" || item[0] === "+")) {
        item = `:scope > :nth-child(${index(current) + 1}) ${item}`;
        current = current.parentElement;
      } else if (item[0] === ">") {
        item = `:scope ${item}`;
      }
      return current ? doQuery(current, queryFunction, item) : null;
    }
    if (current instanceof Element) {
      combined += `${combined ? "," : ""}${domPath(current)} ${item}`;
    }
  }
  const root = isDocument(context) ? context : context.ownerDocument;
  return doQuery(root, queryFunction, combined);
}
function doQuery(context, queryFunction, selector) {
  try {
    return queryFunction === "querySelector" ? context.querySelector(selector) : context.querySelectorAll(selector);
  } catch {
    return null;
  }
}
function domPath(element) {
  const names = [];
  let current = element;
  while (current) {
    const id = attr(current, "id");
    if (id) {
      names.unshift(`#${escape(id)}`);
      break;
    }
    let tagName = current.tagName;
    if (tagName !== "HTML") {
      tagName += `:nth-child(${index(current) + 1})`;
    }
    names.unshift(tagName);
    current = current.parentElement;
  }
  return names.join(" > ");
}
function escape(value) {
  return isString(value) ? CSS.escape(value) : "";
}

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

const cssNumber = /* @__PURE__ */ new Set([
  "animation-iteration-count",
  "column-count",
  "fill-opacity",
  "flex-grow",
  "flex-shrink",
  "font-weight",
  "line-height",
  "opacity",
  "order",
  "orphans",
  "stroke-dasharray",
  "stroke-dashoffset",
  "widows",
  "z-index",
  "zoom"
]);
function css(element, property, value, priority) {
  const elements = Array.from(element instanceof Node ? [element] : element != null ? element : []).filter(
    (item) => item instanceof HTMLElement || item instanceof SVGElement
  );
  const first = elements[0];
  if (isString(property) && value === void 0) {
    return first ? getComputedStyle(first).getPropertyValue(propName(property)) : "";
  }
  if (Array.isArray(property)) {
    const result = {};
    for (const name2 of property) {
      result[name2] = css(first, String(name2));
    }
    return result;
  }
  if (isObject(property)) {
    const objectPriority = isString(value) ? value : void 0;
    for (const name2 in property) {
      const propertyValue = property[name2];
      if (isCssValue(propertyValue)) {
        css(elements, name2, propertyValue, objectPriority);
      }
    }
    return first;
  }
  const name = propName(property);
  for (const item of elements) {
    const propertyValue = isNumeric(value) && !cssNumber.has(name) && !isCustomProperty(name) ? `${value}px` : value || isNumber(value) ? String(value) : "";
    item.style.setProperty(name, propertyValue, priority);
  }
  return first;
}
function isCssValue(value) {
  return value === null || value === void 0 || ["string", "number"].includes(typeof value);
}
function resetProps(element, properties) {
  for (const property in properties) {
    css(element, property, "");
  }
}
const propName = memoize((value) => {
  if (isCustomProperty(value)) {
    return value;
  }
  const name = hyphenate(value);
  const { style } = document.documentElement;
  if (name in style) {
    return name;
  }
  for (const prefix of ["webkit", "moz"]) {
    const prefixedName = `-${prefix}-${name}`;
    if (prefixedName in style) {
      return prefixedName;
    }
  }
  return name;
});
function isCustomProperty(name) {
  return name.startsWith("--");
}

const clsTransition = "drk-transition";
const transitionEnd = "transitionend";
const transitionCanceled = "transitioncanceled";
function transition(input, properties, duration = 400, timing = "linear", skipReflow = false) {
  const roundedDuration = Math.round(duration);
  return Promise.all(
    toNodes(input).map(
      (element) => new Promise((resolve, reject) => {
        if (!skipReflow) {
          void element.offsetHeight;
        }
        const timer = setTimeout(
          () => trigger(element, transitionEnd),
          roundedDuration
        );
        const transitionProperties = {
          transitionProperty: Object.keys(properties).map(propName).join(","),
          transitionDuration: `${roundedDuration}ms`,
          transitionTimingFunction: timing
        };
        once(
          element,
          [transitionEnd, transitionCanceled],
          ({ type }) => {
            clearTimeout(timer);
            removeClass(element, clsTransition);
            resetProps(element, transitionProperties);
            if (type === transitionCanceled) {
              reject(new Error(transitionCanceled));
            } else {
              resolve(element);
            }
          },
          { self: true }
        );
        addClass(element, clsTransition);
        css(element, { ...transitionProperties, ...properties });
      })
    )
  );
}
const Transition = {
  start: transition,
  async stop(element) {
    trigger(element, transitionEnd);
    await Promise.resolve();
  },
  async cancel(element) {
    trigger(element, transitionCanceled);
    await Promise.resolve();
  },
  inProgress(element) {
    return hasClass(element, clsTransition);
  }
};
const clsAnimation = "drk-animation";
const animationEnd = "animationend";
const animationCanceled = "animationcanceled";
function animate(input, animation, duration = 200, origin, out = false) {
  return Promise.all(
    toNodes(input).map(
      (element) => new Promise((resolve, reject) => {
        if (hasClass(element, clsAnimation)) {
          trigger(element, animationCanceled);
        }
        const classes = [
          animation,
          clsAnimation,
          `${clsAnimation}-${out ? "leave" : "enter"}`,
          origin && `drk-transform-origin-${origin}`,
          out && `${clsAnimation}-reverse`
        ];
        const timer = setTimeout(() => trigger(element, animationEnd), duration);
        once(
          element,
          [animationEnd, animationCanceled],
          ({ type }) => {
            clearTimeout(timer);
            if (type === animationCanceled) {
              reject(new Error(animationCanceled));
            } else {
              resolve(element);
            }
            css(element, "animationDuration", "");
            removeClass(element, classes);
          },
          { self: true }
        );
        css(element, "animationDuration", `${duration}ms`);
        addClass(element, classes);
      })
    )
  );
}
const Animation = {
  in: animate,
  out(element, animation, duration, origin) {
    return animate(element, animation, duration, origin, true);
  },
  inProgress(element) {
    return hasClass(element, clsAnimation);
  },
  cancel(element) {
    trigger(element, animationCanceled);
  }
};

function ready(callback) {
  if (document.readyState !== "loading") {
    callback();
    return;
  }
  once(document, "DOMContentLoaded", callback);
}
function isTag(element, ...tagNames) {
  return element instanceof Element && tagNames.some((tagName) => element.tagName.toLowerCase() === tagName.toLowerCase());
}
function empty(element) {
  const node = $(element);
  if (node) {
    node.innerHTML = "";
  }
  return node;
}
function html(element, value) {
  const node = $(element);
  return value === void 0 ? node == null ? void 0 : node.innerHTML : append(empty(element), value);
}
const prepend = applyInsert("prepend");
const append = applyInsert("append");
const before = applyInsert("before");
const after = applyInsert("after");
function applyInsert(method) {
  return (reference, value) => {
    const nodes = toNodes(isString(value) ? fragment(value) : value);
    const node = $(reference);
    if (node) {
      node[method](...nodes);
    }
    return unwrapSingle(nodes);
  };
}
function remove$1(element) {
  toNodes(element).forEach((node) => {
    var _a;
    return (_a = node.parentNode) == null ? void 0 : _a.removeChild(node);
  });
}
function wrapAll(element, structure) {
  let wrapper = toNode(before(element, structure));
  while (wrapper instanceof Element && wrapper.firstElementChild) {
    wrapper = wrapper.firstElementChild;
  }
  if (wrapper instanceof Element) {
    append(wrapper, element);
    return wrapper;
  }
}
function wrapInner(element, structure) {
  return toNodes(
    toNodes(element).map(
      (node) => node.hasChildNodes() ? wrapAll(toArray(node.childNodes), structure) : append(node, structure)
    )
  );
}
function unwrap(element) {
  const uniqueParents = toNodes(element).map((node) => parent(node)).filter((value) => Boolean(value)).filter((value, index, values) => values.indexOf(value) === index);
  uniqueParents.forEach((node) => node.replaceWith(...node.childNodes));
}
const singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
function fragment(value) {
  const matches = singleTagRe.exec(value);
  if (matches == null ? void 0 : matches[1]) {
    return document.createElement(matches[1]);
  }
  const container = document.createElement("template");
  container.innerHTML = value.trim();
  return unwrapSingle(toArray(container.content.childNodes));
}
function unwrapSingle(nodes) {
  return nodes.length > 1 ? [...nodes] : nodes[0];
}
function apply(node, callback) {
  if (!isElement(node)) {
    return;
  }
  callback(node);
  for (const child of toArray(node.children)) {
    apply(child, callback);
  }
}
function $(selector, context) {
  return isHtml(selector) ? toNode(fragment(selector)) : find(selector, context);
}
function $$(selector, context) {
  return isHtml(selector) ? toNodes(fragment(selector)) : findAll(selector, context);
}
function isHtml(value) {
  return isString(value) && startsWith(value.trim(), "<");
}

const dirs$1 = {
  width: ["left", "right"],
  height: ["top", "bottom"]
};
function dimensions(element) {
  const rect = isElement(element) ? element.getBoundingClientRect() : { height: height(element), width: width(element), top: 0, left: 0 };
  return {
    height: rect.height,
    width: rect.width,
    top: rect.top,
    left: rect.left,
    x: rect.left,
    y: rect.top,
    bottom: rect.top + rect.height,
    right: rect.left + rect.width
  };
}
function offset(element, coordinates) {
  if (coordinates) {
    css(toElementInput(element), { left: 0, top: 0 });
  }
  const currentOffset = dimensions(element);
  if (element) {
    const { scrollY, scrollX } = toWindow(element);
    currentOffset.top += scrollY;
    currentOffset.bottom += scrollY;
    currentOffset.left += scrollX;
    currentOffset.right += scrollX;
  }
  if (!coordinates) {
    return currentOffset;
  }
  css(toElementInput(element), "left", coordinates.left - currentOffset.left);
  css(toElementInput(element), "top", coordinates.top - currentOffset.top);
}
function position(element) {
  var _a;
  const node = toHtmlElement(element);
  if (!node) {
    return { top: 0, left: 0 };
  }
  let { top, left } = offset(node);
  const { body, documentElement } = node.ownerDocument;
  let offsetParent = (_a = node.offsetParent) != null ? _a : documentElement;
  while (offsetParent && (offsetParent === body || offsetParent === documentElement) && css(offsetParent, "position") === "static") {
    offsetParent = offsetParent.parentElement;
  }
  if (offsetParent) {
    const parentOffset = offset(offsetParent);
    top -= parentOffset.top + toFloat(css(offsetParent, "borderTopWidth"));
    left -= parentOffset.left + toFloat(css(offsetParent, "borderLeftWidth"));
  }
  return {
    top: top - toFloat(css(node, "marginTop")),
    left: left - toFloat(css(node, "marginLeft"))
  };
}
function offsetPosition(element) {
  let node = toHtmlElement(element);
  if (!node) {
    return [0, 0];
  }
  const result = [node.offsetTop, node.offsetLeft];
  while (node = node.offsetParent instanceof HTMLElement ? node.offsetParent : void 0) {
    result[0] += node.offsetTop + toFloat(css(node, "borderTopWidth"));
    result[1] += node.offsetLeft + toFloat(css(node, "borderLeftWidth"));
    if (css(node, "position") === "fixed") {
      const win = toWindow(node);
      result[0] += win.scrollY;
      result[1] += win.scrollX;
      return result;
    }
  }
  return result;
}
const height = dimension("height");
const width = dimension("width");
function dimension(property) {
  return ((element, value) => {
    if (value === void 0) {
      if (isWindow(element)) {
        return property === "height" ? element.innerHeight : element.innerWidth;
      }
      if (isDocument(element)) {
        const documentElement = element.documentElement;
        return property === "height" ? Math.max(documentElement.offsetHeight, documentElement.scrollHeight) : Math.max(documentElement.offsetWidth, documentElement.scrollWidth);
      }
      const node = toHtmlElement(element);
      if (!node) {
        return 0;
      }
      const computed = css(node, property);
      const measured = computed === "auto" ? property === "height" ? node.offsetHeight : node.offsetWidth : toFloat(computed) || 0;
      return measured - boxModelAdjust(node, property);
    }
    const nodeInput = toElementInput(element);
    const adjusted = !value && value !== 0 ? "" : `${Number(value) + boxModelAdjust(nodeInput, property)}px`;
    return css(nodeInput, property, adjusted);
  });
}
function boxModelAdjust(element, property, sizing = "border-box") {
  return css(element, "boxSizing") === sizing ? sumBy(
    dirs$1[property],
    (side) => toFloat(css(element, `padding-${side}`)) + toFloat(css(element, `border-${side}-width`))
  ) : 0;
}
function flipPosition(position2) {
  var _a;
  for (const sides of Object.values(dirs$1)) {
    const index = sides.indexOf(position2);
    if (index >= 0) {
      return (_a = sides[1 - index]) != null ? _a : position2;
    }
  }
  return position2;
}
function toPx(value, property = "width", element = window, offsetDimension = false) {
  if (!isString(value)) {
    return toFloat(value);
  }
  return sumBy(parseCalc(value), (part) => {
    const unit = parseUnit(part);
    if (!unit) {
      return part;
    }
    const base = unit === "vh" ? getViewportHeight() : unit === "vw" ? width(toWindow(element)) : offsetDimension && element instanceof HTMLElement ? property === "height" ? element.offsetHeight : element.offsetWidth : dimensions(element)[property];
    return percent(base, part);
  });
}
const calcRe = /-?\d+(?:\.\d+)?(?:v[wh]|%|px)?/g;
const parseCalc = memoize(
  (calculation) => {
    var _a;
    return (_a = calculation.replace(/\s/g, "").match(calcRe)) != null ? _a : [];
  }
);
const unitRe = /(?:v[hw]|%)$/;
const parseUnit = memoize((value) => {
  var _a;
  return (_a = value.match(unitRe)) == null ? void 0 : _a[0];
});
function percent(base, value) {
  return base * toFloat(value) / 100;
}
let viewportHeight;
let viewportElement;
function getViewportHeight() {
  if (viewportHeight) {
    return viewportHeight;
  }
  if (!viewportElement) {
    viewportElement = $("<div>");
    if (!viewportElement) {
      return window.innerHeight;
    }
    css(viewportElement, { height: "100vh", position: "fixed" });
    on(window, "resize", () => {
      viewportHeight = void 0;
    });
  }
  append(document.body, viewportElement);
  viewportHeight = viewportElement.clientHeight;
  remove$1(viewportElement);
  return viewportHeight;
}
function toHtmlElement(value) {
  const node = toNode(value);
  return node instanceof HTMLElement ? node : void 0;
}
function toElementInput(value) {
  return isElement(value) ? value : void 0;
}

const fastdom = { read, write, clear, flush };
const reads = [];
const writes = [];
function read(task) {
  reads.push(task);
  scheduleFlush();
  return task;
}
function write(task) {
  writes.push(task);
  scheduleFlush();
  return task;
}
function clear(task) {
  remove(reads, task);
  remove(writes, task);
}
let scheduled = false;
function flush() {
  runTasks(reads);
  runTasks(writes.splice(0));
  scheduled = false;
  if (reads.length || writes.length) {
    scheduleFlush();
  }
}
function scheduleFlush() {
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(flush);
  }
}
function runTasks(tasks) {
  let task;
  while (task = tasks.shift()) {
    try {
      task();
    } catch (error) {
      console.error(error);
    }
  }
}
function remove(array, item) {
  const index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class MouseTracker {
  constructor() {
    __publicField(this, "positions", []);
    __publicField(this, "unbind");
    __publicField(this, "interval");
  }
  init() {
    this.positions = [];
    let position;
    this.unbind = on(document, "mousemove", (event) => {
      position = getEventPos(event);
    });
    this.interval = setInterval(() => {
      if (!position) {
        return;
      }
      this.positions.push(position);
      if (this.positions.length > 5) {
        this.positions.shift();
      }
    }, 50);
  }
  cancel() {
    var _a;
    (_a = this.unbind) == null ? void 0 : _a.call(this);
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  movesTo(target) {
    if (this.positions.length < 2) {
      return false;
    }
    const rect = dimensions(target);
    const previous = this.positions[0];
    const position = last(this.positions);
    if (!previous || !position || pointInRect(position, rect)) {
      return false;
    }
    const { left, right, top, bottom } = rect;
    const path = [previous, position];
    const diagonals = [
      [
        { x: left, y: top },
        { x: right, y: bottom }
      ],
      [
        { x: left, y: bottom },
        { x: right, y: top }
      ]
    ];
    return diagonals.some((diagonal) => {
      const intersection = intersect(path, diagonal);
      return Boolean(intersection && pointInRect(intersection, rect));
    });
  }
}
function intersect([{ x: x1, y: y1 }, { x: x2, y: y2 }], [{ x: x3, y: y3 }, { x: x4, y: y4 }]) {
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denominator === 0) {
    return false;
  }
  const ratio = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  return ratio < 0 ? false : { x: x1 + ratio * (x2 - x1), y: y1 + ratio * (y2 - y1) };
}

function observeIntersection(targets, callback, options = {}, { intersecting = true } = {}) {
  const observer = new IntersectionObserver(
    intersecting ? (entries, currentObserver) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        callback(entries, currentObserver);
      }
    } : callback,
    options
  );
  for (const element of toNodes(targets)) {
    observer.observe(element);
  }
  return observer;
}
function observeResize(targets, callback, options = { box: "border-box" }) {
  if (inBrowser && window.ResizeObserver) {
    const observer = new ResizeObserver(callback);
    for (const element of toNodes(targets)) {
      observer.observe(element, options);
    }
    return observer;
  }
  const notify = () => callback([], emptyResizeObserver);
  const off = [
    on(window, "load resize", notify),
    on(document, "loadedmetadata load", notify, true)
  ];
  return { disconnect: () => off.forEach((teardown) => teardown()) };
}
function observeViewportResize(callback) {
  const targets = window.visualViewport ? [window, window.visualViewport] : [window];
  return { disconnect: on(targets, "resize", () => callback(new Event("resize"))) };
}
const emptyResizeObserver = {
  disconnect() {
  },
  observe() {
  },
  unobserve() {
  }
};
function observeMutation(targets, callback, options = {}) {
  const observer = new MutationObserver(callback);
  for (const node of toNodes(targets)) {
    observer.observe(node, options);
  }
  return observer;
}

function play(element) {
  const node = firstElement$1(element);
  if (isIFrame(node)) {
    void call(node, { func: "playVideo", method: "play" });
  }
  if (isHTML5(node)) {
    node.play().catch(noop);
  }
}
function pause(element) {
  const node = firstElement$1(element);
  if (isIFrame(node) && node._ukPlayer) {
    void call(node, { func: "pauseVideo", method: "pause" });
  }
  if (isHTML5(node)) {
    node.pause();
  }
}
function mute(element) {
  const node = firstElement$1(element);
  if (isIFrame(node)) {
    void call(node, { func: "mute", method: "setVolume", value: 0 });
  }
  if (isHTML5(node)) {
    node.muted = true;
  }
}
function firstElement$1(element) {
  if (element instanceof Element) {
    return element;
  }
  return Array.from(element != null ? element : []).find((item) => item instanceof Element);
}
function isHTML5(element) {
  return element instanceof HTMLVideoElement || isTag(element, "video");
}
function isIFrame(element) {
  return (element instanceof HTMLIFrameElement || isTag(element, "iframe")) && isFrameProvider(element);
}
function isFrameProvider(element) {
  return element instanceof HTMLIFrameElement && (isYoutube(element) || isVimeo(element));
}
function isYoutube(element) {
  return /\/\/.*?youtube(-nocookie)?\.[a-z]+\/(watch\?v=[^&\s]+|embed)|youtu\.be\/.*/.test(
    element.src
  );
}
function isVimeo(element) {
  return /vimeo\.com\/video\/.*/.test(element.src);
}
async function call(element, command) {
  await enableApi(element);
  post(element, command);
}
function post(element, command) {
  var _a;
  (_a = element.contentWindow) == null ? void 0 : _a.postMessage(JSON.stringify({ event: "command", ...command }), "*");
}
let counter = 0;
function enableApi(element) {
  if (element._ukPlayer) {
    return element._ukPlayer;
  }
  const youtube = isYoutube(element);
  const vimeo = isVimeo(element);
  const id = ++counter;
  let poller;
  element._ukPlayer = new Promise((resolve) => {
    if (youtube) {
      once(element, "load", () => {
        const listener = () => post(element, { event: "listening", id });
        poller = setInterval(listener, 100);
        listener();
      });
    }
    once(
      window,
      "message",
      () => resolve(),
      false,
      (event) => {
        if (!(event instanceof MessageEvent) || typeof event.data !== "string") {
          return false;
        }
        try {
          const data = JSON.parse(event.data);
          return isObject(data) && (youtube && data.id === id && data.event === "onReady" || vimeo && Number(data.player_id) === id);
        } catch {
          return false;
        }
      }
    );
    element.src = `${element.src}${includes(element.src, "?") ? "&" : "?"}${youtube ? "enablejsapi=1" : `api=1&player_id=${id}`}`;
  }).then(() => {
    if (poller) {
      clearInterval(poller);
    }
  });
  return element._ukPlayer;
}

function isInView(element, offsetTop = 0, offsetLeft = 0) {
  const node = firstElement(element);
  if (!node || !isVisible(node)) {
    return false;
  }
  const viewports = overflowParents(node).map((scrollParent2) => {
    const { top, left, bottom, right } = offsetViewport(scrollParent2);
    return {
      top: top - offsetTop,
      left: left - offsetLeft,
      bottom: bottom + offsetTop,
      right: right + offsetLeft,
      width: right - left + 2 * offsetLeft,
      height: bottom - top + 2 * offsetTop,
      x: left - offsetLeft,
      y: top - offsetTop
    };
  });
  return intersectRect(...viewports, offset(node));
}
function scrollIntoView(element, { offset: initialOffset = 0 } = {}) {
  const node = firstHtmlElement(element);
  if (!node) {
    return Promise.resolve();
  }
  const scrollableParents = isVisible(node) ? scrollParents(node, false, ["hidden"]) : [];
  let offsetBy = initialOffset;
  const operation = scrollableParents.reduce(
    (next, scrollElement, index) => {
      const { scrollTop, scrollHeight, offsetHeight } = scrollElement;
      const viewport = offsetViewport(scrollElement);
      const maxScroll = scrollHeight - viewport.height;
      const previous = scrollableParents[index - 1];
      const elementRect = previous ? offsetViewport(previous) : offset(node);
      let top = Math.ceil(elementRect.top - viewport.top - offsetBy + scrollTop);
      if (offsetBy > 0 && offsetHeight < elementRect.height + offsetBy) {
        top += offsetBy;
      } else {
        offsetBy = 0;
      }
      if (top > maxScroll) {
        offsetBy -= top - maxScroll;
        top = maxScroll;
      } else if (top < 0) {
        offsetBy -= top;
        top = 0;
      }
      return () => animateScroll(
        scrollElement,
        top - scrollTop,
        node,
        maxScroll,
        scrollableParents
      ).then(next);
    },
    () => Promise.resolve()
  );
  return operation();
}
function animateScroll(element, top, target, maxScroll, scrollableParents) {
  return new Promise((resolve) => {
    const scroll = element.scrollTop;
    const duration = 40 * Math.pow(Math.abs(top), 0.375);
    const start = Date.now();
    const isDocumentScroller = scrollingElement(element) === element;
    const targetTop = offset(target).top + (isDocumentScroller ? 0 : scroll);
    let previousDifference = 0;
    let frames = 15;
    const step = () => {
      const percent = 0.5 * (1 - Math.cos(Math.PI * clamp((Date.now() - start) / duration)));
      let difference = 0;
      if (scrollableParents[0] === element && scroll + top < maxScroll) {
        const covering = getCoveringElement(target);
        difference = offset(target).top + (isDocumentScroller ? 0 : element.scrollTop) - targetTop - (covering ? dimensions(covering).height : 0);
      }
      if (css(element, "scrollBehavior") !== "auto") {
        css(element, "scrollBehavior", "auto");
      }
      element.scrollTop = scroll + (top + difference) * percent;
      css(element, "scrollBehavior", "");
      if (percent === 1 && (previousDifference === difference || !frames--)) {
        resolve();
      } else {
        previousDifference = difference;
        requestAnimationFrame(step);
      }
    };
    step();
  });
}
function scrolledOver(element, startOffset = 0, endOffset = 0) {
  const node = firstHtmlElement(element);
  if (!node || !isVisible(node)) {
    return 0;
  }
  const scrollElement = scrollParent(node, true);
  const { scrollHeight, scrollTop } = scrollElement;
  const viewportHeight = offsetViewport(scrollElement).height;
  const maxScroll = scrollHeight - viewportHeight;
  const elementOffsetTop = offsetPosition(node)[0] - offsetPosition(scrollElement)[0];
  const start = Math.max(0, elementOffsetTop - viewportHeight + startOffset);
  const end = Math.min(maxScroll, elementOffsetTop + node.offsetHeight - endOffset);
  return start < end ? clamp((scrollTop - start) / (end - start)) : 1;
}
function scrollParents(element, scrollable = false, properties = []) {
  const node = firstElement(element);
  if (!node) {
    return [document.documentElement];
  }
  const scrollElement = scrollingElement(node);
  let ancestors = parents(node).reverse();
  ancestors = ancestors.slice(ancestors.indexOf(scrollElement) + 1);
  const fixedIndex = findIndex(ancestors, (ancestor) => hasPosition(ancestor, "fixed"));
  if (fixedIndex >= 0) {
    ancestors = ancestors.slice(fixedIndex);
  }
  return [scrollElement].concat(
    ancestors.filter(
      (ancestor) => css(ancestor, "overflow").split(" ").some(
        (property) => includes(["auto", "scroll", ...properties], property)
      ) && (!scrollable || ancestor.scrollHeight > offsetViewport(ancestor).height)
    )
  ).reverse();
}
function scrollParent(element, scrollable = false, properties = []) {
  var _a;
  return (_a = scrollParents(element, scrollable, properties)[0]) != null ? _a : document.documentElement;
}
function overflowParents(element) {
  return scrollParents(element, false, ["hidden", "clip"]);
}
function offsetViewport(scrollElement) {
  var _a;
  const win = toWindow(scrollElement);
  const documentScroller = scrollingElement(scrollElement);
  const useWindow = !isNode(scrollElement) || scrollElement.contains(documentScroller);
  if (useWindow && win.visualViewport) {
    const viewport = win.visualViewport;
    const height = Math.round(viewport.height * viewport.scale);
    const width = Math.round(viewport.width * viewport.scale);
    const top = viewport.pageTop;
    const left = viewport.pageLeft;
    return {
      height,
      width,
      top,
      left,
      x: left,
      y: top,
      bottom: top + height,
      right: left + width
    };
  }
  const rect = offset(useWindow ? win : scrollElement);
  const element = firstElement(scrollElement);
  if (element && css(element, "display") === "inline") {
    return rect;
  }
  const { body, documentElement } = win.document;
  const viewportElement = useWindow ? documentScroller === documentElement || documentScroller.clientHeight < body.clientHeight ? documentScroller : body : (_a = firstHtmlElement(scrollElement)) != null ? _a : documentScroller;
  adjustViewportDimension(rect, viewportElement, "width", "left", "right");
  adjustViewportDimension(rect, viewportElement, "height", "top", "bottom");
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
function adjustViewportDimension(rect, viewportElement, property, start, end) {
  const subpixel = rect[property] % 1;
  rect[start] += toFloat(css(viewportElement, `border-${start}-width`));
  const clientSize = property === "width" ? viewportElement.clientWidth : viewportElement.clientHeight;
  rect[property] = clientSize - (subpixel ? subpixel < 0.5 ? -subpixel : 1 - subpixel : 0);
  rect[end] = rect[property] + rect[start];
}
function getCoveringElement(target) {
  var _a;
  const suppliedTarget = firstElement(target);
  const document2 = toWindow(suppliedTarget).document;
  const node = suppliedTarget != null ? suppliedTarget : document2.body;
  const { left, width, top } = dimensions(node);
  for (const position of top ? [0, top] : [0]) {
    let covering;
    for (const element of document2.elementsFromPoint(left + width / 2, position)) {
      const relevant = !element.contains(node) && !hasClass(element, "drk-togglable-leave") && (hasPosition(element, "fixed") && zIndex(
        parents(node).reverse().find(
          (ancestor) => !ancestor.contains(element) && !hasPosition(ancestor, "static")
        )
      ) < zIndex(element) || hasPosition(element, "sticky") && (!suppliedTarget || Boolean((_a = parent(element)) == null ? void 0 : _a.contains(node))));
      if (relevant && (!covering || dimensions(covering).height < dimensions(element).height)) {
        covering = element;
      }
    }
    if (covering) {
      return covering;
    }
  }
}
function zIndex(element) {
  return toFloat(css(element, "zIndex"));
}
function hasPosition(element, position) {
  return css(element, "position") === position;
}
function scrollingElement(element) {
  const document2 = toWindow(element).document;
  return document2.scrollingElement instanceof HTMLElement ? document2.scrollingElement : document2.documentElement;
}
function firstElement(element) {
  if (element instanceof Element) {
    return element;
  }
  if (element && typeof element === "object" && (Symbol.iterator in element || "length" in element)) {
    return Array.from(element).find(
      (item) => item instanceof Element
    );
  }
}
function firstHtmlElement(element) {
  const node = firstElement(element);
  return node instanceof HTMLElement ? node : void 0;
}

const dirs = [
  ["width", "x", "left", "right"],
  ["height", "y", "top", "bottom"]
];
function positionAt(element, target, options = {}) {
  const resolved = resolveOptions(options);
  const targets = isArray(target) ? toPair(target) : [target, target];
  const coordinates = getPosition(element, targets, resolved);
  if (coordinates) {
    offset(element, coordinates);
  }
}
function resolveOptions(options) {
  var _a, _b, _c, _d, _e, _f;
  return {
    ...options,
    attach: {
      element: (_b = (_a = options.attach) == null ? void 0 : _a.element) != null ? _b : ["left", "top"],
      target: (_d = (_c = options.attach) == null ? void 0 : _c.target) != null ? _d : ["left", "top"]
    },
    offset: (_e = options.offset) != null ? _e : [0, 0],
    placement: (_f = options.placement) != null ? _f : [void 0, void 0]
  };
}
function getPosition(element, target, options) {
  const position = attachTo(element, target, options);
  const {
    boundary,
    viewportOffset = 0,
    placement
  } = options;
  let offsetPosition = position;
  for (const index of [0, 1]) {
    const [property, , start, end] = dirs[index];
    const viewport = getViewport(element, target[index], viewportOffset, boundary, index);
    if (isWithin(position, viewport, index)) {
      continue;
    }
    let offsetBy = 0;
    if (placement[index] === "flip") {
      const attach = options.attach.target[index];
      if (attach === end && position[end] <= viewport[end] || attach === start && position[start] >= viewport[start]) {
        continue;
      }
      offsetBy = flip(element, target, options, index)[start] - position[start];
      const scrollArea = getScrollArea(element, target[index], viewportOffset, index);
      if (!isWithin(applyOffset(position, offsetBy, index), scrollArea, index)) {
        if (isWithin(position, scrollArea, index)) {
          continue;
        }
        if (options.recursion) {
          return false;
        }
        const newPosition = flipAxis(element, target, options);
        if (newPosition && isWithin(newPosition, scrollArea, index === 0 ? 1 : 0)) {
          return newPosition;
        }
        continue;
      }
    } else if (placement[index] === "shift") {
      const targetDimensions = offset(target[index]);
      offsetBy = clamp(
        clamp(position[start], viewport[start], viewport[end] - position[property]),
        targetDimensions[start] - position[property] + options.offset[index],
        targetDimensions[end] - options.offset[index]
      ) - position[start];
    }
    offsetPosition = applyOffset(offsetPosition, offsetBy, index);
  }
  return offsetPosition;
}
function attachTo(element, target, options) {
  let elementOffset = offset(element);
  for (const index of [0, 1]) {
    const [property, , start, end] = dirs[index];
    const targetOffset = options.attach.target[index] === options.attach.element[index] ? offsetViewport(target[index]) : offset(target[index]);
    elementOffset = applyOffset(
      elementOffset,
      targetOffset[start] - elementOffset[start] + moveBy(options.attach.target[index], end, targetOffset[property]) - moveBy(options.attach.element[index], end, elementOffset[property]) + options.offset[index],
      index
    );
  }
  return elementOffset;
}
function applyOffset(position, value, index) {
  const [, axis, start, end] = dirs[index];
  const result = { ...position };
  result[start] = position[start] + value;
  result[end] = position[end] + value;
  result[axis] = result[start];
  return result;
}
function moveBy(attach, end, dimension) {
  return attach === "center" ? dimension / 2 : attach === end ? dimension : 0;
}
function getViewport(element, target, viewportOffset, boundary, index) {
  let viewport = getIntersectionArea(...commonScrollParents(element, target).map(offsetViewport));
  const [, , start, end] = dirs[index];
  if (viewportOffset) {
    viewport[start] += viewportOffset;
    viewport[end] -= viewportOffset;
  }
  if (boundary) {
    viewport = getIntersectionArea(
      viewport,
      offset(isArray(boundary) ? boundary[index] : boundary)
    );
  }
  return viewport;
}
function getScrollArea(element, target, viewportOffset, index) {
  var _a;
  const [property, axis, start, end] = dirs[index];
  const scrollElement = (_a = commonScrollParents(element, target)[0]) != null ? _a : document.documentElement;
  const viewport = offsetViewport(scrollElement);
  if (["auto", "scroll"].includes(css(scrollElement, `overflow-${axis}`))) {
    const scrollStart = start === "top" ? scrollElement.scrollTop : scrollElement.scrollLeft;
    const scrollSize = property === "height" ? scrollElement.scrollHeight : scrollElement.scrollWidth;
    viewport[start] -= scrollStart;
    viewport[end] = viewport[start] + scrollSize;
  }
  viewport[start] += viewportOffset;
  viewport[end] -= viewportOffset;
  return viewport;
}
function commonScrollParents(element, target) {
  return overflowParents(target).filter((parent) => parent.contains(element));
}
function getIntersectionArea(...rects) {
  const area = {
    top: 0,
    left: 0,
    bottom: Number.POSITIVE_INFINITY,
    right: Number.POSITIVE_INFINITY,
    width: 0,
    height: 0,
    x: 0,
    y: 0
  };
  for (const rect of rects) {
    area.top = Math.max(area.top, rect.top);
    area.left = Math.max(area.left, rect.left);
    area.bottom = Math.min(area.bottom, rect.bottom);
    area.right = Math.min(area.right, rect.right);
  }
  area.width = area.right - area.left;
  area.height = area.bottom - area.top;
  area.x = area.left;
  area.y = area.top;
  return area;
}
function isWithin(first, second, index) {
  const [, , start, end] = dirs[index];
  return first[start] >= second[start] && first[end] <= second[end];
}
function flip(element, target, options, index) {
  return attachTo(element, target, {
    attach: {
      element: flipAttach(options.attach.element, index),
      target: flipAttach(options.attach.target, index)
    },
    offset: flipOffset(options.offset, index)
  });
}
function flipAxis(element, target, options) {
  return getPosition(element, target, {
    ...options,
    attach: {
      element: toPair(options.attach.element.map(flipAttachAxis).reverse()),
      target: toPair(options.attach.target.map(flipAttachAxis).reverse())
    },
    offset: toPair([...options.offset].reverse()),
    placement: toPair([...options.placement].reverse()),
    recursion: true
  });
}
function flipAttach(attach, index) {
  const result = [...attach];
  const directionIndex = dirs[index].indexOf(attach[index]);
  if (directionIndex >= 0) {
    result[index] = dirs[index][1 - directionIndex % 2 + 2];
  }
  return result;
}
function flipAttachAxis(property) {
  for (const index of [0, 1]) {
    const directionIndex = dirs[index].indexOf(property);
    if (directionIndex >= 0) {
      return dirs[index === 0 ? 1 : 0][directionIndex % 2 + 2];
    }
  }
  return property;
}
function flipOffset(offset2, index) {
  const result = [...offset2];
  result[index] *= -1;
  return result;
}
function toPair(values) {
  if (values.length < 2 || values[0] === void 0 || values[1] === void 0) {
    throw new TypeError("Expected a pair of values.");
  }
  return [values[0], values[1]];
}

export { $, $$, Animation, Dimensions, MouseTracker, Transition, addClass, after, append, apply, assign, attr, before, boxModelAdjust, camelize, children, clamp, createEvent, css, data, dimensions, each, empty, endsWith, escape, fastdom, filter, find, findAll, findIndex, flipPosition, fragment, getCoveringElement, getEventPos, getIndex, getTargetedElement, hasAttr, hasClass, hasOwn, hasTouch, height, html, hyphenate, inBrowser, includes, index, intersectRect, isArray, isBoolean, isDocument, isElement, isEmpty, isEqual, isFocusable, isFunction, isInView, isInput, isNode, isNumber, isNumeric, isObject, isPlainObject, isRtl, isSameSiteAnchor, isString, isTag, isTouch, isUndefined, isVisible, isVoidElement, isWindow, last, matches, memoize, mute, noop, observeIntersection, observeMutation, observeResize, observeViewportResize, off, offset, offsetPosition, offsetViewport, on, once, overflowParents, parent, parents, pause, pick, play, pointInRect, pointerCancel, pointerDown, pointerEnter, pointerLeave, pointerMove, pointerUp, position, positionAt, prepend, propName, query, queryAll, ready, remove$1 as remove, removeAttr, removeClass, replaceClass, resetProps, scrollIntoView, scrollParent, scrollParents, scrolledOver, selFocusable, selInput, sortBy, startsWith, sumBy, swap, toArray, toBoolean, toEventTargets, toFloat, toNode, toNodes, toNumber, toPx, toWindow, toggleClass, trigger, ucfirst, uniqueBy, unwrap, width, wrapAll, wrapInner };
