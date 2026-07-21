/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define('drake', factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Drake = factory());
})(this, (function () { 'use strict';

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
    function toArray$1(value) {
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
    function cover$1(dimensions, maximum) {
      let result = contain(dimensions, maximum);
      for (const property of ["width", "height"]) {
        if (result[property] < maximum[property]) {
          result = ratio(result, property, maximum[property]);
        }
      }
      return result;
    }
    const Dimensions = { ratio, contain, cover: cover$1 };
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
      const result = node ? toArray$1(node.children) : [];
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
    function transition$1(input, properties, duration = 400, timing = "linear", skipReflow = false) {
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
      start: transition$1,
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
    function animate$2(input, animation, duration = 200, origin, out = false) {
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
      in: animate$2,
      out(element, animation, duration, origin) {
        return animate$2(element, animation, duration, origin, true);
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
          (node) => node.hasChildNodes() ? wrapAll(toArray$1(node.childNodes), structure) : append(node, structure)
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
      return unwrapSingle(toArray$1(container.content.childNodes));
    }
    function unwrapSingle(nodes) {
      return nodes.length > 1 ? [...nodes] : nodes[0];
    }
    function apply(node, callback) {
      if (!isElement(node)) {
        return;
      }
      callback(node);
      for (const child of toArray$1(node.children)) {
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
        css(toElementInput$1(element), { left: 0, top: 0 });
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
      css(toElementInput$1(element), "left", coordinates.left - currentOffset.left);
      css(toElementInput$1(element), "top", coordinates.top - currentOffset.top);
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
        const nodeInput = toElementInput$1(element);
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
    function toElementInput$1(value) {
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
        const viewport = getViewport$2(element, target[index], viewportOffset, boundary, index);
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
    function getViewport$2(element, target, viewportOffset, boundary, index) {
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

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        $: $,
        $$: $$,
        Animation: Animation,
        Dimensions: Dimensions,
        MouseTracker: MouseTracker,
        Transition: Transition,
        addClass: addClass,
        after: after,
        append: append,
        apply: apply,
        assign: assign,
        attr: attr,
        before: before,
        boxModelAdjust: boxModelAdjust,
        camelize: camelize,
        children: children,
        clamp: clamp,
        createEvent: createEvent,
        css: css,
        data: data,
        dimensions: dimensions,
        each: each,
        empty: empty,
        endsWith: endsWith,
        escape: escape,
        fastdom: fastdom,
        filter: filter,
        find: find,
        findAll: findAll,
        findIndex: findIndex,
        flipPosition: flipPosition,
        fragment: fragment,
        getCoveringElement: getCoveringElement,
        getEventPos: getEventPos,
        getIndex: getIndex,
        getTargetedElement: getTargetedElement,
        hasAttr: hasAttr,
        hasClass: hasClass,
        hasOwn: hasOwn,
        hasTouch: hasTouch,
        height: height,
        html: html,
        hyphenate: hyphenate,
        inBrowser: inBrowser,
        includes: includes,
        index: index,
        intersectRect: intersectRect,
        isArray: isArray,
        isBoolean: isBoolean,
        isDocument: isDocument,
        isElement: isElement,
        isEmpty: isEmpty,
        isEqual: isEqual,
        isFocusable: isFocusable,
        isFunction: isFunction,
        isInView: isInView,
        isInput: isInput,
        isNode: isNode,
        isNumber: isNumber,
        isNumeric: isNumeric,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isRtl: isRtl,
        isSameSiteAnchor: isSameSiteAnchor,
        isString: isString,
        isTag: isTag,
        isTouch: isTouch,
        isUndefined: isUndefined,
        isVisible: isVisible,
        isVoidElement: isVoidElement,
        isWindow: isWindow,
        last: last,
        matches: matches,
        memoize: memoize,
        mute: mute,
        noop: noop,
        observeIntersection: observeIntersection,
        observeMutation: observeMutation,
        observeResize: observeResize,
        observeViewportResize: observeViewportResize,
        off: off,
        offset: offset,
        offsetPosition: offsetPosition,
        offsetViewport: offsetViewport,
        on: on,
        once: once,
        overflowParents: overflowParents,
        parent: parent,
        parents: parents,
        pause: pause,
        pick: pick,
        play: play,
        pointInRect: pointInRect,
        pointerCancel: pointerCancel,
        pointerDown: pointerDown,
        pointerEnter: pointerEnter,
        pointerLeave: pointerLeave,
        pointerMove: pointerMove,
        pointerUp: pointerUp,
        position: position,
        positionAt: positionAt,
        prepend: prepend,
        propName: propName,
        query: query,
        queryAll: queryAll,
        ready: ready,
        remove: remove$1,
        removeAttr: removeAttr,
        removeClass: removeClass,
        replaceClass: replaceClass,
        resetProps: resetProps,
        scrollIntoView: scrollIntoView,
        scrollParent: scrollParent,
        scrollParents: scrollParents,
        scrolledOver: scrolledOver,
        selFocusable: selFocusable,
        selInput: selInput,
        sortBy: sortBy,
        startsWith: startsWith,
        sumBy: sumBy,
        swap: swap,
        toArray: toArray$1,
        toBoolean: toBoolean,
        toEventTargets: toEventTargets,
        toFloat: toFloat,
        toNode: toNode,
        toNodes: toNodes,
        toNumber: toNumber,
        toPx: toPx,
        toWindow: toWindow,
        toggleClass: toggleClass,
        trigger: trigger,
        ucfirst: ucfirst,
        uniqueBy: uniqueBy,
        unwrap: unwrap,
        width: width,
        wrapAll: wrapAll,
        wrapInner: wrapInner
    });

    var VERSION = '0.1.1';

    function initUpdates(instance) {
      var _a;
      instance._data = {};
      instance._updates = normalizeUpdates(instance.$options.update);
      (_a = instance._disconnect) == null ? void 0 : _a.push(() => {
        instance._updates = null;
        instance._data = null;
      });
    }
    function prependUpdate(instance, update) {
      var _a;
      (_a = instance._updates) == null ? void 0 : _a.unshift(update);
    }
    function callUpdate(instance, event = "update") {
      const updates = instance._updates;
      if (!instance._connected || !(updates == null ? void 0 : updates.length)) {
        return;
      }
      if (!instance._updateCount) {
        instance._updateCount = 0;
        requestAnimationFrame(() => {
          instance._updateCount = 0;
        });
      }
      if (!instance._queued) {
        instance._queued = /* @__PURE__ */ new Set();
        fastdom.read(() => {
          const queued = instance._queued;
          const data = instance._data;
          if (instance._connected && queued && data) {
            runUpdates(instance, queued, updates, data);
          }
          instance._queued = null;
        });
      }
      if (instance._updateCount++ < 20) {
        instance._queued.add(typeof event === "string" ? event : event.type);
      }
    }
    function runUpdates(instance, types, updates, data) {
      for (const { read, write, events = [] } of updates) {
        if (!types.has("update") && !events.some((type) => types.has(type))) {
          continue;
        }
        const runtimeRead = read;
        const result = runtimeRead == null ? void 0 : runtimeRead.call(instance, data, types);
        if (result && isPlainObject(result)) {
          assign(data, result);
        }
        if (write && result !== false) {
          fastdom.write(() => {
            if (instance._connected) {
              write.call(instance, data, types);
            }
          });
        }
      }
    }
    function normalizeUpdates(update) {
      if (!update) {
        return [];
      }
      if (isFunction(update)) {
        return [{ read: update }];
      }
      return Array.isArray(update) ? [...update] : [update];
    }

    function initWatches(instance) {
      instance._watches = [];
      for (const watches of normalizeWatchMaps(instance.$options.watch)) {
        for (const [name, watch] of Object.entries(watches)) {
          registerWatch(instance, watch, name);
        }
      }
      instance._initial = true;
    }
    function registerWatch(instance, watch, name) {
      const definition = typeof watch === "function" ? { handler: watch } : watch;
      instance._watches.push({ name, ...definition });
    }
    function runWatches(instance, values) {
      for (const { name, handler, immediate = true } of instance._watches) {
        if (instance._initial && immediate || hasOwn(values, name) && !isEqual(values[name], instance[name])) {
          handler.call(instance, instance[name], values[name]);
        }
      }
      instance._initial = false;
    }
    function normalizeWatchMaps(value) {
      return value ? Array.isArray(value) ? [...value] : [value] : [];
    }

    function initComputed(instance) {
      var _a;
      instance._computed = {};
      for (const [key, definition] of Object.entries((_a = instance.$options.computed) != null ? _a : {})) {
        registerComputed(instance, key, definition);
      }
    }
    const mutationOptions = { subtree: true, childList: true };
    function registerComputed(instance, key, definition) {
      instance._hasComputed = true;
      Object.defineProperty(instance, key, {
        enumerable: true,
        get() {
          var _a;
          const { _computed, $props, $el } = instance;
          if (!hasOwn(_computed, key)) {
            _computed[key] = getComputedValue(definition, instance, $props, $el);
            const observerDefinition = typeof definition === "function" ? void 0 : definition.observe;
            if (observerDefinition && instance._computedObserver) {
              const runtimeObserve = observerDefinition;
              const selector = runtimeObserve.call(instance, $props);
              if (isString(selector) && selector) {
                const root = ["~", "+", "-"].includes((_a = selector[0]) != null ? _a : "") ? $el.parentElement : $el.getRootNode();
                if (root) {
                  instance._computedObserver.observe(root, mutationOptions);
                }
              }
            }
          }
          return _computed[key];
        },
        set(value) {
          const objectDefinition = typeof definition === "function" ? void 0 : definition;
          instance._computed[key] = (objectDefinition == null ? void 0 : objectDefinition.set) ? objectDefinition.set.call(instance, value) : value;
          if (instance._computed[key] === void 0) {
            delete instance._computed[key];
          }
        }
      });
    }
    function getComputedValue(definition, instance, props, element) {
      if (typeof definition === "function") {
        const runtimeDefinition = definition;
        return runtimeDefinition.call(instance, props, element);
      }
      const getter = definition.get;
      return getter == null ? void 0 : getter.call(instance, props, element);
    }
    function initComputedUpdates(instance) {
      var _a;
      if (!instance._hasComputed) {
        return;
      }
      prependUpdate(instance, {
        read: () => runWatches(instance, resetComputed(instance)),
        events: ["resize", "computed"]
      });
      instance._computedObserver = observeMutation(
        instance.$el,
        () => callUpdate(instance, "computed"),
        mutationOptions
      );
      (_a = instance._disconnect) == null ? void 0 : _a.push(() => {
        var _a2;
        (_a2 = instance._computedObserver) == null ? void 0 : _a2.disconnect();
        instance._computedObserver = null;
        resetComputed(instance);
      });
    }
    function resetComputed(instance) {
      const values = { ...instance._computed };
      instance._computed = {};
      return values;
    }

    function initEvents(instance) {
      for (const event of normalizeEvents(instance.$options.events)) {
        if (hasOwn(event, "handler")) {
          registerEvent(instance, event);
        } else {
          for (const [name, handler] of Object.entries(event)) {
            registerEvent(instance, { name, handler });
          }
        }
      }
    }
    function registerEvent(instance, definition) {
      var _a;
      const { name, el, handler, capture, passive, delegate, filter, self } = definition;
      const runtimeFilter = filter;
      if (runtimeFilter && !runtimeFilter.call(instance, instance)) {
        return;
      }
      const runtimeElement = el;
      const runtimeDelegate = delegate;
      const target = runtimeElement ? runtimeElement.call(instance, instance) : instance.$el;
      const delegateValue = runtimeDelegate == null ? void 0 : runtimeDelegate.call(instance, instance);
      const selector = typeof delegateValue === "string" ? delegateValue : false;
      const runtimeHandler = handler;
      const listener = (event, ...detail) => runtimeHandler.call(instance, event, ...detail);
      (_a = instance._disconnect) == null ? void 0 : _a.push(on(target, name, selector, listener, { passive, capture, self }));
    }
    function normalizeEvents(value) {
      return value ? Array.isArray(value) ? [...value] : [value] : [];
    }

    function initObservers(instance) {
      for (const observable of normalizeObservables(instance.$options.observe)) {
        registerObservable(instance, observable);
      }
    }
    function registerObservable(instance, observable) {
      const { observe, target = instance.$el, filter, args } = observable;
      const runtimeFilter = filter;
      if (runtimeFilter && !runtimeFilter.call(instance, instance)) {
        return;
      }
      const disconnect = instance._disconnect;
      if (!disconnect) {
        return;
      }
      const key = `_observe${disconnect.length}`;
      if (isFunction(target) && !hasOwn(instance, key)) {
        registerComputed(instance, key, () => {
          const targets2 = target.call(instance, instance);
          return toNodeInput(targets2);
        });
      }
      const handlerValue = isString(observable.handler) ? instance[observable.handler] : observable.handler;
      if (!isFunction(handlerValue)) {
        return;
      }
      const handler = handlerValue.bind(instance);
      const options = isFunction(observable.options) ? observable.options.call(instance, instance) : observable.options;
      const targets = hasOwn(instance, key) ? toNodeInput(instance[key]) : toNodeInput(target);
      const observer = observe(targets, handler, options, args);
      if (isFunction(target) && Array.isArray(instance[key])) {
        registerWatch(
          instance,
          { handler: updateTargets(observer, options), immediate: false },
          key
        );
      }
      disconnect.push(() => observer.disconnect());
    }
    function updateTargets(observer, options) {
      return (targets, previous) => {
        var _a;
        const currentNodes = toNodes(toNodeInput(targets));
        const previousNodes = toNodes(toNodeInput(previous));
        for (const target of previousNodes) {
          if (!includes(currentNodes, target)) {
            if (observer.unobserve) {
              observer.unobserve(target);
            } else if (observer.observe) {
              observer.disconnect();
            }
          }
        }
        for (const target of currentNodes) {
          if (!includes(previousNodes, target) || !observer.unobserve) {
            (_a = observer.observe) == null ? void 0 : _a.call(observer, target, options);
          }
        }
      };
    }
    function normalizeObservables(value) {
      return value ? Array.isArray(value) ? [...value] : [value] : [];
    }
    function toNodeInput(value) {
      if (value instanceof Node) {
        return value;
      }
      if (value && typeof value === "object" && (Symbol.iterator in value || "length" in value)) {
        return toNodes(value);
      }
      return void 0;
    }

    const strategies = {};
    for (const key of [
      "events",
      "watch",
      "observe",
      "created",
      "beforeConnect",
      "connected",
      "beforeDisconnect",
      "disconnected",
      "destroy"
    ]) {
      strategies[key] = concatStrategy;
    }
    strategies.args = (parent, child) => child !== false && concatStrategy(child || parent, void 0);
    strategies.update = (parent, child) => concatStrategy(parent, isFunction(child) ? { read: child } : child);
    strategies.props = (parent, child) => {
      const normalized = isArray(child) ? Object.fromEntries(child.filter(isString).map((key) => [key, String])) : child;
      return mergeRecordStrategy(parent, normalized);
    };
    strategies.computed = mergeRecordStrategy;
    strategies.methods = mergeRecordStrategy;
    strategies.i18n = dataStrategy;
    strategies.data = dataStrategy;
    function dataStrategy(parent, child, instance) {
      if (!instance) {
        if (!child) {
          return parent;
        }
        if (!parent) {
          return child;
        }
        return function(current) {
          return mergeFunctionData(parent, child, current);
        };
      }
      return mergeFunctionData(parent, child, instance);
    }
    function mergeFunctionData(parent, child, instance) {
      return mergeRecords(
        isFunction(parent) ? parent.call(instance, instance) : parent,
        isFunction(child) ? child.call(instance, instance) : child
      );
    }
    function concatStrategy(parent, child) {
      const parentValues = parent === void 0 ? void 0 : isArray(parent) ? parent : [parent];
      if (child === void 0) {
        return parentValues;
      }
      const childValues = isArray(child) ? child : [child];
      return parentValues ? [...parentValues, ...childValues] : childValues;
    }
    function mergeRecordStrategy(parent, child) {
      return mergeRecords(parent, child);
    }
    function mergeRecords(parent, child) {
      if (!isObject(child)) {
        return isObject(parent) ? { ...parent } : void 0;
      }
      return isObject(parent) ? { ...parent, ...child } : { ...child };
    }
    function defaultStrategy(parent, child) {
      return child === void 0 ? parent : child;
    }
    function mergeOptions(parent = {}, child = {}, instance) {
      var _a;
      const source = isComponentConstructor$2(child) ? child.options : child;
      let base = parent;
      if (source.extends && isObject(source.extends)) {
        base = mergeOptions(base, source.extends, instance);
      }
      const mixins = toArray(source.mixins);
      for (const mixin of mixins) {
        if (isObject(mixin)) {
          base = mergeOptions(base, mixin, instance);
        }
      }
      const options = {};
      for (const key of /* @__PURE__ */ new Set([...Object.keys(base), ...Object.keys(source)])) {
        options[key] = ((_a = strategies[key]) != null ? _a : defaultStrategy)(base[key], source[key], instance);
      }
      return options;
    }
    function isComponentConstructor$2(value) {
      return typeof value === "function" && "options" in value;
    }
    function toArray(value) {
      if (value === void 0) {
        return [];
      }
      return isArray(value) ? value : [value];
    }
    function parseOptions(value, args = []) {
      if (!isString(value) || !value) {
        return {};
      }
      try {
        if (startsWith(value, "{")) {
          const parsed = JSON.parse(value);
          return isObject(parsed) ? { ...parsed } : {};
        }
        if (args.length && !value.includes(":")) {
          const first = args[0];
          return first ? { [first]: value } : {};
        }
        return value.split(";").reduce((options, option) => {
          const [rawKey, rawValue] = option.split(/:(.*)/);
          const key = rawKey == null ? void 0 : rawKey.trim();
          if (key && rawValue !== void 0) {
            options[key] = rawValue.trim();
          }
          return options;
        }, {});
      } catch {
        return {};
      }
    }
    function coerce$1(type, value) {
      if (type === Boolean) {
        return toBoolean(value);
      }
      if (type === Number) {
        return toNumber(value);
      }
      if (type === "list") {
        return toList(value);
      }
      if (type === Object && isString(value)) {
        return parseOptions(value);
      }
      return typeof type === "function" ? type(value) : value;
    }
    const listRe = /,(?![^(]*\))/;
    function toList(value) {
      if (isArray(value)) {
        return value;
      }
      return isString(value) ? value.split(listRe).map((item) => isNumeric(item) ? toNumber(item) : toBoolean(item.trim())) : [value];
    }
    function defineComponent(options) {
      return ((component) => component);
    }
    function defineMixin(options) {
      return ((mixin) => mixin);
    }

    function initProps(instance) {
      const props = getProps(instance.$options);
      assign(instance.$props, props);
      const { computed, methods } = instance.$options;
      for (const key of Object.keys(instance.$props)) {
        if (key in props && (!computed || !hasOwn(computed, key)) && (!methods || !hasOwn(methods, key))) {
          instance[key] = instance.$props[key];
        }
      }
    }
    function getProps(options) {
      var _a;
      const data$1 = {};
      const props = normalizeProps$1(options.props);
      const element = options.el;
      if (!element) {
        return data$1;
      }
      for (const key of Object.keys(props)) {
        const property = hyphenate(key);
        const rawValue = data(element, property);
        if (rawValue === void 0) {
          continue;
        }
        const value = props[key] === Boolean && rawValue === "" ? true : coerce$1(props[key], rawValue);
        if (property === "target" && startsWith(value, "_")) {
          continue;
        }
        data$1[key] = value;
      }
      const parsed = parseOptions(data(element, (_a = options.id) != null ? _a : ""), normalizeArgs$1(options.args));
      for (const [key, value] of Object.entries(parsed)) {
        const property = camelize(key);
        if (props[property] !== void 0) {
          data$1[property] = coerce$1(props[property], value);
        }
      }
      return data$1;
    }
    const getAttributes = memoize((id, props) => {
      const attributes = Object.keys(props);
      const filter = attributes.concat(id).filter(Boolean).flatMap((key) => [hyphenate(key), `data-${hyphenate(key)}`]);
      return { attributes, filter };
    });
    function initPropsObserver(instance) {
      var _a, _b;
      const { $options, $props } = instance;
      const props = normalizeProps$1($options.props);
      const element = $options.el;
      if (!element || !Object.keys(props).length) {
        return;
      }
      const id = (_a = $options.id) != null ? _a : "";
      const { attributes, filter } = getAttributes(id, props);
      const observer = new MutationObserver((records) => {
        const data = getProps($options);
        const changed = records.some(({ attributeName }) => {
          if (!attributeName) {
            return false;
          }
          const property = attributeName.replace("data-", "");
          const keys = property === id ? attributes : [camelize(property), camelize(attributeName)];
          return keys.some((key) => data[key] !== void 0 && data[key] !== $props[key]);
        });
        if (changed) {
          instance.$reset();
        }
      });
      observer.observe(element, { attributes: true, attributeFilter: filter });
      (_b = instance._disconnect) == null ? void 0 : _b.push(() => observer.disconnect());
    }
    function normalizeProps$1(props) {
      if (!props) {
        return {};
      }
      return Array.isArray(props) ? Object.fromEntries(props.filter(isString).map((key) => [key, String])) : { ...props };
    }
    function normalizeArgs$1(args) {
      return typeof args === "boolean" || !args ? [] : isString(args) ? [args] : [...args];
    }

    function callHook(instance, hook) {
      for (const handler of normalizeHooks(instance.$options[hook])) {
        handler.call(instance);
      }
    }
    function callConnected(instance) {
      if (instance._connected) {
        return;
      }
      initProps(instance);
      callHook(instance, "beforeConnect");
      instance._connected = true;
      instance._disconnect = [];
      initEvents(instance);
      initUpdates(instance);
      initWatches(instance);
      initObservers(instance);
      initPropsObserver(instance);
      initComputedUpdates(instance);
      callHook(instance, "connected");
      callUpdate(instance);
    }
    function callDisconnected(instance) {
      var _a;
      if (!instance._connected) {
        return;
      }
      callHook(instance, "beforeDisconnect");
      (_a = instance._disconnect) == null ? void 0 : _a.forEach((off) => off());
      instance._disconnect = null;
      callHook(instance, "disconnected");
      instance._connected = false;
    }
    function normalizeHooks(value) {
      return value ? Array.isArray(value) ? value : [value] : [];
    }

    let uid = 0;
    function init(instance, options = {}) {
      options.data = normalizeData(options, instance.constructor.options);
      instance.$options = mergeOptions(instance.constructor.options, options, instance);
      instance.$props = {};
      instance._uid = uid++;
      instance._connected = false;
      instance._disconnect = null;
      instance._updates = null;
      instance._data = null;
      instance._updateCount = 0;
      instance._queued = null;
      instance._watches = [];
      instance._initial = false;
      initData(instance);
      initMethods(instance);
      initComputed(instance);
      callHook(instance, "created");
      if (options.el) {
        instance.$mount(options.el);
      }
    }
    function initData(instance) {
      const option = instance.$options.data;
      const data = isFunction(option) ? option.call(instance, instance) : option;
      if (!isPlainObject(data)) {
        return;
      }
      for (const key in data) {
        instance.$props[key] = data[key];
        instance[key] = data[key];
      }
    }
    function initMethods(instance) {
      var _a;
      for (const [key, method] of Object.entries((_a = instance.$options.methods) != null ? _a : {})) {
        instance[key] = method.bind(instance);
      }
    }
    function normalizeData({ data: source = {} }, componentOptions) {
      const args = normalizeArgs(componentOptions.args);
      const props = normalizeProps(componentOptions.props);
      let data;
      if (isArray(source)) {
        data = source.slice(0, args.length).reduce((result, value, index) => {
          if (isPlainObject(value)) {
            assign(result, value);
          } else {
            const key = args[index];
            if (key) {
              result[key] = value;
            }
          }
          return result;
        }, {});
      } else {
        data = isPlainObject(source) ? { ...source } : {};
      }
      for (const key of Object.keys(data)) {
        if (data[key] === void 0) {
          delete data[key];
        } else if (props[key]) {
          data[key] = coerce$1(props[key], data[key]);
        }
      }
      return data;
    }
    function normalizeArgs(args) {
      return typeof args === "boolean" || !args ? [] : isString(args) ? [args] : [...args];
    }
    function normalizeProps(props) {
      if (!props) {
        return {};
      }
      return Array.isArray(props) ? Object.fromEntries(props.filter(isString).map((key) => [key, String])) : { ...props };
    }

    const App = function(options = {}) {
      init(this, options);
    };
    App.util = util;
    App.options = {};
    App.version = VERSION;

    const PREFIX = "drk-";
    const components$1 = {};
    function component(name, options) {
      const id = PREFIX + hyphenate(name);
      if (!options) {
        const current = components$1[id];
        if (!current) {
          throw new Error(`Component not registered: ${name}`);
        }
        if (!isComponentConstructor$1(current)) {
          components$1[id] = App.extend(current);
        }
        return components$1[id];
      }
      const normalizedName = camelize(name);
      App[normalizedName] = (element, data) => createComponent(normalizedName, element, data);
      const option = isComponentConstructor$1(options) ? options.options : { ...options };
      option.id = id;
      option.name = normalizedName;
      const install = option.install;
      install == null ? void 0 : install(App, option, normalizedName);
      if (App._initialized && !option.functional) {
        requestAnimationFrame(() => {
          createComponent(normalizedName, `[${id}],[data-${id}]`);
        });
      }
      components$1[id] = option;
      return option;
    }
    function createComponent(name, element, data, ...args) {
      const Component = component(name);
      if (Component.options.functional) {
        const componentData = isPlainObject(element) ? element : [element, data, ...args];
        return new Component({ data: componentData });
      }
      if (!element) {
        return new Component();
      }
      const elements = selectElements(element);
      return elements.map((item) => initialize$1(Component, name, item, data))[0];
    }
    function initialize$1(Component, name, element, data) {
      const instance = getComponent(element, name);
      if (instance) {
        if (data) {
          instance.$destroy();
        } else {
          return instance;
        }
      }
      const componentData = isPlainObject(data) ? data : {};
      return new Component({ el: element, data: componentData });
    }
    function selectElements(value) {
      if (typeof value === "string") {
        return $$(value);
      }
      if (value instanceof Element) {
        return [value];
      }
      if (value && typeof value === "object" && (Symbol.iterator in value || "length" in value)) {
        return Array.from(value).filter(
          (item) => item instanceof Element
        );
      }
      return [];
    }
    function getComponents(element) {
      var _a;
      return element ? (_a = element.__drake__) != null ? _a : {} : {};
    }
    function getComponent(element, name) {
      return getComponents(element)[name];
    }
    function attachToElement(element, instance) {
      var _a;
      const mounted = element;
      (_a = mounted.__drake__) != null ? _a : mounted.__drake__ = {};
      const name = instance.$options.name;
      if (name) {
        mounted.__drake__[name] = instance;
      }
    }
    function detachFromElement(element, instance) {
      var _a;
      const mounted = element;
      const name = instance.$options.name;
      if (name) {
        (_a = mounted.__drake__) == null ? true : delete _a[name];
      }
      if (isEmpty(mounted.__drake__)) {
        delete mounted.__drake__;
      }
    }
    function isComponentConstructor$1(value) {
      return typeof value === "function" && "options" in value;
    }

    function boot(App) {
      if (!inBrowser || !window.MutationObserver) {
        return;
      }
      if (document.body) {
        requestAnimationFrame(() => initialize(App));
      } else {
        new MutationObserver((_records, observer) => {
          if (document.body) {
            initialize(App);
            observer.disconnect();
          }
        }).observe(document.documentElement, { childList: true });
      }
    }
    function initialize(App) {
      trigger(document, "drake:init", App);
      if (document.body) {
        apply(document.body, connect);
      }
      new MutationObserver(handleMutation).observe(document, {
        subtree: true,
        childList: true,
        attributes: true
      });
      App._initialized = true;
    }
    function handleMutation(records) {
      var _a;
      for (const { addedNodes, removedNodes, target, attributeName } of records) {
        for (const node of addedNodes) {
          apply(node, connect);
        }
        for (const node of removedNodes) {
          apply(node, disconnect);
        }
        if (!(target instanceof Element) || !attributeName) {
          continue;
        }
        const name = getComponentName(attributeName);
        if (name) {
          if (hasAttr(target, attributeName)) {
            createComponent(name, target);
          } else {
            (_a = getComponent(target, name)) == null ? void 0 : _a.$destroy();
          }
        }
      }
    }
    function connect(node) {
      for (const instance of Object.values(getComponents(node))) {
        callConnected(instance);
      }
      for (const attributeName of node.getAttributeNames()) {
        const name = getComponentName(attributeName);
        if (name) {
          createComponent(name, node);
        }
      }
    }
    function disconnect(node) {
      for (const instance of Object.values(getComponents(node))) {
        callDisconnected(instance);
      }
    }
    function getComponentName(attribute) {
      const normalized = startsWith(attribute, "data-") ? attribute.slice(5) : attribute;
      const component = components$1[normalized];
      return typeof component === "function" ? component.options.name : component == null ? void 0 : component.name;
    }

    function globalApi(App) {
      App.component = component;
      App.getComponents = getComponents;
      App.getComponent = getComponent;
      App.update = update;
      App.use = function(plugin) {
        if (!plugin.installed) {
          plugin.call(null, this);
          plugin.installed = true;
        }
        return this;
      };
      App.mixin = function(mixin, target) {
        var _a;
        const Component = (_a = isString(target) ? this.component(target) : target) != null ? _a : this;
        if (isComponentConstructor(Component)) {
          Component.options = mergeOptions(Component.options, mixin);
        }
      };
      App.extend = function(options = {}) {
        return extendComponent(this, options);
      };
      let container;
      Object.defineProperty(App, "container", {
        get: () => container != null ? container : document.body,
        set: (element) => {
          container = $(
            element instanceof Element || typeof element === "string" ? element : document.body
          );
        }
      });
    }
    function extendComponent(Super, options) {
      const Sub = function(componentOptions = {}) {
        init(this, componentOptions);
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.options = mergeOptions(Super.options, options);
      Sub.super = Super;
      Sub.extend = Super.extend;
      return Sub;
    }
    function update(element, event) {
      var _a;
      const node = (_a = toNode(element)) != null ? _a : document.body;
      if (!(node instanceof Element)) {
        return;
      }
      for (const parentElement of parents(node).reverse()) {
        updateElement(parentElement, event);
      }
      apply(node, (current) => updateElement(current, event));
    }
    function updateElement(element, event) {
      for (const instance of Object.values(getComponents(element))) {
        callUpdate(instance, event);
      }
    }
    function isComponentConstructor(value) {
      return typeof value === "function" && "options" in value;
    }

    function instanceApi(App) {
      App.prototype.$mount = function(element) {
        attachToElement(element, this);
        this.$options.el = element;
        if (element.isConnected) {
          callConnected(this);
        }
      };
      App.prototype.$destroy = function(removeElement = false) {
        const element = this.$options.el;
        if (element) {
          callDisconnected(this);
        }
        callHook(this, "destroy");
        if (element) {
          detachFromElement(element, this);
          if (removeElement) {
            remove$1(element);
          }
        }
      };
      App.prototype.$create = createComponent;
      App.prototype.$emit = function(event) {
        callUpdate(this, event);
      };
      App.prototype.$update = function(element = this.$el, event) {
        update(element, event);
      };
      App.prototype.$reset = function() {
        callDisconnected(this);
        callConnected(this);
      };
      App.prototype.$getComponent = getComponent;
      Object.defineProperties(App.prototype, {
        $el: {
          get() {
            return this.$options.el;
          }
        },
        $container: {
          get() {
            return App.container;
          }
        }
      });
    }
    let id = 1;
    function generateId(instance, element) {
      var _a;
      return (element == null ? void 0 : element.id) || `${(_a = instance.$options.id) != null ? _a : "drk"}-${id++}`;
    }

    globalApi(App);
    instanceApi(App);

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
    function scroll$1(options = {}) {
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

    var Class = defineMixin()({
      connected() {
        this._cmpCls = hasClass(this.$el, this.$options.id);
        addClass(this.$el, this.$options.id);
      },
      disconnected() {
        if (!this._cmpCls) {
          removeClass(this.$el, this.$options.id);
        }
      }
    });

    function maybeDefaultPreventClick(e) {
      var _a;
      if ((_a = e.target) == null ? void 0 : _a.closest('a[href="#"],a[href=""]')) {
        e.preventDefault();
      }
    }

    var Togglable = defineMixin()({
      props: {
        cls: Boolean,
        animation: "list",
        duration: Number,
        velocity: Number,
        origin: String,
        transition: String
      },
      data: {
        cls: false,
        animation: [false],
        duration: 200,
        velocity: 0.2,
        origin: false,
        transition: "ease",
        clsEnter: "drk-togglable-enter",
        clsLeave: "drk-togglable-leave"
      },
      computed: {
        hasAnimation: ({ animation }) => !!animation[0],
        hasTransition: ({ animation }) => ["slide", "reveal"].some((transition) => startsWith(animation[0], transition))
      },
      methods: {
        async toggleElement(targets, toggle, animate) {
          const CANCELLED = {};
          return (await Promise.all(
            toNodes(targets).map((el) => {
              if (!(el instanceof HTMLElement)) {
                return CANCELLED;
              }
              const show = isBoolean(toggle) ? toggle : !this.isToggled(el);
              if (!trigger(el, `before${show ? "show" : "hide"}`, [this])) {
                return CANCELLED;
              }
              const handler = typeof animate === "function" ? animate : animate === false || !this.hasAnimation ? toggleInstant : this.hasTransition ? toggleTransition : toggleAnimation;
              const promise = handler(el, show, this);
              const cls = show ? this.clsEnter : this.clsLeave;
              addClass(el, cls);
              trigger(el, show ? "show" : "hide", [this]);
              const done = () => {
                var _a;
                removeClass(el, cls);
                trigger(el, show ? "shown" : "hidden", [this]);
                if (show) {
                  (_a = $$("[autofocus]", el).find(isVisible)) == null ? void 0 : _a.focus({ preventScroll: true });
                }
              };
              return promise ? promise.then(done, () => {
                removeClass(el, cls);
                return CANCELLED;
              }) : done();
            })
          )).every((r) => r !== CANCELLED);
        },
        isToggled(element = this.$el) {
          const el = toNode(element);
          return hasClass(el, this.clsEnter) ? true : hasClass(el, this.clsLeave) ? false : this.cls ? hasClass(el, this.cls.split(" ")[0]) : isVisible(el);
        },
        _toggle(el, toggled) {
          if (!el) {
            return;
          }
          toggled = Boolean(toggled);
          let changed;
          if (this.cls) {
            changed = includes(this.cls, " ") || toggled !== hasClass(el, this.cls);
            if (changed) {
              toggleClass(el, this.cls, includes(this.cls, " ") ? void 0 : toggled);
            }
          } else {
            changed = toggled === el.hidden;
            if (changed) {
              el.hidden = !toggled;
            }
          }
          if (changed) {
            trigger(el, "toggled", [toggled, this]);
          }
        }
      }
    });
    function toggleInstant(el, show, { _toggle }) {
      Animation.cancel(el);
      Transition.cancel(el);
      return _toggle(el, show);
    }
    async function toggleTransition(el, show, { animation, duration, velocity, transition, _toggle }) {
      const [mode = "reveal", startProp = "top"] = typeof animation[0] === "string" ? animation[0].split("-") : [];
      const dirs = [
        ["left", "right"],
        ["top", "bottom"]
      ];
      const dir = dirs[includes(dirs[0], startProp) ? 0 : 1];
      const end = dir[1] === startProp;
      const dimProp = dir === dirs[0] ? "width" : "height";
      const marginProp = `margin-${dir[0]}`;
      const marginStartProp = `margin-${startProp}`;
      let currentDim = dimensions(el)[dimProp];
      const inProgress = Transition.inProgress(el);
      await Transition.cancel(el);
      if (show) {
        _toggle(el, true);
      }
      const previousPropertyNames = [
        "padding",
        "border",
        "width",
        "height",
        "minWidth",
        "minHeight",
        "overflowY",
        "overflowX",
        marginProp,
        marginStartProp
      ];
      const prevProps = Object.fromEntries(
        previousPropertyNames.map((key) => [key, el.style.getPropertyValue(propName(key))])
      );
      const dim = dimensions(el);
      const currentMargin = toFloat(css(el, marginProp));
      const marginStart = toFloat(css(el, marginStartProp));
      const endDim = dim[dimProp] + marginStart;
      if (!inProgress && !show) {
        currentDim += marginStart;
      }
      const [wrapper] = wrapInner(el, "<div>");
      if (!(wrapper instanceof HTMLElement)) {
        return;
      }
      css(wrapper, {
        boxSizing: "border-box",
        height: dim.height,
        width: dim.width,
        ...css(el, [
          "overflow",
          "padding",
          "borderTop",
          "borderRight",
          "borderBottom",
          "borderLeft",
          "borderImage",
          marginStartProp
        ])
      });
      css(el, {
        padding: 0,
        border: 0,
        minWidth: 0,
        minHeight: 0,
        [marginStartProp]: 0,
        width: dim.width,
        height: dim.height,
        overflow: "hidden",
        [dimProp]: currentDim
      });
      const percent = currentDim / endDim;
      duration = (velocity * endDim + duration) * (show ? 1 - percent : percent);
      const endProps = { [dimProp]: show ? endDim : 0 };
      if (end) {
        css(el, marginProp, endDim - currentDim + currentMargin);
        endProps[marginProp] = show ? currentMargin : endDim + currentMargin;
      }
      if (!end !== (mode === "reveal")) {
        css(wrapper, marginProp, -endDim + currentDim);
        Transition.start(wrapper, { [marginProp]: show ? 0 : -endDim }, duration, transition);
      }
      try {
        await Transition.start(el, endProps, duration, transition);
      } finally {
        css(el, prevProps);
        if (wrapper.firstChild) {
          wrapper.replaceWith(...wrapper.childNodes);
        }
        if (!show) {
          _toggle(el, false);
        }
      }
    }
    function toggleAnimation(el, show, cmp) {
      const { animation, duration, _toggle } = cmp;
      if (show) {
        _toggle(el, true);
        return Animation.in(el, toAnimationName(animation[0]), duration, cmp.origin || void 0);
      }
      return Animation.out(
        el,
        toAnimationName(animation[1] || animation[0]),
        duration,
        cmp.origin || void 0
      ).then(() => _toggle(el, false));
    }
    function toAnimationName(value) {
      return typeof value === "string" ? value : "";
    }

    const keyMap = {
      TAB: 9,
      ENTER: 13,
      ESC: 27,
      SPACE: 32,
      END: 35,
      HOME: 36,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
    };

    var Accordion = defineComponent()({
      mixins: [Class, Togglable],
      props: {
        animation: Boolean,
        targets: String,
        active: null,
        collapsible: Boolean,
        multiple: Boolean,
        toggle: String,
        content: String,
        offset: Number
      },
      data: {
        targets: "> *",
        active: false,
        animation: true,
        collapsible: true,
        multiple: false,
        clsOpen: "drk-open",
        toggle: ".drk-accordion-title",
        content: ".drk-accordion-content",
        offset: 0
      },
      computed: {
        items: ({ targets }, $el) => $$(targets, $el),
        toggles({ toggle }) {
          return this.items.map((item) => $(toggle, item));
        },
        contents({ content }) {
          return this.items.map((item) => {
            var _a;
            return ((_a = item._wrapper) == null ? void 0 : _a.firstElementChild) || $(content, item);
          });
        }
      },
      watch: {
        items(items, prev) {
          if (prev || hasClass(items, this.clsOpen)) {
            return;
          }
          const active = this.active !== false && items[Number(this.active)] || !this.collapsible && items[0];
          if (active) {
            this.toggle(active, false);
          }
        },
        toggles() {
          this.$emit();
        },
        contents(items) {
          for (const el of items) {
            const isOpen = hasClass(
              this.items.find((item) => Boolean(el && item.contains(el))),
              this.clsOpen
            );
            hide(el, !isOpen);
          }
          this.$emit();
        }
      },
      observe: lazyload(),
      events: [
        {
          name: "click keydown",
          delegate: ({ targets, $props }) => `${targets} ${$props.toggle}`,
          handler(e) {
            if (e.type === "keydown" && e.keyCode !== keyMap.SPACE) {
              return;
            }
            if (!(e.current instanceof HTMLElement)) {
              return;
            }
            const item = this.toggles.indexOf(e.current);
            if (item === -1) {
              return;
            }
            maybeDefaultPreventClick(e);
            if (!e.target) {
              return;
            }
            const off = keepScrollPosition(e.target);
            this.toggle(item).finally(off);
          }
        },
        {
          name: "show hide shown hidden",
          self: true,
          delegate: ({ targets }) => targets,
          handler() {
            this.$emit();
          }
        }
      ],
      update() {
        const activeItems = filter(this.items, `.${this.clsOpen}`);
        for (const [itemIndex, item] of this.items.entries()) {
          const toggle = this.toggles[itemIndex];
          const content = this.contents[itemIndex];
          if (!toggle || !content) {
            continue;
          }
          toggle.id = generateId(this, toggle);
          content.id = generateId(this, content);
          const active = includes(activeItems, item);
          attr(toggle, {
            role: isTag(toggle, "a") ? "button" : null,
            "aria-controls": content.id,
            "aria-expanded": active,
            "aria-disabled": !this.collapsible && activeItems.length < 2 && active
          });
          attr(content, { role: "region", "aria-labelledby": toggle.id });
          if (isTag(content, "ul")) {
            attr(children(content), "role", "presentation");
          }
        }
      },
      methods: {
        toggle(item, animate) {
          const selected = this.items[getIndex(item, this.items)];
          let items = [selected];
          const activeItems = filter(this.items, `.${this.clsOpen}`);
          if (!this.multiple && !includes(activeItems, items[0])) {
            items = items.concat(activeItems);
          }
          if (!this.collapsible && activeItems.length < 2 && includes(activeItems, selected)) {
            items = [];
          }
          return Promise.all(
            items.map(
              (el) => this.toggleElement(el, !includes(activeItems, el), (el2, show) => {
                toggleClass(el2, this.clsOpen, show);
                if (animate === false || !this.animation) {
                  hide($(this.content, el2), !show);
                  return;
                }
                return transition(el2, show, this);
              })
            )
          );
        }
      }
    });
    function hide(el, hidden) {
      if (el) {
        el.hidden = hidden;
      }
    }
    async function transition(el, show, context) {
      var _a;
      const { content, velocity, transition: transition2 } = context;
      let { duration } = context;
      const contentElement = ((_a = el._wrapper) == null ? void 0 : _a.firstElementChild) || $(content, el);
      if (!(contentElement instanceof HTMLElement)) {
        return;
      }
      if (!el._wrapper) {
        const wrapper2 = wrapAll(contentElement, "<div>");
        if (wrapper2 instanceof HTMLElement) {
          el._wrapper = wrapper2;
        }
      }
      const wrapper = el._wrapper;
      if (!wrapper) {
        return;
      }
      css(wrapper, "overflow", "hidden");
      const currentHeight = toFloat(css(wrapper, "height"));
      await Transition.cancel(wrapper);
      hide(contentElement, false);
      const endHeight = sumBy(["marginTop", "marginBottom"], (prop) => css(contentElement, prop)) + dimensions(contentElement).height;
      const percent = currentHeight / endHeight;
      duration = endHeight ? (velocity * endHeight + duration) * (show ? 1 - percent : percent) : 0;
      css(wrapper, "height", currentHeight);
      await Transition.start(wrapper, { height: show ? endHeight : 0 }, duration, transition2);
      unwrap(contentElement);
      delete el._wrapper;
      if (!show) {
        hide(contentElement, true);
      }
    }
    function keepScrollPosition(el) {
      const scrollElement = scrollParent(el, true);
      let frame = 0;
      (function scroll() {
        frame = requestAnimationFrame(() => {
          const { top } = dimensions(el);
          if (top < 0) {
            scrollElement.scrollTop += top;
          }
          scroll();
        });
      })();
      return () => requestAnimationFrame(() => cancelAnimationFrame(frame));
    }

    var alert = defineComponent()({
      mixins: [Class, Togglable],
      args: "animation",
      props: {
        animation: Boolean,
        close: String
      },
      data: {
        animation: true,
        selClose: ".drk-alert-close",
        duration: 150
      },
      events: {
        name: "click",
        delegate: ({ selClose }) => selClose,
        handler(e) {
          maybeDefaultPreventClick(e);
          this.close();
        }
      },
      methods: {
        async close() {
          await this.toggleElement(this.$el, false, animate$1);
          this.$destroy(true);
        }
      }
    });
    function animate$1(el, show, { duration, transition, velocity }) {
      const height = toFloat(css(el, "height"));
      css(el, "height", height);
      return Transition.start(
        el,
        {
          height: 0,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          borderTop: 0,
          borderBottom: 0,
          opacity: 0
        },
        velocity * height + duration,
        transition
      );
    }

    var Video = defineComponent()({
      args: "autoplay",
      props: {
        automute: Boolean,
        autoplay: Boolean,
        restart: Boolean,
        hoverTarget: Boolean
      },
      data: {
        automute: false,
        autoplay: true,
        restart: false,
        hoverTarget: false
      },
      beforeConnect() {
        const isVideo = isVideoElement(this.$el);
        if (this.autoplay === "inview" && isVideo && !hasAttr(this.$el, "preload")) {
          this.$el.preload = "none";
        }
        if (!isVideo && !hasAttr(this.$el, "allow")) {
          this.$el.allow = "autoplay";
        }
        if (this.autoplay === "hover") {
          if (isVideo) {
            this.$el.tabIndex = 0;
          } else {
            this.autoplay = true;
          }
        }
        if (this.automute || hasAttr(this.$el, "muted")) {
          mute(this.$el);
        }
      },
      events: [
        {
          name: `${pointerEnter} focusin`,
          el: ({ hoverTarget, $el }) => (hoverTarget ? query(hoverTarget, $el) : void 0) || $el,
          filter: ({ autoplay }) => autoplay === "hover",
          handler(e) {
            if (!isTouch(e) || !isPlaying(this.$el)) {
              play(this.$el);
            } else {
              pauseHover(this.$el, this.restart);
            }
          }
        },
        {
          name: `${pointerLeave} focusout`,
          el: ({ hoverTarget, $el }) => (hoverTarget ? query(hoverTarget, $el) : void 0) || $el,
          filter: ({ autoplay }) => autoplay === "hover",
          handler(e) {
            if (!isTouch(e)) {
              pauseHover(this.$el, this.restart);
            }
          }
        }
      ],
      observe: [
        intersection({
          filter: ({ $el }) => isVideoElement($el) && $el.preload === "none",
          handler(entries) {
            const entry = entries[0];
            if (!entry) {
              return;
            }
            const { target } = entry;
            if (isVideoElement(target)) {
              target.preload = "";
            }
            this.$reset();
          }
        }),
        intersection({
          filter: ({ $el, autoplay }) => autoplay !== "hover" && (!isVideoElement($el) || $el.preload !== "none"),
          handler(entries) {
            const entry = entries[0];
            if (!entry) {
              return;
            }
            const { isIntersecting, target } = entry;
            if (!document.fullscreenElement) {
              if (isIntersecting) {
                if (this.autoplay) {
                  play(target);
                }
              } else {
                pauseHover(target, this.restart);
              }
            }
          },
          args: { intersecting: false },
          options: ({ $el, autoplay }) => {
            var _a;
            const parentElement = parent($el);
            return {
              root: autoplay === "inview" ? null : (_a = parentElement == null ? void 0 : parentElement.closest(":not(a)")) != null ? _a : null
            };
          }
        })
      ]
    });
    function isVideoElement(element) {
      return isTag(element, "video");
    }
    function isPlaying(videoEl) {
      return !isVideoElement(videoEl) || !videoEl.paused && !videoEl.ended;
    }
    function pauseHover(el, restart) {
      pause(el);
      if (restart && isVideoElement(el)) {
        el.currentTime = 0;
      }
    }

    var cover = defineComponent()({
      mixins: [Video],
      props: {
        width: Number,
        height: Number
      },
      data: {
        automute: true
      },
      created() {
        this.useObjectFit = isTag(this.$el, "img", "video");
      },
      observe: resize({
        target: ({ $el }) => getPositionedParent($el) || parent($el),
        filter: ({ useObjectFit }) => !useObjectFit
      }),
      update: {
        read() {
          if (this.useObjectFit) {
            return false;
          }
          const { $el, width = $el.clientWidth, height = $el.clientHeight } = this;
          const el = getPositionedParent($el) || parent($el);
          if (!el) {
            return false;
          }
          const dim = Dimensions.cover(
            { width, height },
            { width: el.offsetWidth, height: el.offsetHeight }
          );
          return dim.width && dim.height ? dim : false;
        },
        write({ height, width }) {
          css(this.$el, { height, width });
        },
        events: ["resize"]
      }
    });
    function getPositionedParent(el) {
      let current = el;
      while (current = parent(current)) {
        if (css(current, "position") !== "static") {
          return current;
        }
      }
    }

    var Container = defineMixin()({
      props: {
        container: Boolean
      },
      data: {
        container: true
      },
      computed: {
        container({ container }) {
          if (container === true) {
            return this.$container;
          }
          if (typeof container === "string") {
            return container ? $(container) : "";
          }
          return container ? $(container) : false;
        }
      }
    });

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

    let active$1;
    var drop = defineComponent()({
      mixins: [Class, Container, Position, Togglable],
      args: "pos",
      props: {
        mode: "list",
        toggle: Boolean,
        boundary: Boolean,
        boundaryX: Boolean,
        boundaryY: Boolean,
        target: Boolean,
        targetX: Boolean,
        targetY: Boolean,
        stretch: Boolean,
        delayShow: Number,
        delayHide: Number,
        autoUpdate: Boolean,
        animateOut: Boolean,
        bgScroll: Boolean,
        closeOnScroll: Boolean
      },
      data: {
        mode: ["click", "hover"],
        toggle: "- *",
        boundary: false,
        boundaryX: false,
        boundaryY: false,
        target: false,
        targetX: false,
        targetY: false,
        stretch: false,
        delayShow: 0,
        delayHide: 800,
        autoUpdate: true,
        animateOut: false,
        bgScroll: true,
        animation: ["drk-animation-fade"],
        cls: "drk-open",
        container: false,
        closeOnScroll: false,
        selClose: ".drk-drop-close"
      },
      computed: {
        boundary({ boundary, boundaryX, boundaryY }, $el) {
          return [
            resolveReference(boundaryX || boundary, $el) || window,
            resolveReference(boundaryY || boundary, $el) || window
          ];
        },
        target({ target, targetX, targetY }, $el) {
          targetX || (targetX = target || this.targetEl);
          targetY || (targetY = target || this.targetEl);
          return [
            targetX === true ? window : resolveReference(targetX, $el),
            targetY === true ? window : resolveReference(targetY, $el)
          ];
        }
      },
      created() {
        this.tracker = new MouseTracker();
      },
      connected() {
        addClass(this.$el, "drk-drop");
        if (this.toggle && !this.targetEl) {
          this.targetEl = createToggleComponent(this);
        }
        attr(this.targetEl, "aria-expanded", false);
        this._style = {
          width: this.$el.style.width,
          height: this.$el.style.height
        };
      },
      disconnected() {
        if (this.isActive()) {
          this.hide(false);
          active$1 = null;
        }
        css(this.$el, this._style);
      },
      events: [
        {
          name: "click",
          delegate: ({ selClose }) => selClose,
          handler(e) {
            maybeDefaultPreventClick(e);
            this.hide(false);
          }
        },
        {
          name: "click",
          delegate: () => 'a[href*="#"]',
          handler({ defaultPrevented, current }) {
            var _a;
            if (!(current instanceof HTMLAnchorElement)) {
              return;
            }
            const { hash } = current;
            if (!defaultPrevented && hash && isSameSiteAnchor(current) && !this.$el.contains((_a = $(hash)) != null ? _a : null)) {
              this.hide(false);
            }
          }
        },
        {
          name: "beforescroll",
          handler() {
            this.hide(false);
          }
        },
        {
          name: "toggle",
          self: true,
          handler(e, toggle) {
            e.preventDefault();
            if (this.isToggled()) {
              this.hide(false);
            } else {
              this.show(getToggleElement(toggle), false);
            }
          }
        },
        {
          name: "toggleshow",
          self: true,
          handler(e, toggle) {
            e.preventDefault();
            this.show(getToggleElement(toggle));
          }
        },
        {
          name: "togglehide",
          self: true,
          handler(e) {
            e.preventDefault();
            if (!matches(this.$el, ":focus,:hover")) {
              this.hide();
            }
          }
        },
        {
          name: `${pointerEnter} focusin`,
          filter: ({ mode }) => includes(mode, "hover"),
          handler(e) {
            if (!isTouch(e)) {
              this.clearTimers();
            }
          }
        },
        {
          name: `${pointerLeave} focusout`,
          filter: ({ mode }) => includes(mode, "hover"),
          handler(e) {
            if (!isTouch(e) && e.relatedTarget) {
              this.hide();
            }
          }
        },
        {
          name: "toggled",
          self: true,
          handler(_event, toggled) {
            if (toggled) {
              this.clearTimers();
              this.position();
            }
          }
        },
        {
          name: "show",
          self: true,
          handler() {
            setActive(this);
            this.tracker.init();
            attr(this.targetEl, "aria-expanded", true);
            const handlers = [
              listenForResize(this),
              listenForEscClose$1(this),
              listenForBackgroundClose$1(this),
              this.autoUpdate && listenForScroll(this),
              this.closeOnScroll && listenForScrollClose(this)
            ];
            once(this.$el, "hide", () => handlers.forEach((handler) => handler && handler()), {
              self: true
            });
            if (!this.bgScroll) {
              once(this.$el, "hidden", preventBackgroundScroll(this.$el), { self: true });
            }
          }
        },
        {
          name: "beforehide",
          self: true,
          handler() {
            this.clearTimers();
          }
        },
        {
          name: "hide",
          handler({ target }) {
            if (this.$el !== target) {
              active$1 = active$1 === null && this.$el.contains(target) && this.isToggled() ? this : active$1;
              return;
            }
            active$1 = this.isActive() ? null : active$1;
            this.tracker.cancel();
            attr(this.targetEl, "aria-expanded", false);
          }
        }
      ],
      update: {
        write() {
          if (this.isToggled() && !hasClass(this.$el, this.clsEnter)) {
            this.position();
          }
        }
      },
      methods: {
        show(target, delay = true) {
          if (target === void 0) {
            target = this.targetEl;
          }
          if (this.isToggled() && target && this.targetEl && target !== this.targetEl) {
            this.hide(false, false);
          }
          this.targetEl = target;
          this.clearTimers();
          if (this.isActive()) {
            return;
          }
          if (active$1) {
            if (delay && active$1.isDelaying()) {
              this.showTimer = setTimeout(() => matches(target, ":hover") && this.show(), 10);
              return;
            }
            let prev;
            while (active$1 && prev !== active$1 && !active$1.$el.contains(this.$el)) {
              prev = active$1;
              active$1.hide(false, false);
            }
            delay = false;
          }
          if (this.container && parent(this.$el) !== this.container) {
            append(this.container, this.$el);
          }
          addClass(this.$el, this.clsEnter);
          this.showTimer = setTimeout(
            () => this.toggleElement(this.$el, true),
            delay && this.delayShow || 0
          );
        },
        hide(delay = true, animate = true) {
          const hide = () => {
            removeClass(this.$el, this.clsEnter);
            this.toggleElement(this.$el, false, this.animateOut && animate);
          };
          this.clearTimers();
          this.isDelayedHide = delay;
          if (delay && this.isDelaying()) {
            this.hideTimer = setTimeout(this.hide, 50);
          } else if (delay && this.delayHide) {
            this.hideTimer = setTimeout(hide, this.delayHide);
          } else {
            hide();
          }
        },
        clearTimers() {
          var _a, _b;
          clearTimeout((_a = this.showTimer) != null ? _a : void 0);
          clearTimeout((_b = this.hideTimer) != null ? _b : void 0);
          this.showTimer = null;
          this.hideTimer = null;
        },
        isActive() {
          return active$1 === this;
        },
        isDelaying() {
          return [this.$el, ...$$(".drk-drop", this.$el)].some((el) => this.tracker.movesTo(el));
        },
        position() {
          const restoreScrollPosition = storeScrollPosition(this.$el);
          removeClass(this.$el, "drk-drop-stack");
          css(this.$el, this._style);
          this.$el.hidden = true;
          const viewports = [
            getViewport$1(this.$el, this.target[0]),
            getViewport$1(this.$el, this.target[1])
          ];
          const viewportOffset = this.getViewportOffset(this.$el);
          const dirs = [
            [0, ["x", "width", "left", "right"]],
            [1, ["y", "height", "top", "bottom"]]
          ];
          for (const [i, [axis, prop]] of dirs) {
            if (this.axis !== axis && includes([axis, true], this.stretch)) {
              css(this.$el, {
                [prop]: Math.min(
                  offset(this.boundary[i])[prop],
                  viewports[i][prop] - 2 * viewportOffset
                ),
                [`overflow-${axis}`]: "auto"
              });
            }
          }
          const maxWidth = viewports[0].width - 2 * viewportOffset;
          this.$el.hidden = false;
          css(this.$el, "maxWidth", "");
          if (this.$el.offsetWidth > maxWidth) {
            addClass(this.$el, "drk-drop-stack");
          }
          css(this.$el, "maxWidth", maxWidth);
          this.positionAt(this.$el, this.target, this.boundary);
          for (const [i, [axis, prop, start, end]] of dirs) {
            if (this.axis === axis && includes([axis, true], this.stretch)) {
              const positionOffset = Math.abs(this.getPositionOffset());
              const targetOffset = offset(this.target[i]);
              const elOffset = offset(this.$el);
              css(this.$el, {
                [prop]: (targetOffset[start] > elOffset[start] ? targetOffset[this.inset ? end : start] - Math.max(
                  offset(this.boundary[i])[start],
                  viewports[i][start] + viewportOffset
                ) : Math.min(
                  offset(this.boundary[i])[end],
                  viewports[i][end] - viewportOffset
                ) - targetOffset[this.inset ? start : end]) - positionOffset,
                [`overflow-${axis}`]: "auto"
              });
              this.positionAt(this.$el, this.target, this.boundary);
            }
          }
          restoreScrollPosition();
        }
      }
    });
    function resolveReference(value, context) {
      return value instanceof Element ? value : typeof value === "string" ? query(value, context) : void 0;
    }
    function setActive(drop) {
      active$1 = drop;
    }
    function getViewport$1(el, target) {
      const viewport = target instanceof Element ? overflowParents(target).find((ancestor) => ancestor.contains(el)) : void 0;
      return offsetViewport(viewport);
    }
    function getToggleElement(value) {
      if (typeof value !== "object" || value === null || !("$el" in value)) {
        return void 0;
      }
      return value.$el instanceof HTMLElement ? value.$el : void 0;
    }
    function createToggleComponent(drop) {
      const el = typeof drop.toggle === "string" ? query(drop.toggle, drop.$el) : void 0;
      if (el) {
        drop.$create("toggle", el, { target: drop.$el, mode: drop.mode });
        el.ariaHasPopup = "true";
      }
      return el;
    }
    function listenForResize(drop) {
      const update = () => drop.$emit();
      const resizeTargets = drop.target.filter(
        (target) => target instanceof HTMLElement
      );
      const off = [
        observeViewportResize(update),
        observeResize(overflowParents(drop.$el).concat(resizeTargets), update)
      ];
      return () => off.map((observer) => observer.disconnect());
    }
    function listenForScroll(drop, fn = () => drop.$emit()) {
      return on([document, ...overflowParents(drop.$el)], "scroll", fn, {
        passive: true
      });
    }
    function listenForEscClose$1(drop) {
      return on(document, "keydown", (e) => {
        if (e.keyCode === keyMap.ESC) {
          drop.hide(false);
        }
      });
    }
    function listenForScrollClose(drop) {
      return listenForScroll(drop, () => drop.hide(false));
    }
    function listenForBackgroundClose$1(drop) {
      return on(document, pointerDown, ({ target }) => {
        if (target instanceof Node && drop.$el.contains(target)) {
          return;
        }
        once(
          document,
          `${pointerUp} ${pointerCancel} scroll`,
          ({ defaultPrevented, type, target: newTarget }) => {
            var _a;
            if (!defaultPrevented && type === pointerUp && target === newTarget && !(target instanceof Node && ((_a = drop.targetEl) == null ? void 0 : _a.contains(target)))) {
              drop.hide(false);
            }
          },
          true
        );
      });
    }

    var Dropnav = defineComponent()({
      mixins: [Class, Container],
      props: {
        align: String,
        boundary: Boolean,
        dropbar: Boolean,
        dropbarAnchor: Boolean,
        duration: Number,
        mode: Boolean,
        offset: Boolean,
        stretch: Boolean,
        delayShow: Boolean,
        delayHide: Boolean,
        target: Boolean,
        targetX: Boolean,
        targetY: Boolean,
        animation: Boolean,
        animateOut: Boolean,
        closeOnScroll: Boolean
      },
      data: {
        align: isRtl ? "right" : "left",
        clsDrop: "drk-dropdown",
        clsDropbar: "drk-dropnav-dropbar",
        boundary: true,
        dropbar: false,
        dropbarAnchor: false,
        flip: true,
        delayShow: 160,
        duration: 200,
        container: false,
        selNavItem: "> li > a, > ul > li > a"
      },
      computed: {
        dropbarAnchor: ({ dropbarAnchor }, $el) => resolveDropnavElement(dropbarAnchor, $el) || $el,
        dropbar({ dropbar }) {
          if (!dropbar) {
            return null;
          }
          const element = this._dropbar || resolveDropnavElement(dropbar, this.$el) || $(`+ .${this.clsDropbar}`, this.$el);
          return element || (this._dropbar = document.createElement("div"));
        },
        dropContainer(_props, $el) {
          return this.container || $el;
        },
        dropdowns({ clsDrop }, $el) {
          var _a;
          const dropdowns = $$(`.${clsDrop}`, $el);
          if (this.dropContainer !== $el) {
            for (const el of $$(`.${clsDrop}`, this.dropContainer)) {
              const target = (_a = this.getDropdown(el)) == null ? void 0 : _a.targetEl;
              if (!includes(dropdowns, el) && target && this.$el.contains(target)) {
                dropdowns.push(el);
              }
            }
          }
          return dropdowns;
        },
        items({ selNavItem }, $el) {
          return $$(selNavItem, $el);
        }
      },
      watch: {
        dropbar(dropbar) {
          addClass(
            dropbar,
            "drk-dropbar",
            "drk-dropbar-top",
            this.clsDropbar,
            `drk-${this.$options.name}-dropbar`
          );
        },
        dropdowns() {
          this.initializeDropdowns();
        }
      },
      connected() {
        this.initializeDropdowns();
        preventInitialPointerEnter(this.$el);
      },
      disconnected() {
        remove$1(this._dropbar);
        delete this._dropbar;
      },
      events: [
        {
          name: "mouseover focusin",
          delegate: ({ selNavItem }) => selNavItem,
          handler({ current }) {
            const active2 = this.getActive();
            if (active2 && includes(active2.mode, "hover") && active2.targetEl && current && !current.contains(active2.targetEl) && !active2.isDelaying()) {
              active2.hide(false);
            }
          }
        },
        {
          name: "keydown",
          self: true,
          delegate: ({ selNavItem }) => selNavItem,
          handler(e) {
            var _a;
            const { current, keyCode } = e;
            const active2 = this.getActive();
            if (keyCode === keyMap.DOWN) {
              if (active2 && active2.targetEl === current) {
                e.preventDefault();
                (_a = $(selFocusable, active2.$el)) == null ? void 0 : _a.focus();
              } else {
                const dropdown = this.dropdowns.find(
                  (el) => {
                    var _a2;
                    return ((_a2 = this.getDropdown(el)) == null ? void 0 : _a2.targetEl) === current;
                  }
                );
                if (dropdown) {
                  e.preventDefault();
                  if (current instanceof HTMLElement) {
                    current.click();
                  }
                  once(dropdown, "show", (event) => {
                    var _a2;
                    if (event.target) {
                      (_a2 = $(selFocusable, event.target)) == null ? void 0 : _a2.focus();
                    }
                  });
                }
              }
            }
            handleNavItemNavigation(e, this.items, active2);
          }
        },
        {
          name: "keydown",
          el: ({ dropContainer }) => dropContainer,
          delegate: ({ clsDrop }) => `.${clsDrop}`,
          handler(e) {
            var _a, _b;
            const { current, keyCode, target } = e;
            if (isInput(target) || !includes(this.dropdowns, current)) {
              return;
            }
            const active2 = this.getActive();
            let next = -1;
            if (keyCode === keyMap.HOME) {
              next = 0;
            } else if (keyCode === keyMap.END) {
              next = "last";
            } else if (keyCode === keyMap.UP) {
              next = "previous";
            } else if (keyCode === keyMap.DOWN) {
              next = "next";
            } else if (keyCode === keyMap.ESC) {
              (_a = active2 == null ? void 0 : active2.targetEl) == null ? void 0 : _a.focus();
            }
            if (next !== -1) {
              e.preventDefault();
              const elements = $$(selFocusable, current);
              (_b = elements[getIndex(
                next,
                elements,
                findIndex(elements, (el) => matches(el, ":focus"))
              )]) == null ? void 0 : _b.focus();
              return;
            }
            handleNavItemNavigation(e, this.items, active2);
          }
        },
        {
          name: "mouseleave",
          el: ({ dropbar }) => dropbar,
          filter: ({ dropbar }) => Boolean(dropbar),
          handler() {
            const active2 = this.getActive();
            if (active2 && includes(active2.mode, "hover") && !this.dropdowns.some((el) => matches(el, ":hover"))) {
              active2.hide();
            }
          }
        },
        {
          name: "beforeshow",
          el: ({ dropContainer }) => dropContainer,
          filter: ({ dropbar }) => Boolean(dropbar),
          handler({ target }) {
            if (!(target instanceof HTMLElement) || !this.dropbar || !this.isDropbarDrop(target)) {
              return;
            }
            if (this.dropbar.previousElementSibling !== this.dropbarAnchor) {
              after(this.dropbarAnchor, this.dropbar);
            }
            addClass(target, `${this.clsDrop}-dropbar`);
          }
        },
        {
          name: "show",
          el: ({ dropContainer }) => dropContainer,
          filter: ({ dropbar }) => Boolean(dropbar),
          handler({ target }) {
            if (!(target instanceof HTMLElement) || !this.dropbar || !this.isDropbarDrop(target)) {
              return;
            }
            const dropdownElement = target;
            const drop = this.getDropdown(dropdownElement);
            if (!drop) {
              return;
            }
            const dropbar = this.dropbar;
            const adjustHeight = () => {
              const maxBottom = Math.max(
                ...parents(dropdownElement, `.${this.clsDrop}`).concat(dropdownElement).map((el) => offset(el).bottom)
              );
              offset(dropbar, {
                left: offset(dropbar).left,
                top: this.getDropbarOffset(drop.getPositionOffset())
              });
              this.transitionTo(
                maxBottom - offset(dropbar).top + toFloat(css(dropdownElement, "marginBottom")),
                dropdownElement
              );
            };
            const resizeTargets = [drop.$el, ...drop.target].filter(
              (element) => element instanceof Element
            );
            this._observer = observeResize(resizeTargets, adjustHeight);
            adjustHeight();
          }
        },
        {
          name: "beforehide",
          el: ({ dropContainer }) => dropContainer,
          filter: ({ dropbar }) => Boolean(dropbar),
          handler(e) {
            const active2 = this.getActive();
            if (matches(this.dropbar, ":hover") && active2 && active2.$el === e.target && this.isDropbarDrop(active2.$el) && includes(active2.mode, "hover") && active2.isDelayedHide && !this.items.some((el) => active2.targetEl !== el && matches(el, ":focus"))) {
              e.preventDefault();
            }
          }
        },
        {
          name: "hide",
          el: ({ dropContainer }) => dropContainer,
          filter: ({ dropbar }) => Boolean(dropbar),
          handler({ target }) {
            var _a;
            if (!target || !this.isDropbarDrop(target)) {
              return;
            }
            (_a = this._observer) == null ? void 0 : _a.disconnect();
            const active2 = this.getActive();
            if (!active2 || active2.$el === target) {
              this.transitionTo(0);
            }
          }
        }
      ],
      methods: {
        getActive() {
          var _a;
          return includes(this.dropdowns, (_a = active$1) == null ? void 0 : _a.$el) && active$1;
        },
        async transitionTo(newHeight, el) {
          const { dropbar } = this;
          if (!dropbar) {
            return;
          }
          const oldHeight = height(dropbar);
          if (oldHeight >= newHeight) {
            el = void 0;
          }
          await Transition.cancel(el ? [el, dropbar] : dropbar);
          if (el) {
            const diff = offset(el).top - offset(dropbar).top - oldHeight;
            if (diff > 0) {
              css(el, "transitionDelay", `${diff / newHeight * this.duration}ms`);
            }
          }
          css(el, "clipPath", `polygon(0 0,100% 0,100% ${oldHeight}px,0 ${oldHeight}px)`);
          height(dropbar, oldHeight);
          await Promise.all([
            Transition.start(dropbar, { height: newHeight }, this.duration),
            Transition.start(
              el,
              { clipPath: `polygon(0 0,100% 0,100% ${newHeight}px,0 ${newHeight}px)` },
              this.duration
            ).finally(() => css(el, { clipPath: "", transitionDelay: "" }))
          ]).catch(noop);
        },
        getDropdown(el) {
          const component = this.$getComponent(el, "drop") || this.$getComponent(el, "dropdown");
          return isDropInstance(component) ? component : void 0;
        },
        isDropbarDrop(el) {
          return includes(this.dropdowns, el) && hasClass(el, this.clsDrop);
        },
        getDropbarOffset(offsetTop) {
          const { $el, target, targetY } = this;
          const targetElement = resolveDropnavElement(targetY || target, $el) || $el;
          const { top, height: height2 } = offset(targetElement);
          return top + height2 + offsetTop;
        },
        initializeDropdowns() {
          this.$create(
            "drop",
            this.dropdowns.filter((el) => !this.getDropdown(el)),
            {
              ...this.$props,
              flip: this.flip && !this.$props.dropbar,
              shift: true,
              pos: `bottom-${this.align}`,
              boundary: false,
              boundaryX: this.boundary === true ? this.$el : this.boundary
            }
          );
        }
      }
    });
    function handleNavItemNavigation(e, toggles, currentDrop) {
      var _a, _b;
      const { current, keyCode } = e;
      let next = -1;
      if (keyCode === keyMap.HOME) {
        next = 0;
      } else if (keyCode === keyMap.END) {
        next = "last";
      } else if (keyCode === keyMap.LEFT) {
        next = "previous";
      } else if (keyCode === keyMap.RIGHT) {
        next = "next";
      } else if (keyCode === keyMap.TAB) {
        (_a = currentDrop == null ? void 0 : currentDrop.targetEl) == null ? void 0 : _a.focus();
        currentDrop == null ? void 0 : currentDrop.hide(false);
      }
      if (next !== -1) {
        e.preventDefault();
        currentDrop == null ? void 0 : currentDrop.hide(false);
        const currentToggle = (currentDrop == null ? void 0 : currentDrop.targetEl) || current;
        const currentIndex = currentToggle instanceof HTMLElement ? toggles.indexOf(currentToggle) : -1;
        (_b = toggles[getIndex(next, toggles, currentIndex)]) == null ? void 0 : _b.focus();
      }
    }
    function preventInitialPointerEnter(el) {
      let handlers = [];
      const off = () => handlers.forEach((handler) => handler());
      handlers = [
        once(el.ownerDocument, pointerMove, (e) => {
          if (!(e.target instanceof Node && el.contains(e.target))) {
            off();
          }
        }),
        on(el, `mouseenter ${pointerEnter}`, (e) => e.stopPropagation(), { capture: true }),
        on(el, `mouseleave ${pointerLeave}`, off, { capture: true })
      ];
    }
    function resolveDropnavElement(value, context) {
      if (value instanceof HTMLElement) {
        return value;
      }
      return typeof value === "string" ? query(value, context) : void 0;
    }
    function isDropInstance(value) {
      return typeof value === "object" && value !== null && "$el" in value && value.$el instanceof HTMLElement && "hide" in value && typeof value.hide === "function" && "getPositionOffset" in value && typeof value.getPositionOffset === "function";
    }

    var formCustom = defineComponent()({
      mixins: [Class],
      args: "target",
      props: {
        target: Boolean
      },
      data: {
        target: false
      },
      computed: {
        input: (_props, $el) => $(selInput, $el),
        state() {
          return this.input.nextElementSibling;
        },
        target({ target }, $el) {
          return target && (target === true && parent(this.input) === $el && this.input.nextElementSibling || (typeof target === "string" ? $(target, $el) : void 0));
        }
      },
      update() {
        var _a;
        const { target, input } = this;
        if (!target) {
          return;
        }
        const inputTarget = isInput(target) && "value" in target;
        const prev = inputTarget ? String(target.value) : target.textContent;
        const selectedOption = input instanceof HTMLSelectElement ? $$("option", input).find((el) => el.selected) : void 0;
        const value = input instanceof HTMLInputElement && ((_a = input.files) == null ? void 0 : _a[0]) ? input.files[0].name : matches(input, "select") && selectedOption ? selectedOption.textContent : input.value;
        if (prev !== value) {
          if (inputTarget) {
            target.value = value != null ? value : "";
          } else {
            target.textContent = value;
          }
        }
      },
      events: [
        {
          name: "change",
          handler() {
            this.$emit();
          }
        },
        {
          name: "reset",
          el: ({ $el }) => $el.closest("form"),
          handler() {
            this.$emit();
          }
        }
      ]
    });

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

    var grid = defineComponent()({
      extends: Margin,
      mixins: [Class],
      name: "grid",
      props: {
        masonry: Boolean,
        parallax: String,
        parallaxStart: String,
        parallaxEnd: String,
        parallaxJustify: Boolean
      },
      data: {
        margin: "drk-grid-margin",
        clsStack: "drk-grid-stack",
        masonry: false,
        parallax: 0,
        parallaxStart: 0,
        parallaxEnd: 0,
        parallaxJustify: false
      },
      connected() {
        if (this.masonry) {
          addClass(this.$el, "drk-flex-top", "drk-flex-wrap-top");
        }
      },
      observe: scroll$1({
        filter: ({ parallax, parallaxJustify }) => Boolean(parallax || parallaxJustify)
      }),
      update: [
        {
          write({ rows }) {
            toggleClass(this.$el, this.clsStack, !rows.some((row) => row.length > 1));
          },
          events: ["resize"]
        },
        {
          read(data) {
            var _a, _b;
            const { rows } = data;
            const { masonry, parallaxJustify, margin } = this;
            let parallax = Math.max(0, toPx(this.parallax));
            if (!(masonry || parallax || parallaxJustify) || positionedAbsolute(rows) || ((_b = (_a = rows[0]) == null ? void 0 : _a.some(
              (el, i) => rows.some((row) => row[i] && row[i].offsetWidth !== el.offsetWidth)
            )) != null ? _b : false)) {
              return data.translates = data.scrollColumns = false;
            }
            const gutter = getGutter(rows, margin);
            let columns;
            let translates;
            if (masonry) {
              [columns, translates] = applyMasonry(rows, gutter, masonry === "next");
            } else {
              columns = transpose(rows);
            }
            const columnHeights = columns.map(
              (column) => sumBy(column, "offsetHeight") + gutter * (column.length - 1)
            );
            const height = Math.max(0, ...columnHeights);
            let scrollColumns;
            let parallaxStart;
            let parallaxEnd;
            if (parallax || parallaxJustify) {
              scrollColumns = columnHeights.map(
                (hgt, i) => parallaxJustify ? height - hgt + parallax : parallax / (i % 2 || 8)
              );
              if (!parallaxJustify) {
                parallax = Math.max(
                  ...columnHeights.map(
                    (hgt, i) => {
                      var _a2;
                      return hgt + ((_a2 = scrollColumns == null ? void 0 : scrollColumns[i]) != null ? _a2 : 0) - height;
                    }
                  )
                );
              }
              parallaxStart = toPx(this.parallaxStart, "height", this.$el, true);
              parallaxEnd = toPx(this.parallaxEnd, "height", this.$el, true);
            }
            return {
              columns,
              translates,
              scrollColumns,
              parallaxStart,
              parallaxEnd,
              padding: parallax,
              height: translates ? height : ""
            };
          },
          write({ height, padding }) {
            css(this.$el, "paddingBottom", padding || "");
            if (height !== false) {
              css(this.$el, "height", height);
            }
          },
          events: ["resize"]
        },
        {
          read({ rows, scrollColumns, parallaxStart, parallaxEnd }) {
            return {
              scrolled: scrollColumns && !positionedAbsolute(rows) ? scrolledOver(this.$el, parallaxStart, parallaxEnd) : false
            };
          },
          write({ columns, scrolled, scrollColumns, translates }) {
            if (!scrolled && !translates || !columns) {
              return;
            }
            columns.forEach(
              (column, i) => column.forEach((el, j) => {
                var _a, _b;
                const [x, initialY] = translates && ((_a = translates[i]) == null ? void 0 : _a[j]) || [0, 0];
                let y = initialY;
                if (scrolled && scrollColumns) {
                  y += scrolled * ((_b = scrollColumns[i]) != null ? _b : 0);
                }
                css(el, "transform", `translate(${x}px, ${y}px)`);
              })
            );
          },
          events: ["scroll", "resize"]
        }
      ]
    });
    function positionedAbsolute(rows) {
      return rows.flat().some((el) => css(el, "position") === "absolute");
    }
    function applyMasonry(rows, gutter, next) {
      var _a, _b, _c, _d;
      const columns = [];
      const translates = [];
      const columnHeights = Array((_b = (_a = rows[0]) == null ? void 0 : _a.length) != null ? _b : 0).fill(0);
      let rowHeights = 0;
      for (const row of rows) {
        const cells = isRtl ? row.slice().reverse() : row;
        let height = 0;
        for (const [j, cell] of cells.entries()) {
          const { offsetWidth, offsetHeight } = cell;
          const index = next ? j : columnHeights.indexOf(Math.min(...columnHeights));
          push(columns, index, cell);
          push(translates, index, [
            (index - j) * offsetWidth * (isRtl ? -1 : 1),
            ((_c = columnHeights[index]) != null ? _c : 0) - rowHeights
          ]);
          columnHeights[index] = ((_d = columnHeights[index]) != null ? _d : 0) + offsetHeight + gutter;
          height = Math.max(height, offsetHeight);
        }
        rowHeights += height + gutter;
      }
      return [columns, translates];
    }
    function getGutter(rows, cls) {
      var _a;
      const node = rows.flat().find((el) => hasClass(el, cls));
      return toFloat(node ? css(node, "marginTop") : css((_a = rows[0]) == null ? void 0 : _a[0], "paddingLeft"));
    }
    function transpose(rows) {
      const columns = [];
      for (const row of rows) {
        for (const [index, element] of row.entries()) {
          push(columns, index, element);
        }
      }
      return columns;
    }
    function push(array, index, value) {
      var _a;
      if (!array[index]) {
        array[index] = [];
      }
      (_a = array[index]) == null ? void 0 : _a.push(value);
    }

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

    var heightPlaceholder = defineComponent()({
      args: "target",
      props: {
        target: String
      },
      data: {
        target: ""
      },
      computed: {
        target: {
          get: ({ target }, $el) => query(target, $el),
          observe: ({ target }) => target
        }
      },
      observe: resize({ target: ({ target }) => target }),
      update: {
        read() {
          return this.target ? { height: this.target.offsetHeight } : false;
        },
        write({ height }) {
          css(this.$el, "minHeight", height);
        },
        events: ["resize"]
      }
    });

    var Media = defineMixin()({
      props: {
        media: Boolean
      },
      data: {
        media: false
      },
      connected() {
        const media = toMedia(this.media, this.$el);
        this.matchMedia = true;
        if (media) {
          this.mediaObj = window.matchMedia(media);
          const handler = () => {
            this.matchMedia = this.mediaObj.matches;
            trigger(this.$el, createEvent("mediachange", false, true, [this.mediaObj]));
          };
          this.offMediaObj = on(this.mediaObj, "change", () => {
            handler();
            this.$emit("resize");
          });
          handler();
        }
      },
      disconnected() {
        var _a;
        (_a = this.offMediaObj) == null ? void 0 : _a.call(this);
      }
    });
    function toMedia(value, element) {
      if (isString(value)) {
        if (startsWith(value, "@")) {
          value = toFloat(css(element, `--drk-breakpoint-${value.slice(1)}`));
        } else if (Number.isNaN(Number(value))) {
          return value;
        }
      }
      return value && isNumeric(value) ? `(min-width: ${value}px)` : "";
    }

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

    var I18n = defineMixin()({
      props: {
        i18n: Object
      },
      data: {
        i18n: null
      },
      methods: {
        t(key, ...params) {
          var _a, _b, _c;
          let i = 0;
          return ((_c = ((_a = this.i18n) == null ? void 0 : _a[key]) || ((_b = this.$options.i18n) == null ? void 0 : _b[key])) == null ? void 0 : _c.replace(
            /%s/g,
            () => params[i++] || ""
          )) || "";
        }
      }
    });

    const iconNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const Icon = {
      args: "icon",
      props: {
        icon: String,
        width: Number,
        height: Number,
        ratio: Number
      },
      data: {
        ratio: 1
      },
      isIcon: true,
      beforeConnect() {
        addClass(this.$el, "drk-icon", "drk-ti");
      },
      connected() {
        const icon = normalizeIconName(this.icon);
        if (!icon) {
          return;
        }
        this._iconClasses = [`drk-ti-${icon}`, `drk-icon-alias-${icon}`];
        addClass(this.$el, this._iconClasses);
        setDimensions(this);
        hideDecorativeIcon(this);
      },
      disconnected() {
        removeClass(this.$el, this._iconClasses);
        css(this.$el, {
          "--drk-icon-ratio": "",
          "--drk-icon-width": "",
          "--drk-icon-height": ""
        });
        if (this._iconAddedAriaHidden) {
          attr(this.$el, "aria-hidden", null);
        }
        this._iconAddedAriaHidden = void 0;
        this._iconClasses = void 0;
      }
    };
    const IconComponent = {
      args: false,
      extends: Icon,
      data: (instance) => ({
        icon: hyphenate(instance.constructor.options.name || "")
      }),
      beforeConnect() {
        addClass(this.$el, String(this.$options.id || ""));
      }
    };
    const NavParentIcon = {
      extends: IconComponent,
      beforeConnect() {
        const icon = readIconProp(this);
        this.icon = this.$el.closest(".drk-nav-primary") ? `${icon}-large` : icon;
      }
    };
    const Search = {
      extends: IconComponent,
      mixins: [I18n],
      i18n: { toggle: "Open Search", submit: "Submit Search" },
      beforeConnect() {
        const isToggle = hasClass(this.$el, "drk-search-toggle") || hasClass(this.$el, "drk-navbar-toggle");
        this.icon = isToggle ? "search-toggle-icon" : hasClass(this.$el, "drk-search-icon") && this.$el.closest(".drk-search-large") ? "search-large" : this.$el.closest(".drk-search-medium") ? "search-medium" : readIconProp(this);
        if (hasAttr(this.$el, "aria-label")) {
          return;
        }
        if (isToggle) {
          attr(this.$el, "aria-label", this.t("toggle"));
          return;
        }
        const button = this.$el.closest("a,button");
        if (button && !hasAttr(button, "aria-label")) {
          attr(button, "aria-label", this.t("submit"));
        }
      }
    };
    const Spinner = {
      extends: IconComponent,
      mixins: [I18n],
      i18n: { label: "Loading" },
      beforeConnect() {
        attr(this.$el, "role", "status");
        if (!hasAttr(this.$el, "aria-label")) {
          attr(this.$el, "aria-label", this.t("label"));
        }
      }
    };
    const ButtonComponent = {
      extends: IconComponent,
      mixins: [I18n],
      beforeConnect() {
        const button = this.$el.closest("a,button");
        if (!button) {
          return;
        }
        attr(
          button,
          "role",
          this.role !== null && isTag(button, "a") ? "button" : this.role || null
        );
        const label = this.t("label");
        if (label && !hasAttr(button, "aria-label")) {
          attr(button, "aria-label", label);
        }
      }
    };
    const Slidenav = {
      extends: ButtonComponent,
      beforeConnect() {
        addClass(this.$el, "drk-slidenav");
        const icon = readIconProp(this);
        this.icon = hasClass(this.$el, "drk-slidenav-large") ? `${icon}-large` : icon;
      }
    };
    const NavbarToggleIcon = {
      extends: ButtonComponent,
      i18n: { label: "Open menu" },
      beforeConnect() {
        const button = this.$el.closest("a,button");
        if (button && !hasAttr(button, "aria-expanded")) {
          attr(button, "aria-expanded", "false");
        }
      }
    };
    const Close = {
      extends: ButtonComponent,
      i18n: { label: "Close" },
      beforeConnect() {
        this.icon = `close-${hasClass(this.$el, "drk-close-large") ? "large" : "icon"}`;
      }
    };
    const Marker = {
      extends: ButtonComponent,
      i18n: { label: "Open" }
    };
    const Totop = {
      extends: ButtonComponent,
      i18n: { label: "Back to top" }
    };
    const PaginationNext = {
      extends: ButtonComponent,
      i18n: { label: "Next page" },
      data: { role: null }
    };
    const PaginationPrevious = {
      extends: ButtonComponent,
      i18n: { label: "Previous page" },
      data: { role: null }
    };
    function normalizeIconName(icon) {
      const name = icon == null ? void 0 : icon.trim();
      return name && iconNamePattern.test(name) ? name : void 0;
    }
    function readIconProp(instance) {
      const icon = instance.$props.icon;
      return typeof icon === "string" ? icon : "";
    }
    function setDimensions(instance) {
      const ratio = positiveNumber(instance.ratio) || 1;
      css(instance.$el, "--drk-icon-ratio", ratio);
      const width = positiveNumber(instance.width);
      if (width) {
        css(instance.$el, "--drk-icon-width", `${width}px`);
      }
      const height = positiveNumber(instance.height);
      if (height) {
        css(instance.$el, "--drk-icon-height", `${height}px`);
      }
    }
    function hideDecorativeIcon(instance) {
      var _a;
      const role = (_a = attr(instance.$el, "role")) == null ? void 0 : _a.toLowerCase();
      const hasAccessibleName = hasAttr(instance.$el, "aria-label") || hasAttr(instance.$el, "aria-labelledby");
      if (!hasAccessibleName && role !== "status" && role !== "img" && !hasAttr(instance.$el, "aria-hidden")) {
        attr(instance.$el, "aria-hidden", "true");
        instance._iconAddedAriaHidden = true;
      }
    }
    function positiveNumber(value) {
      return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
    }

    var img = defineComponent()({
      args: "dataSrc",
      props: {
        dataSrc: String,
        sources: String,
        margin: String,
        target: String,
        loading: String
      },
      data: {
        dataSrc: "",
        sources: false,
        margin: "50%",
        target: false,
        loading: "lazy"
      },
      connected() {
        if (this.loading !== "lazy") {
          this.load();
        } else if (isImg(this.$el)) {
          this.$el.loading = "lazy";
          setSrcAttrs(this.$el);
        }
      },
      disconnected() {
        if (this.img) {
          this.img.onload = null;
        }
        delete this.img;
      },
      observe: intersection({
        handler(_entries, observer) {
          this.load();
          observer.disconnect();
        },
        options: ({ margin }) => ({ rootMargin: margin }),
        filter: ({ loading }) => loading === "lazy",
        target: ({ $el, $props }) => $props.target ? [$el, ...queryAll($props.target, $el)] : $el
      }),
      methods: {
        load() {
          if (this.img) {
            return this.img;
          }
          const image = isImg(this.$el) ? this.$el : getImageFromElement(this.$el, this.dataSrc, this.sources);
          removeAttr(image, "loading");
          setSrcAttrs(this.$el, image.currentSrc);
          return this.img = image;
        }
      }
    });
    function setSrcAttrs(el, src) {
      if (isImg(el)) {
        const parentNode = parent(el);
        const elements = isTag(parentNode, "picture") ? children(parentNode) : [el];
        elements.forEach((element) => setSourceProps(element, element));
      } else if (src) {
        const change = !includes(el.style.backgroundImage, src);
        if (change) {
          css(el, "backgroundImage", `url(${escape(src)})`);
          trigger(el, createEvent("load", false));
        }
      }
    }
    const srcProps = ["data-src", "data-srcset", "sizes"];
    function setSourceProps(sourceEl, targetEl) {
      for (const prop of srcProps) {
        const value = data(sourceEl, prop);
        if (value) {
          attr(targetEl, prop.replace(/data-/g, ""), value);
        }
      }
    }
    function getImageFromElement(el, src, sources) {
      const img = new Image();
      wrapInPicture(img, sources);
      setSourceProps(el, img);
      img.onload = () => setSrcAttrs(el, img.currentSrc);
      img.src = src;
      return img;
    }
    function wrapInPicture(img, sources) {
      const parsedSources = parseSources(sources);
      if (parsedSources.length) {
        const picture = document.createElement("picture");
        for (const attrs of parsedSources) {
          const source = document.createElement("source");
          attr(source, attrs);
          append(picture, source);
        }
        append(picture, img);
      }
    }
    function parseSources(sources) {
      if (!sources) {
        return [];
      }
      let parsedSources = sources;
      if (isString(sources)) {
        if (startsWith(sources, "[")) {
          try {
            const parsed = JSON.parse(sources);
            parsedSources = isSourceInput(parsed) ? parsed : [];
          } catch {
            parsedSources = [];
          }
        } else {
          parsedSources = parseOptions(sources);
        }
      }
      const sourceList = isArray(parsedSources) ? parsedSources : [parsedSources];
      return sourceList.filter(isSourceAttributes).filter((source) => !isEmpty(source));
    }
    function isSourceInput(value) {
      return isSourceAttributes(value) || isArray(value) && value.every(isSourceAttributes);
    }
    function isSourceAttributes(value) {
      return isObject(value) && Object.values(value).every(
        (attribute) => attribute === null || ["string", "number", "boolean"].includes(typeof attribute)
      );
    }
    function isImg(el) {
      return isTag(el, "img");
    }

    var inverse = defineComponent()({
      props: {
        target: String,
        selActive: String
      },
      data: {
        target: false,
        selActive: false
      },
      connected() {
        this.isIntersecting = 0;
      },
      computed: {
        target: ({ target }, $el) => target ? $$(target, $el) : $el
      },
      watch: {
        target: {
          handler() {
            queueMicrotask(() => this.$reset());
          },
          immediate: false
        }
      },
      observe: [
        intersection({
          handler(entries) {
            this.isIntersecting = entries.reduce(
              (sum, { isIntersecting }) => sum + (isIntersecting ? 1 : this.isIntersecting ? -1 : 0),
              this.isIntersecting
            );
            this.$emit();
          },
          target: ({ target }) => target,
          args: { intersecting: false }
        }),
        mutation({
          target: ({ target }) => target,
          options: { attributes: true, attributeFilter: ["class"] }
        }),
        {
          target: ({ target }) => target,
          observe: (target, handler) => {
            const targets = toNodes(target).filter(
              (node) => node instanceof Element
            );
            const observer = observeResize([...targets, document.documentElement], handler);
            const notify = () => handler();
            const observe = (element) => {
              if ("observe" in observer) {
                observer.observe(element);
              }
            };
            const unobserve = (element) => {
              if ("unobserve" in observer) {
                observer.unobserve(element);
              }
            };
            const listener = [
              on(document, "scroll itemshown itemhidden", notify, {
                passive: true,
                capture: true
              }),
              on(document, "show hide transitionstart", (e) => {
                handler();
                if (e.target instanceof Element) {
                  observe(e.target);
                }
              }),
              on(
                document,
                "shown hidden transitionend transitioncancel",
                (e) => {
                  handler();
                  if (e.target instanceof Element) {
                    unobserve(e.target);
                  }
                }
              )
            ];
            return {
              observe,
              unobserve,
              disconnect() {
                observer.disconnect();
                listener.map((off) => off());
              }
            };
          },
          handler() {
            this.$emit();
          }
        }
      ],
      update: {
        read() {
          if (!this.isIntersecting) {
            return false;
          }
          for (const target of toNodes(this.target)) {
            const color = !this.selActive || matches(target, this.selActive) ? findTargetColor(target) : "";
            if (color !== false) {
              replaceClass(target, "drk-light drk-dark", color);
            }
          }
        }
      }
    });
    function findTargetColor(target) {
      const dim = dimensions(target);
      const viewport = dimensions(window);
      if (!intersectRect(dim, viewport)) {
        return false;
      }
      const { left, top, height, width } = dim;
      let last = "";
      for (const percent of [0.25, 0.5, 0.75]) {
        const elements = target.ownerDocument.elementsFromPoint(
          Math.max(0, Math.min(left + width * percent, viewport.width - 1)),
          Math.max(0, Math.min(top + height / 2, viewport.height - 1))
        );
        for (const element of elements) {
          if (target.contains(element) || !checkVisibility(element) || element.closest('[class*="-leave"]') && elements.some((el) => element !== el && matches(el, '[class*="-enter"]'))) {
            continue;
          }
          const color = css(element, "--drk-inverse");
          if (color) {
            if (color === last) {
              return `drk-${color}`;
            }
            last = color;
            break;
          }
        }
      }
      return last ? `drk-${last}` : "";
    }
    function checkVisibility(element) {
      if (css(element, "visibility") !== "visible") {
        return false;
      }
      let current = element;
      while (current) {
        if (css(current, "opacity") === "0") {
          return false;
        }
        current = parent(current);
      }
      return true;
    }

    var leader = defineComponent()({
      mixins: [Class, Media],
      props: {
        fill: String
      },
      data: {
        fill: "",
        clsWrapper: "drk-leader-fill",
        clsHide: "drk-leader-hide",
        attrFill: "data-fill"
      },
      computed: {
        fill: ({ fill }, $el) => fill || css($el, "--drk-leader-fill-content")
      },
      connected() {
        const wrapper = wrapInner(this.$el, `<span class="${this.clsWrapper}">`)[0];
        if (wrapper instanceof HTMLElement) {
          this.wrapper = wrapper;
        }
      },
      disconnected() {
        if (this.wrapper) {
          this.wrapper.replaceWith(...this.wrapper.childNodes);
        }
      },
      observe: resize(),
      update: {
        read() {
          const width = Math.trunc(this.$el.offsetWidth / 2);
          return {
            width,
            fill: this.fill,
            hide: !this.matchMedia
          };
        },
        write({ width, fill, hide }) {
          if (!this.wrapper) {
            return;
          }
          toggleClass(this.wrapper, this.clsHide, hide);
          attr(this.wrapper, this.attrFill, new Array(width).join(fill));
        },
        events: ["resize"]
      }
    });

    function awaitFrame() {
      return new Promise((resolve) => requestAnimationFrame(resolve));
    }
    function awaitTimeout(timeout = 0) {
      return new Promise((resolve) => setTimeout(resolve, timeout));
    }

    const active = [];
    var Modal = defineMixin()({
      mixins: [Class, Container, Togglable],
      props: {
        selPanel: String,
        selClose: String,
        escClose: Boolean,
        bgClose: Boolean,
        stack: Boolean,
        role: String
      },
      data: {
        cls: "drk-open",
        escClose: true,
        bgClose: true,
        overlay: true,
        stack: false,
        role: "dialog"
      },
      computed: {
        panel: ({ selPanel }, $el) => $(selPanel, $el),
        transitionElement() {
          return this.panel;
        }
      },
      connected() {
        const el = this.panel || this.$el;
        el.role = this.role;
        if (this.overlay) {
          el.ariaModal = "true";
        }
      },
      beforeDisconnect() {
        if (includes(active, this)) {
          void this.toggleElement(this.$el, false, false);
        }
      },
      events: [
        {
          name: "click",
          delegate: ({ selClose }) => `${selClose},a[href*="#"]`,
          handler(e) {
            var _a;
            const { current, defaultPrevented } = e;
            const hash = current instanceof HTMLAnchorElement ? current.hash : "";
            if (!defaultPrevented && hash && isSameSiteAnchor(current) && !this.$el.contains((_a = $(hash)) != null ? _a : null)) {
              void this.hide();
            } else if (matches(current, this.selClose)) {
              maybeDefaultPreventClick(e);
              void this.hide();
            }
          }
        },
        {
          name: "toggle",
          self: true,
          handler(e, toggle) {
            if (e.defaultPrevented) {
              return;
            }
            e.preventDefault();
            this.target = (toggle == null ? void 0 : toggle.$el) instanceof HTMLElement ? toggle.$el : null;
            if (this.isToggled() === includes(active, this)) {
              void this.toggle();
            }
          }
        },
        {
          name: "beforeshow",
          self: true,
          handler(e) {
            if (includes(active, this)) {
              return false;
            }
            if (!this.stack && active.length) {
              void Promise.all(active.map((modal) => modal.hide())).then(() => this.show());
              e.preventDefault();
            } else {
              active.push(this);
            }
          }
        },
        {
          name: "show",
          self: true,
          handler() {
            if (this.stack) {
              css(this.$el, "zIndex", toFloat(css(this.$el, "zIndex")) + active.length);
            }
            const handlers = [
              this.overlay && preventBackgroundFocus(this),
              this.overlay && preventBackgroundScroll(this.$el),
              this.bgClose && listenForBackgroundClose(this),
              this.escClose && listenForEscClose(this)
            ];
            once(
              this.$el,
              "hidden",
              () => handlers.forEach((handler) => handler && handler()),
              { self: true }
            );
            addClass(document.documentElement, this.clsPage);
            setAriaExpanded(this.target, true);
          }
        },
        {
          name: "shown",
          self: true,
          handler() {
            if (!isFocusable(this.$el)) {
              this.$el.tabIndex = -1;
            }
            if (!matches(this.$el, ":focus-within")) {
              this.$el.focus();
            }
          }
        },
        {
          name: "hidden",
          self: true,
          handler() {
            if (includes(active, this)) {
              active.splice(active.indexOf(this), 1);
            }
            css(this.$el, "zIndex", "");
            const { target } = this;
            if (!active.some((modal) => modal.clsPage === this.clsPage)) {
              removeClass(document.documentElement, this.clsPage);
              queueMicrotask(() => {
                if (target && isFocusable(target)) {
                  target.focus({ preventScroll: true });
                }
              });
            }
            setAriaExpanded(target, false);
            this.target = null;
          }
        }
      ],
      methods: {
        toggle() {
          return this.isToggled() ? this.hide() : this.show();
        },
        async show() {
          if (this.container && parent(this.$el) !== this.container) {
            append(this.container, this.$el);
            await awaitFrame();
          }
          return this.toggleElement(
            this.$el,
            true,
            (element, show) => animate(element, show, this)
          );
        },
        hide() {
          return this.toggleElement(
            this.$el,
            false,
            (element, show) => animate(element, show, this)
          );
        }
      }
    });
    const rejectors = /* @__PURE__ */ new WeakMap();
    function animate(el, show, { transitionElement, _toggle }) {
      return new Promise(
        (resolve, reject) => once(el, "show hide", () => {
          var _a;
          (_a = rejectors.get(el)) == null ? void 0 : _a();
          rejectors.set(el, reject);
          _toggle(el, show);
          const off = once(
            transitionElement,
            "transitionstart",
            () => {
              once(transitionElement, "transitionend transitioncancel", () => resolve(), {
                self: true
              });
              clearTimeout(timer);
            },
            { self: true }
          );
          const timer = setTimeout(
            () => {
              off();
              resolve();
            },
            toMs(css(transitionElement, "transitionDuration"))
          );
        })
      ).then(() => {
        rejectors.delete(el);
      });
    }
    function toMs(time) {
      return time ? endsWith(time, "ms") ? toFloat(time) : toFloat(time) * 1e3 : 0;
    }
    function preventBackgroundFocus(modal) {
      return on(document, "focusin", (e) => {
        if (!(e.target instanceof Element) || last(active) !== modal || modal.$el.contains(e.target)) {
          return;
        }
        const { left, top, width, height } = dimensions(e.target);
        const topEl = document.elementFromPoint(left + width / 2, top + height / 2);
        if (topEl && (e.target.contains(topEl) || topEl.contains(e.target))) {
          return;
        }
        modal.$el.focus();
      });
    }
    function listenForBackgroundClose(modal) {
      return on(document, pointerDown, ({ target }) => {
        if (!(target instanceof Element)) {
          return;
        }
        if (last(active) !== modal || modal.overlay && !modal.$el.contains(target) || !modal.panel || modal.panel.contains(target)) {
          return;
        }
        once(
          document,
          `${pointerUp} ${pointerCancel} scroll`,
          ({ defaultPrevented, type, target: newTarget }) => {
            if (!defaultPrevented && type === pointerUp && target === newTarget) {
              void modal.hide();
            }
          },
          true
        );
      });
    }
    function listenForEscClose(modal) {
      return on(document, "keydown", (e) => {
        if (e.keyCode === 27 && last(active) === modal) {
          void modal.hide();
        }
      });
    }
    function setAriaExpanded(el, toggled) {
      if (el == null ? void 0 : el.ariaExpanded) {
        el.ariaExpanded = String(toggled);
      }
    }

    var modal = defineComponent()({
      install,
      mixins: [Modal],
      data: {
        clsPage: "drk-modal-page",
        selPanel: ".drk-modal-dialog",
        selClose: '[class*="drk-modal-close"]'
      },
      events: [
        {
          name: "fullscreenchange webkitendfullscreen",
          capture: true,
          handler(e) {
            if (isTag(e.target, "video") && this.isToggled() && !document.fullscreenElement) {
              this.hide();
            }
          }
        },
        {
          name: "show",
          self: true,
          handler() {
            if (hasClass(this.panel, "drk-margin-auto-vertical")) {
              addClass(this.$el, "drk-flex");
            } else {
              css(this.$el, "display", "block");
            }
            height(this.$el);
          }
        },
        {
          name: "hidden",
          self: true,
          handler() {
            css(this.$el, "display", "");
            removeClass(this.$el, "drk-flex");
          }
        }
      ]
    });
    function install({ modal }) {
      modal.dialog = function(content, options) {
        const dialog = modal($(`<div><div class="drk-modal-dialog">${content}</div></div>`), {
          stack: true,
          role: "alertdialog",
          ...options
        });
        dialog.show();
        on(
          dialog.$el,
          "hidden",
          async () => {
            await Promise.resolve();
            dialog.$destroy(true);
          },
          { self: true }
        );
        return dialog;
      };
      modal.alert = function(message, options) {
        return openDialog(
          ({ i18n }) => `<div class="drk-modal-body">${isString(message) ? message : html(message)}</div>  <div class="drk-modal-footer drk-text-right">  <button class="drk-button drk-button-primary drk-modal-close" type="button" autofocus>${i18n.ok}</button>  </div>`,
          options
        );
      };
      modal.confirm = function(message, options) {
        return openDialog(
          ({ i18n }) => `<form>  <div class="drk-modal-body">${isString(message) ? message : html(message)}</div>  <div class="drk-modal-footer drk-text-right">  <button class="drk-button drk-button-default drk-modal-close" type="button">${i18n.cancel}</button>  <button class="drk-button drk-button-primary" autofocus>${i18n.ok}</button>  </div>  </form>`,
          options,
          () => Promise.reject()
        );
      };
      modal.prompt = function(message, value, options) {
        const promise = openDialog(
          ({ i18n }) => `<form class="drk-form-stacked">  <div class="drk-modal-body">  <label>${isString(message) ? message : html(message)}</label>  <input class="drk-input" autofocus>  </div>  <div class="drk-modal-footer drk-text-right">  <button class="drk-button drk-button-default drk-modal-close" type="button">${i18n.cancel}</button>  <button class="drk-button drk-button-primary">${i18n.ok}</button>  </div>  </form>`,
          options,
          () => null,
          (dialog) => {
            const promptInput = $("input", dialog.$el);
            if (!promptInput) {
              throw new Error("Modal prompt input is missing.");
            }
            return promptInput.value;
          }
        );
        const { $el } = promise.dialog;
        const inputElement = $("input", $el);
        if (!inputElement) {
          throw new Error("Modal prompt input is missing.");
        }
        const input = inputElement;
        input.value = value || "";
        on($el, "show", () => input.select());
        return promise;
      };
      modal.i18n = {
        ok: "Ok",
        cancel: "Cancel"
      };
      function openDialog(tmpl, options, hideFn = noop, submitFn = noop) {
        const resolvedOptions = {
          bgClose: false,
          escClose: true,
          ...options,
          i18n: { ...modal.i18n, ...options == null ? void 0 : options.i18n }
        };
        const dialog = modal.dialog(tmpl(resolvedOptions), resolvedOptions);
        return assign(
          new Promise((resolve) => {
            const off = on(dialog.$el, "hide", () => resolve(hideFn()));
            on(dialog.$el, "submit", "form", (e) => {
              e.preventDefault();
              resolve(submitFn(dialog));
              off();
              dialog.hide();
            });
          }),
          { dialog }
        );
      }
    }

    var nav = defineComponent()({
      extends: Accordion,
      data: {
        targets: "> .drk-parent",
        toggle: "> a",
        content: "> ul"
      }
    });

    const clsNavbarTransparent = "drk-navbar-transparent";
    var navbar = defineComponent()({
      extends: Dropnav,
      props: {
        dropbarTransparentMode: Boolean
      },
      data: {
        flip: false,
        autoUpdate: false,
        delayShow: 200,
        clsDrop: "drk-navbar-dropdown",
        selNavItem: ".drk-navbar-nav > li > a,a.drk-navbar-item,button.drk-navbar-item,.drk-navbar-item a,.drk-navbar-item button,.drk-navbar-toggle",
        // Simplify with :where() selector once browser target is Safari 14+
        dropbarTransparentMode: false
      },
      computed: {
        navbarContainer: (_props, $el) => $el.closest(".drk-navbar-container")
      },
      watch: {
        items() {
          const justify = hasClass(this.$el, "drk-navbar-justify");
          const containers = $$(".drk-navbar-nav, .drk-navbar-left, .drk-navbar-right", this.$el);
          for (const container of containers) {
            const items = justify ? $$(
              ".drk-navbar-nav > li > a, .drk-navbar-item, .drk-navbar-toggle",
              container
            ).length : "";
            css(container, "flexGrow", items);
          }
        }
      },
      events: [
        {
          name: "show",
          el: ({ dropContainer }) => dropContainer,
          handler({ target }) {
            if (target && this.getTransparentMode(target) === "remove" && hasClass(this.navbarContainer, clsNavbarTransparent)) {
              removeClass(this.navbarContainer, clsNavbarTransparent);
              this._transparent = true;
            }
          }
        },
        {
          name: "hide",
          el: ({ dropContainer }) => dropContainer,
          async handler() {
            await awaitTimeout(0);
            if (this._transparent && (!active$1 || !this.dropContainer.contains(active$1.$el))) {
              addClass(this.navbarContainer, clsNavbarTransparent);
              this._transparent = null;
            }
          }
        }
      ],
      methods: {
        getTransparentMode(el) {
          if (!this.navbarContainer) {
            return;
          }
          if (this.dropbar && this.isDropbarDrop(el)) {
            return this.dropbarTransparentMode;
          }
          const drop = this.getDropdown(el);
          if (drop && hasClass(el, "drk-dropbar")) {
            return drop.inset ? "behind" : "remove";
          }
        },
        getDropbarOffset(offsetTop) {
          const { top, height } = offset(this.navbarContainer);
          return top + (this.dropbarTransparentMode === "behind" ? 0 : height + offsetTop);
        }
      }
    });

    var offcanvas = defineComponent()({
      mixins: [Modal],
      args: "mode",
      props: {
        mode: String,
        flip: Boolean,
        overlay: Boolean,
        swiping: Boolean
      },
      data: {
        mode: "slide",
        flip: false,
        overlay: false,
        clsPage: "drk-offcanvas-page",
        clsContainer: "drk-offcanvas-container",
        selPanel: ".drk-offcanvas-bar",
        clsFlip: "drk-offcanvas-flip",
        clsContainerAnimation: "drk-offcanvas-container-animation",
        clsSidebarAnimation: "drk-offcanvas-bar-animation",
        clsMode: "drk-offcanvas",
        clsOverlay: "drk-offcanvas-overlay",
        selClose: ".drk-offcanvas-close",
        container: false,
        swiping: true
      },
      computed: {
        clsFlip: ({ flip, clsFlip }) => flip ? clsFlip : "",
        clsOverlay: ({ overlay, clsOverlay }) => overlay ? clsOverlay : "",
        clsMode: ({ mode, clsMode }) => `${clsMode}-${mode}`,
        clsSidebarAnimation: ({ mode, clsSidebarAnimation }) => mode === "none" || mode === "reveal" ? "" : clsSidebarAnimation,
        clsContainerAnimation: ({ mode, clsContainerAnimation }) => mode !== "push" && mode !== "reveal" ? "" : clsContainerAnimation,
        transitionElement({ mode }) {
          return mode === "reveal" ? parent(this.panel) : this.panel;
        }
      },
      observe: swipe({ filter: ({ swiping }) => swiping }),
      update: {
        read() {
          if (this.isToggled() && !isVisible(this.$el)) {
            this.hide();
          }
        },
        events: ["resize"]
      },
      events: [
        {
          name: "touchmove",
          self: true,
          passive: false,
          filter: ({ overlay }) => overlay,
          handler(e) {
            if (e.cancelable) {
              e.preventDefault();
            }
          }
        },
        {
          name: "show",
          self: true,
          handler() {
            if (this.mode === "reveal" && !hasClass(parent(this.panel), this.clsMode)) {
              addClass(wrapAll(this.panel, "<div>"), this.clsMode);
            }
            const { body, scrollingElement } = document;
            addClass(body, this.clsContainer, this.clsFlip);
            css(body, "touchAction", "pan-y pinch-zoom");
            css(this.$el, "display", "block");
            css(
              this.panel,
              "maxWidth",
              (scrollingElement != null ? scrollingElement : document.documentElement).clientWidth
            );
            addClass(this.$el, this.clsOverlay);
            addClass(
              this.panel,
              this.clsSidebarAnimation,
              this.mode === "reveal" ? "" : this.clsMode
            );
            height(body);
            addClass(body, this.clsContainerAnimation);
            if (this.clsContainerAnimation) {
              suppressUserScale();
            }
          }
        },
        {
          name: "hide",
          self: true,
          handler() {
            removeClass(document.body, this.clsContainerAnimation);
            css(document.body, "touchAction", "");
          }
        },
        {
          name: "hidden",
          self: true,
          handler() {
            if (this.clsContainerAnimation) {
              resumeUserScale();
            }
            if (this.mode === "reveal" && hasClass(parent(this.panel), this.clsMode)) {
              unwrap(this.panel);
            }
            removeClass(this.panel, this.clsSidebarAnimation, this.clsMode);
            removeClass(this.$el, this.clsOverlay);
            css(this.$el, "display", "");
            css(this.panel, "maxWidth", "");
            removeClass(document.body, this.clsContainer, this.clsFlip);
          }
        },
        {
          name: "swipeLeft swipeRight",
          handler(e) {
            if (this.isToggled() && endsWith(e.type, "Left") !== this.flip) {
              this.hide();
            }
          }
        }
      ]
    });
    function suppressUserScale() {
      getViewport().content += ",user-scalable=0";
    }
    function resumeUserScale() {
      const viewport = getViewport();
      viewport.content = viewport.content.replace(/,user-scalable=0$/, "");
    }
    function getViewport() {
      const existing = $('meta[name="viewport"]', document.head);
      if (existing) {
        return existing;
      }
      const viewport = document.createElement("meta");
      viewport.name = "viewport";
      document.head.append(viewport);
      return viewport;
    }

    var overflowAuto = defineComponent()({
      mixins: [Class],
      props: {
        selContainer: String,
        selContent: String,
        minHeight: Number
      },
      data: {
        selContainer: ".drk-modal",
        selContent: ".drk-modal-dialog",
        minHeight: 150
      },
      computed: {
        container: ({ selContainer }, $el) => {
          var _a;
          return (_a = $el.closest(selContainer)) != null ? _a : void 0;
        },
        content: ({ selContent }, $el) => {
          var _a;
          return (_a = $el.closest(selContent)) != null ? _a : void 0;
        }
      },
      observe: resize({
        target: ({ container, content }) => [container, content].filter((element) => Boolean(element))
      }),
      update: {
        read() {
          if (!this.content || !this.container || !isVisible(this.$el)) {
            return false;
          }
          return {
            max: Math.max(
              this.minHeight,
              height(this.container) - (dimensions(this.content).height - height(this.$el))
            )
          };
        },
        write({ max }) {
          css(this.$el, { minHeight: this.minHeight, maxHeight: max });
        },
        events: ["resize"]
      }
    });

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

    var responsive = defineComponent()({
      props: ["width", "height"],
      connected() {
        addClass(this.$el, "drk-responsive-width");
        css(this.$el, "aspectRatio", `${this.width}/${this.height}`);
      }
    });

    var scroll = defineComponent()({
      props: {
        offset: Number
      },
      data: {
        offset: 0
      },
      connected() {
        registerClick(this);
      },
      disconnected() {
        unregisterClick(this);
      },
      methods: {
        async scrollTo(el) {
          el = el && $(el) || document.body;
          if (trigger(this.$el, "beforescroll", [this, el])) {
            await scrollIntoView(el, { offset: this.offset });
            trigger(this.$el, "scrolled", [this, el]);
          }
        }
      }
    });
    const instances = /* @__PURE__ */ new Set();
    function registerClick(cmp) {
      if (!instances.size) {
        on(document, "click", clickHandler);
      }
      instances.add(cmp);
    }
    function unregisterClick(cmp) {
      instances.delete(cmp);
      if (!instances.size) {
        off(document, "click", clickHandler);
      }
    }
    function clickHandler(e) {
      if (e.defaultPrevented) {
        return;
      }
      for (const instance of instances) {
        if (e.target instanceof Node && instance.$el.contains(e.target) && isSameSiteAnchor(instance.$el)) {
          e.preventDefault();
          if (window.location.href !== instance.$el.href) {
            window.history.pushState({}, "", instance.$el.href);
          }
          instance.scrollTo(getTargetedElement(instance.$el));
        }
      }
    }

    const clsInView = "drk-scrollspy-inview";
    var scrollspy = defineComponent()({
      args: "cls",
      props: {
        cls: String,
        target: String,
        hidden: Boolean,
        margin: String,
        repeat: Boolean,
        delay: Number
      },
      data: () => ({
        cls: "",
        target: false,
        hidden: true,
        margin: "-1px",
        repeat: false,
        delay: 0
      }),
      computed: {
        elements: ({ target }, $el) => target ? $$(target, $el) : [$el]
      },
      watch: {
        elements(elements) {
          if (this.hidden) {
            css(filter(elements, `:not(.${clsInView})`), "opacity", 0);
          }
        }
      },
      connected() {
        this.elementData = /* @__PURE__ */ new Map();
      },
      disconnected() {
        var _a, _b;
        for (const [el, state] of (_b = (_a = this.elementData) == null ? void 0 : _a.entries()) != null ? _b : []) {
          removeClass(el, clsInView, state.cls || "");
        }
        delete this.elementData;
      },
      observe: intersection({
        target: ({ elements }) => elements,
        handler(records) {
          const elements = this.elementData;
          if (!elements) {
            return;
          }
          for (const { target: el, isIntersecting } of records) {
            if (!elements.has(el)) {
              elements.set(el, {
                cls: data(el, "drk-scrollspy-class") || this.cls
              });
            }
            const state = elements.get(el);
            if (!state || !this.repeat && state.show) {
              continue;
            }
            state.show = isIntersecting;
          }
          this.$emit();
        },
        options: ({ margin }) => ({ rootMargin: margin }),
        args: { intersecting: false }
      }),
      update: [
        {
          write(data) {
            var _a, _b;
            for (const [el, state] of (_b = (_a = this.elementData) == null ? void 0 : _a.entries()) != null ? _b : []) {
              if (state.show && !state.inview && !state.queued) {
                state.queued = true;
                data.promise = (data.promise || Promise.resolve()).then(async () => {
                  await awaitTimeout(state.show ? this.delay : 0);
                  this.toggle(el, true);
                  setTimeout(() => {
                    state.queued = false;
                    this.$emit();
                  }, 300);
                });
              } else if (!state.show && state.inview && !state.queued && this.repeat) {
                this.toggle(el, false);
              }
            }
          }
        }
      ],
      methods: {
        toggle(el, inview) {
          var _a, _b;
          const state = (_a = this.elementData) == null ? void 0 : _a.get(el);
          if (!state) {
            return;
          }
          (_b = state.off) == null ? void 0 : _b.call(state);
          css(el, "opacity", !inview && this.hidden ? 0 : "");
          toggleClass(el, clsInView, inview);
          toggleClass(el, state.cls);
          const animationClasses = state.cls.match(/\bdrk-animation-[\w-]+/g);
          if (animationClasses) {
            const removeAnimationClasses = () => removeClass(el, animationClasses);
            if (inview) {
              state.off = once(el, "animationcancel animationend", removeAnimationClasses, {
                self: true
              });
            } else {
              removeAnimationClasses();
            }
          }
          trigger(el, inview ? "inview" : "outview");
          state.inview = inview;
        }
      }
    });

    var scrollspyNav = defineComponent()({
      props: {
        cls: String,
        closest: Boolean,
        scroll: Boolean,
        target: String,
        offset: Number
      },
      data: {
        cls: "drk-active",
        closest: false,
        scroll: false,
        target: 'a[href]:not([role="button"])',
        offset: 0
      },
      computed: {
        links: {
          get({ target }, $el) {
            return $$(target, $el).filter(
              (link) => Boolean(getTargetedElement(link))
            );
          },
          observe: () => "*"
        },
        targets() {
          return this.links.map((el) => getTargetedElement(el)).filter((target) => Boolean(target));
        },
        elements({ closest }) {
          return this.links.map((el) => el.closest(String(closest || "*")));
        }
      },
      watch: {
        links(links) {
          if (this.scroll) {
            this.$create("scroll", links, { offset: this.offset });
          }
        }
      },
      observe: [intersection(), scroll$1()],
      update: [
        {
          read() {
            const { targets } = this;
            const { length } = targets;
            if (!length || !isVisible(this.$el)) {
              return false;
            }
            const scrollElement = scrollParent(targets, true);
            const { scrollTop, scrollHeight } = scrollElement;
            const viewport = offsetViewport(scrollElement);
            const max = scrollHeight - viewport.height;
            let active = false;
            if (scrollTop >= max) {
              active = length - 1;
            } else {
              const offsetBy = this.offset + dimensions(getCoveringElement()).height + viewport.height * 0.1;
              for (let i = 0; i < targets.length; i++) {
                const target = targets[i];
                if (!target || offset(target).top - viewport.top - offsetBy > 0) {
                  break;
                }
                active = +i;
              }
            }
            return { active };
          },
          write({ active }) {
            const { elements } = this;
            const changed = active !== false && !hasClass(elements[active], this.cls);
            this.links.forEach((el) => el.blur());
            for (let i = 0; i < elements.length; i++) {
              toggleClass(elements[i], this.cls, +i === active);
            }
            if (changed) {
              trigger(this.$el, "active", [active, elements[active]]);
            }
          },
          events: ["scroll", "resize"]
        }
      ]
    });

    var sticky = defineComponent()({
      mixins: [Class, Media],
      props: {
        position: String,
        top: null,
        bottom: null,
        start: null,
        end: null,
        offset: String,
        offsetEnd: String,
        overflowFlip: Boolean,
        animation: String,
        clsActive: String,
        clsInactive: String,
        clsFixed: String,
        clsBelow: String,
        selTarget: String,
        showOnUp: Boolean,
        targetOffset: Number
      },
      data: {
        position: "top",
        top: false,
        bottom: false,
        start: false,
        end: false,
        offset: 0,
        offsetEnd: 0,
        overflowFlip: false,
        animation: "",
        clsActive: "drk-active",
        clsInactive: "",
        clsFixed: "drk-sticky-fixed",
        clsBelow: "drk-sticky-below",
        selTarget: "",
        showOnUp: false,
        targetOffset: false
      },
      computed: {
        target: ({ selTarget }, $el) => selTarget && $(selTarget, $el) || $el
      },
      connected() {
        this.start = coerce(this.start || this.top);
        this.end = coerce(this.end || this.bottom);
        this.placeholder = $("+ .drk-sticky-placeholder", this.$el) || createPlaceholder();
        this.isFixed = false;
        this.setActive(false);
      },
      beforeDisconnect() {
        if (this.isFixed) {
          this.hide();
          removeClass(this.target, this.clsInactive);
        }
        reset(this.$el);
        remove$1(this.placeholder);
        this.placeholder = null;
      },
      observe: [
        viewport(),
        scroll$1({ target: () => getScrollingElement() }),
        resize({
          target: ({ $el }) => {
            const visibleParent = getVisibleParent($el);
            return visibleParent ? [$el, visibleParent, getScrollingElement()] : [$el, getScrollingElement()];
          },
          handler(entries) {
            this.$emit(
              this._data.resized && entries.some(({ target }) => target === getVisibleParent(this.$el)) ? "update" : "resize"
            );
            this._data.resized = true;
          }
        })
      ],
      events: [
        {
          name: "load hashchange popstate",
          el: () => window,
          filter: ({ targetOffset }) => targetOffset !== false,
          async handler() {
            var _a;
            const scrollingElement = getScrollingElement();
            if (!location.hash || scrollingElement.scrollTop === 0) {
              return;
            }
            await awaitTimeout();
            const targetOffset = offset($(location.hash));
            const elOffset = offset(this.$el);
            if (this.isFixed && intersectRect(targetOffset, elOffset)) {
              const referenceElement = (_a = this.placeholder) != null ? _a : this.$el;
              scrollingElement.scrollTop = Math.ceil(
                targetOffset.top - elOffset.height - toPx(this.targetOffset, "height", referenceElement) - toPx(this.offset, "height", referenceElement)
              );
            }
          }
        }
      ],
      update: [
        {
          read({ height: height$1, width, margin, sticky }, types) {
            this.inactive = !this.matchMedia || !isVisible(this.$el) || !this.$el.offsetHeight;
            if (this.inactive) {
              return;
            }
            const dynamicViewport = height(window);
            const maxScrollHeight = Math.max(
              0,
              getScrollingElement().scrollHeight - dynamicViewport
            );
            if (!maxScrollHeight) {
              this.inactive = true;
              return;
            }
            const hide = this.isFixed && types.has("update");
            if (hide) {
              preventTransition(this.target);
              this.hide();
            }
            if (!this.active) {
              ({ height: height$1, width } = dimensions(this.$el));
              margin = css(this.$el, "margin");
            }
            if (hide) {
              this.show();
            }
            const viewport2 = toPx("100vh", "height");
            let position = this.position;
            if (this.overflowFlip && height$1 > viewport2) {
              position = position === "top" ? "bottom" : "top";
            }
            const referenceElement = (this.isFixed ? this.placeholder : this.$el) || this.$el;
            const [initialOffset = 0, offsetEnd = 0] = [this.offset, this.offsetEnd].map(
              (value) => toPx(value, "height", sticky ? this.$el : referenceElement)
            );
            let offset$1 = initialOffset;
            if (position === "bottom" && (height$1 < dynamicViewport || this.overflowFlip)) {
              offset$1 += dynamicViewport - height$1;
            }
            const elementBox = height$1 + offset$1 + offsetEnd;
            const overflow = this.overflowFlip ? 0 : Math.max(0, elementBox - viewport2);
            const topOffset = offset(referenceElement).top - // offset possible `transform: translateY` animation 'drk-animation-slide-top' while hiding
            new DOMMatrix(css(referenceElement, "transform")).m42;
            const elHeight = dimensions(this.$el).height;
            const start = (this.start === false ? topOffset : parseProp(this.start, this.$el, topOffset)) - offset$1;
            const end = this.end === false ? maxScrollHeight : Math.min(
              maxScrollHeight,
              parseProp(this.end, this.$el, topOffset + height$1, true) - elHeight - offset$1 + overflow
            );
            sticky = !this.showOnUp && start + offset$1 === topOffset && end === Math.min(
              maxScrollHeight,
              parseProp(true, this.$el, 0, true) - elHeight - offset$1 + overflow
            ) && css(getVisibleParent(this.$el), "overflowY") !== "hidden";
            return {
              start,
              end,
              offset: offset$1,
              overflow,
              height: height$1,
              elHeight,
              width,
              margin,
              top: offsetPosition(referenceElement)[0],
              sticky,
              viewport: viewport2,
              maxScrollHeight
            };
          },
          write({ height, width, margin, offset, sticky }) {
            if (this.inactive || sticky || !this.isFixed) {
              reset(this.$el);
            }
            if (this.inactive) {
              return;
            }
            if (sticky) {
              height = width = margin = 0;
              css(this.$el, { position: "sticky", top: offset });
            }
            const { placeholder } = this;
            if (!placeholder) {
              return;
            }
            css(placeholder, { height, width, margin });
            if (parent(placeholder) !== parent(this.$el) || sticky !== index(placeholder) < index(this.$el)) {
              (sticky ? before : after)(this.$el, placeholder);
              placeholder.hidden = true;
            }
          },
          events: ["resize"]
        },
        {
          read({
            scroll: prevScroll = 0,
            dir: prevDir = "down",
            overflow,
            overflowScroll = 0,
            start,
            end,
            elHeight,
            height,
            sticky,
            maxScrollHeight
          }) {
            const scroll2 = Math.min(getScrollingElement().scrollTop, maxScrollHeight);
            const dir = prevScroll <= scroll2 ? "down" : "up";
            const referenceElement = (this.isFixed ? this.placeholder : this.$el) || this.$el;
            return {
              dir,
              prevDir,
              scroll: scroll2,
              prevScroll,
              below: scroll2 > offset(referenceElement).top + (sticky ? Math.min(height, elHeight) : height),
              offsetParentTop: offset(referenceElement.offsetParent).top,
              overflowScroll: clamp(
                overflowScroll + clamp(scroll2, start, end) - clamp(prevScroll, start, end),
                0,
                overflow
              )
            };
          },
          write(data, types) {
            const isScrollUpdate = types.has("scroll");
            const {
              initTimestamp = 0,
              dir,
              prevDir,
              scroll: scroll2,
              prevScroll = 0,
              top,
              start,
              below
            } = data;
            if (scroll2 < 0 || scroll2 === prevScroll && isScrollUpdate || this.showOnUp && !isScrollUpdate && !this.isFixed) {
              return;
            }
            const now = Date.now();
            if (now - initTimestamp > 300 || dir !== prevDir) {
              data.initScroll = scroll2;
              data.initTimestamp = now;
            }
            if (this.showOnUp && !this.isFixed && Math.abs(data.initScroll - scroll2) <= 30 && Math.abs(prevScroll - scroll2) <= 10) {
              return;
            }
            if (this.inactive || scroll2 < start || this.showOnUp && (scroll2 <= start || dir === "down" && isScrollUpdate || dir === "up" && !this.isFixed && !below)) {
              if (!this.isFixed) {
                if (Animation.inProgress(this.$el) && top > scroll2) {
                  Animation.cancel(this.$el);
                  this.hide();
                }
                return;
              }
              if (this.animation && below) {
                if (hasClass(this.$el, "drk-animation-leave")) {
                  return;
                }
                Animation.out(this.$el, this.animation).then(() => this.hide(), noop);
              } else {
                this.hide();
              }
            } else if (this.isFixed) {
              this.update();
            } else if (this.animation && below) {
              this.show();
              Animation.in(this.$el, this.animation).catch(noop);
            } else {
              preventTransition(this.target);
              this.show();
            }
          },
          events: ["resize", "resizeViewport", "scroll"]
        }
      ],
      methods: {
        show() {
          this.isFixed = true;
          this.update();
          if (this.placeholder) {
            this.placeholder.hidden = false;
          }
        },
        hide() {
          const { offset, sticky } = this._data;
          this.setActive(false);
          removeClass(this.$el, this.clsFixed, this.clsBelow);
          if (sticky) {
            css(this.$el, "top", offset);
          } else {
            reset(this.$el);
          }
          if (this.placeholder) {
            this.placeholder.hidden = true;
          }
          this.isFixed = false;
        },
        update() {
          const {
            width,
            scroll: scroll2 = 0,
            overflow,
            overflowScroll = 0,
            start,
            end,
            offset: initialOffset,
            offsetParentTop,
            sticky,
            below
          } = this._data;
          let offset = initialOffset;
          const active = start !== 0 || scroll2 > start;
          if (!sticky) {
            let position = "fixed";
            if (scroll2 > end) {
              offset += end - offsetParentTop + overflowScroll - overflow;
              position = "absolute";
            }
            css(this.$el, { position, width, marginTop: 0 }, "important");
          }
          css(this.$el, "top", offset - overflowScroll);
          this.setActive(active);
          toggleClass(this.$el, this.clsBelow, below);
          addClass(this.$el, this.clsFixed);
        },
        setActive(active) {
          const prev = this.active;
          this.active = active;
          if (active) {
            replaceClass(this.target, this.clsInactive, this.clsActive);
            if (prev !== active) {
              trigger(this.$el, "active");
            }
          } else {
            replaceClass(this.target, this.clsActive, this.clsInactive);
            if (prev !== active) {
              preventTransition(this.target);
              trigger(this.$el, "inactive");
            }
          }
        }
      }
    });
    function parseProp(value, el, propOffset, padding = false) {
      if (!value) {
        return 0;
      }
      if (isNumeric(value) || isString(value) && value.match(/^-?\d/)) {
        return propOffset + toPx(value, "height", el, true);
      } else {
        const refElement = value === true ? getVisibleParent(el) : query(value, el);
        return offset(refElement).bottom - (padding && (refElement == null ? void 0 : refElement.contains(el)) ? toFloat(css(refElement, "paddingBottom")) + toFloat(css(refElement, "borderBottomWidth")) : 0);
      }
    }
    function coerce(value) {
      if (value === "true") {
        return true;
      } else if (value === "false") {
        return false;
      }
      return value;
    }
    function reset(el) {
      css(el, { position: "", top: "", marginTop: "", width: "" });
    }
    const clsTransitionDisable = "drk-transition-disable";
    async function preventTransition(element) {
      if (!hasClass(element, clsTransitionDisable)) {
        addClass(element, clsTransitionDisable);
        await awaitFrame();
        removeClass(element, clsTransitionDisable);
      }
    }
    function getVisibleParent(element) {
      let current = parent(element);
      while (current) {
        if (isVisible(current)) {
          return current;
        }
        current = parent(current);
      }
    }
    function getScrollingElement() {
      return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : document.documentElement;
    }
    function createPlaceholder() {
      const placeholder = document.createElement("div");
      placeholder.className = "drk-sticky-placeholder";
      return placeholder;
    }

    var Svg = defineMixin()({
      args: "src",
      props: {
        width: Number,
        height: Number,
        ratio: Number
      },
      data: {
        ratio: 1
      },
      connected() {
        this.svg = this.getSvg().then(
          (el) => {
            if (!this._connected || !el) {
              return;
            }
            const svg = insertSVG(el, this.$el);
            if (this.svgEl && svg !== this.svgEl) {
              remove$1(this.svgEl);
            }
            applyWidthAndHeight.call(this, svg, el);
            return this.svgEl = svg;
          },
          () => void 0
        );
      },
      disconnected() {
        var _a;
        (_a = this.svg) == null ? void 0 : _a.then((svg) => {
          if (this._connected) {
            return;
          }
          if (isVoidElement(this.$el)) {
            this.$el.hidden = false;
          }
          remove$1(svg);
          this.svgEl = null;
        });
        this.svg = null;
      },
      methods: {
        async getSvg() {
          return void 0;
        }
      }
    });
    function insertSVG(el, root) {
      if (isVoidElement(root) || isTag(root, "canvas")) {
        root.hidden = true;
        const next = root.nextElementSibling;
        if (equals(el, next) && next) {
          return next;
        }
        after(root, el);
        return el;
      }
      const last = root.lastElementChild;
      if (equals(el, last) && last) {
        return last;
      }
      append(root, el);
      return el;
    }
    function equals(el, other) {
      return isTag(el, "svg") && isTag(other, "svg") && el.innerHTML === (other == null ? void 0 : other.innerHTML);
    }
    function applyWidthAndHeight(el, ref) {
      const props = ["width", "height"];
      let dimensions = [this.width, this.height];
      if (!dimensions.some((val) => val)) {
        dimensions = props.map((prop) => attr(ref, prop));
      }
      const viewBox = attr(ref, "viewBox");
      if (viewBox && !dimensions.some((val) => val)) {
        dimensions = viewBox.split(" ").slice(2);
      }
      dimensions.forEach((val, i) => {
        const prop = props[i];
        if (prop) {
          attr(el, prop, toFloat(val) * this.ratio || null);
        }
      });
    }
    function parseSVG(svg, icon) {
      if (icon && includes(svg, "<symbol")) {
        svg = parseSymbols(svg)[icon] || svg;
      }
      return toNodes(fragment(svg)).filter(isElement)[0];
    }
    const symbolRe = /<symbol([^]*?id=(['"])(.+?)\2[^]*?<\/)symbol>/g;
    const parseSymbols = memoize(function(svg) {
      const symbols = {};
      let match;
      while (match = symbolRe.exec(svg)) {
        const id = match[3];
        const content = match[1];
        if (id && content) {
          symbols[id] = `<svg ${content}svg>`;
        }
      }
      return symbols;
    });

    function getMaxPathLength(element) {
      return isVisible(element) ? Math.ceil(
        Math.max(
          0,
          ...$$(
            "[stroke]",
            element instanceof Element ? element : void 0
          ).map((stroke) => stroke.getTotalLength())
        )
      ) : 0;
    }

    var svg = defineComponent()({
      mixins: [Svg],
      args: "src",
      props: {
        src: String,
        icon: String,
        attributes: "list",
        strokeAnimation: Boolean
      },
      data: {
        strokeAnimation: false
      },
      observe: [
        mutation({
          async handler() {
            const svg = await this.svg;
            if (svg) {
              applyAttributes.call(this, svg);
            }
          },
          options: {
            attributes: true,
            attributeFilter: ["id", "class", "style"]
          }
        })
      ],
      async connected() {
        if (includes(this.src, "#")) {
          const [src = "", icon] = this.src.split("#", 2);
          this.src = src;
          this.icon = icon;
        }
        const svg = await this.svg;
        if (svg) {
          applyAttributes.call(this, svg);
          if (this.strokeAnimation) {
            applyAnimation(svg);
          }
        }
      },
      methods: {
        async getSvg() {
          if (isLazyImage(this.$el) && !this.$el.complete) {
            await new Promise((resolve) => once(this.$el, "load", () => resolve()));
          }
          return parseSVG(await loadSVG(this.src), this.icon) || Promise.reject("SVG not found.");
        }
      }
    });
    function applyAttributes(el) {
      const { $el } = this;
      addClass(el, attr($el, "class"), "drk-svg");
      for (let i = 0; i < $el.style.length; i++) {
        const prop = $el.style[i];
        if (prop) {
          css(el, prop, css($el, prop));
        }
      }
      for (const attribute of this.attributes) {
        const [prop, value] = attribute.split(":", 2);
        if (prop && value !== void 0) {
          attr(el, prop, value);
        }
      }
      el.ariaHidden = this.$el.ariaHidden;
      if (!this.$el.id) {
        removeAttr(el, "id");
      }
    }
    const loadSVG = memoize(async (src) => {
      if (src) {
        const response = await fetch(src);
        if (response.headers.get("Content-Type") === "image/svg+xml") {
          return response.text();
        }
      }
      return Promise.reject();
    });
    function applyAnimation(el) {
      const length = getMaxPathLength(el);
      if (length) {
        css(el, "--drk-animation-stroke", length);
      }
    }
    function isLazyImage(element) {
      return isTag(element, "img") && element.getAttribute("loading") === "lazy";
    }

    const selDisabled = ".drk-disabled *, .drk-disabled, [disabled]";
    var Switcher = defineComponent()({
      mixins: [Togglable],
      args: "connect",
      props: {
        connect: String,
        toggle: String,
        itemNav: String,
        active: Number,
        followFocus: Boolean,
        swiping: Boolean
      },
      data: {
        connect: "~.drk-switcher",
        toggle: "> * > :first-child",
        itemNav: false,
        active: 0,
        cls: "drk-active",
        attrItem: "drk-switcher-item",
        selVertical: ".drk-nav",
        followFocus: false,
        swiping: true
      },
      computed: {
        connects: {
          get: ({ connect }, $el) => queryAll(connect, $el),
          observe: ({ connect }) => connect
        },
        connectChildren() {
          return this.connects.map((el) => children(el)).flat();
        },
        toggles: ({ toggle }, $el) => $$(toggle, $el),
        children(_props, $el) {
          return children($el).filter(
            (child) => this.toggles.some((toggle) => child.contains(toggle))
          );
        }
      },
      watch: {
        connects(connects) {
          if (this.swiping) {
            css(connects, "touchAction", "pan-y pinch-zoom");
          }
          this.$emit();
        },
        connectChildren() {
          const index = Math.max(0, this.index());
          for (const el of this.connects) {
            children(el).forEach((child, i) => toggleClass(child, this.cls, i === index));
          }
          this.$emit();
        },
        toggles() {
          this.$emit();
          const active = this.index();
          this.show(~active ? active : this.next(this.active));
        }
      },
      connected() {
        this.$el.role = "tablist";
      },
      observe: [
        lazyload({ targets: ({ connectChildren }) => connectChildren }),
        swipe({
          target: ({ connects }) => connects,
          filter: ({ swiping }) => swiping
        })
      ],
      events: [
        {
          name: "click keydown",
          delegate: ({ toggle }) => toggle,
          handler(e) {
            if (!matches(e.current, selDisabled) && (e.type === "click" || e.keyCode === keyMap.SPACE)) {
              maybeDefaultPreventClick(e);
              if (e.current) {
                this.show(e.current);
              }
            }
          }
        },
        {
          name: "keydown",
          delegate: ({ toggle }) => toggle,
          handler(e) {
            const { current, keyCode } = e;
            const isVertical = matches(this.$el, this.selVertical);
            const item = keyCode === keyMap.HOME ? 0 : keyCode === keyMap.END ? "last" : keyCode === keyMap.LEFT && !isVertical || keyCode === keyMap.UP && isVertical ? "previous" : keyCode === keyMap.RIGHT && !isVertical || keyCode === keyMap.DOWN && isVertical ? "next" : -1;
            if (item !== -1) {
              e.preventDefault();
              const next = this.toggles[this.next(
                item,
                current instanceof HTMLElement ? this.toggles.indexOf(current) : -1
              )];
              if (next) {
                next.focus();
                if (this.followFocus) {
                  this.show(next);
                }
              }
            }
          }
        },
        {
          name: "click",
          el: ({ $el, connects, itemNav }) => connects.concat(itemNav ? queryAll(itemNav, $el) : []),
          delegate: ({ attrItem }) => `[${attrItem}],[data-${attrItem}]`,
          handler(e) {
            var _a;
            if ((_a = e.target) == null ? void 0 : _a.closest("a,button")) {
              maybeDefaultPreventClick(e);
              const item = data(e.current, this.attrItem);
              if (item !== void 0 && item !== null) {
                this.show(item);
              }
            }
          }
        },
        {
          name: "swipeRight swipeLeft",
          filter: ({ swiping }) => swiping,
          el: ({ connects }) => connects,
          handler({ type }) {
            this.show(endsWith(type, "Left") ? "next" : "previous");
          }
        }
      ],
      update() {
        var _a;
        for (const el of this.connects) {
          if (isTag(el, "ul")) {
            el.role = "presentation";
          }
        }
        attr(children(this.$el), "role", "presentation");
        for (const [index, toggle] of this.toggles.entries()) {
          const item = (_a = this.connects[0]) == null ? void 0 : _a.children[index];
          toggle.role = "tab";
          if (!item) {
            continue;
          }
          toggle.id = generateId(this, toggle);
          item.id = generateId(this, item);
          attr(toggle, "aria-controls", item.id);
          attr(item, { role: "tabpanel", "aria-labelledby": toggle.id });
        }
        attr(this.$el, "aria-orientation", matches(this.$el, this.selVertical) ? "vertical" : null);
      },
      methods: {
        index() {
          return findIndex(this.children, (el) => hasClass(el, this.cls));
        },
        next(item, prev) {
          var _a;
          prev != null ? prev : prev = this.index();
          if (isNumeric(item)) {
            for (let i = 0; i < this.toggles.length; i++) {
              const index = getIndex(i + Number(item), this.toggles);
              if (!matches(this.toggles[index], selDisabled)) {
                return index;
              }
            }
          }
          const toggles = this.toggles.filter((el) => !matches(el, selDisabled));
          const currentToggle = this.toggles[prev];
          const resolvedItem = resolveSwitcherItem(item);
          return getIndex(
            (_a = toggles[getIndex(
              resolvedItem,
              toggles,
              currentToggle ? toggles.indexOf(currentToggle) : -1
            )]) != null ? _a : -1,
            this.toggles
          );
        },
        show(item) {
          const prev = this.index();
          const next = this.next(item);
          this.children.forEach((child, i) => {
            toggleClass(child, this.cls, next === i);
            attr(this.toggles[i], {
              "aria-selected": next === i,
              tabindex: next === i ? null : -1
            });
          });
          const animate = prev >= 0 && prev !== next;
          this.connects.forEach(async ({ children: children2 }) => {
            const actives = toArray$1(children2).filter(
              (child, i) => i !== next && hasClass(child, this.cls)
            );
            if (await this.toggleElement(actives, false, animate)) {
              await this.toggleElement(children2[next], true, animate);
            }
          });
        }
      }
    });
    function resolveSwitcherItem(item) {
      if (item instanceof Node || typeof item === "number") {
        return item;
      }
      if (item === "next" || item === "previous" || item === "last") {
        return item;
      }
      return isNumeric(item) ? Number(item) : -1;
    }

    var tab = defineComponent()({
      mixins: [Class],
      extends: Switcher,
      props: {
        media: Boolean
      },
      data: {
        media: 960,
        attrItem: "drk-tab-item",
        selVertical: ".drk-tab-left,.drk-tab-right"
      },
      connected() {
        const cls = hasClass(this.$el, "drk-tab-left") ? "drk-tab-left" : hasClass(this.$el, "drk-tab-right") ? "drk-tab-right" : false;
        if (cls) {
          this.$create("toggle", this.$el, { cls, mode: "media", media: this.media });
        }
      }
    });

    var toggle = defineComponent()({
      mixins: [Media, Togglable],
      args: "target",
      props: {
        href: String,
        target: null,
        mode: "list",
        queued: Boolean
      },
      data: {
        href: false,
        target: false,
        mode: "click",
        queued: true
      },
      computed: {
        target: {
          get: ({ target }, $el) => {
            const selector = target || $el.hash;
            const elements = selector ? queryAll(selector, $el) : [];
            return elements.length ? elements : [$el];
          },
          observe: ({ target }) => target
        }
      },
      connected() {
        if (!includes(this.mode, "media")) {
          if (!isFocusable(this.$el)) {
            this.$el.tabIndex = 0;
          }
          if (!this.cls && isTag(this.$el, "a")) {
            this.$el.role = "button";
          }
        }
      },
      observe: lazyload({ targets: ({ target }) => target }),
      events: [
        {
          name: pointerDown,
          filter: ({ mode }) => includes(mode, "hover"),
          handler(e) {
            this._preventClick = null;
            if (!isTouch(e) || isBoolean(this._showState) || this.$el.disabled) {
              return;
            }
            trigger(this.$el, "focus");
            once(
              document,
              pointerDown,
              () => trigger(this.$el, "blur"),
              true,
              (e2) => !(e2.target instanceof Node) || !this.$el.contains(e2.target)
            );
            if (includes(this.mode, "click")) {
              this._preventClick = true;
            }
          }
        },
        {
          name: `${pointerEnter} ${pointerLeave} focus blur`,
          filter: ({ mode }) => includes(mode, "hover"),
          handler(e) {
            if (isTouch(e) || this.$el.disabled || document.readyState === "loading") {
              return;
            }
            const show = includes([pointerEnter, "focus"], e.type);
            const expanded = this.isToggled(this.target);
            if (!show && (!isBoolean(this._showState) || e.type === pointerLeave && matches(this.$el, ":focus") || e.type === "blur" && matches(this.$el, ":hover"))) {
              if (expanded === this._showState) {
                this._showState = null;
              }
              return;
            }
            if (show && isBoolean(this._showState) && expanded !== this._showState) {
              return;
            }
            this._showState = show ? expanded : null;
            this.toggle(`toggle${show ? "show" : "hide"}`);
          }
        },
        {
          name: "keydown",
          filter: ({ $el, mode }) => includes(mode, "click") && !isTag($el, "input"),
          handler(e) {
            if (e.keyCode === keyMap.SPACE || e.keyCode === keyMap.ENTER) {
              e.preventDefault();
              this.$el.click();
            }
          }
        },
        {
          name: "click",
          filter: ({ mode }) => ["click", "hover"].some((m) => includes(mode, m)),
          handler(e) {
            var _a, _b;
            if (e.defaultPrevented) {
              return;
            }
            const link = (_b = (_a = e.target) == null ? void 0 : _a.closest("a[href]")) != null ? _b : null;
            const isButtonLike = isSameSiteAnchor(link) && (!link.hash || matches(this.target, link.hash));
            if (this._preventClick || isButtonLike || link && !this.isToggled(this.target)) {
              e.preventDefault();
            }
            if (!this._preventClick && includes(this.mode, "click") && (!link || isButtonLike || e.defaultPrevented)) {
              this.toggle();
            }
          }
        },
        {
          name: "mediachange",
          filter: ({ mode }) => includes(mode, "media"),
          el: ({ target }) => target,
          handler(_event, mediaObj) {
            if (isMediaQueryList(mediaObj) && mediaObj.matches !== this.isToggled(this.target)) {
              this.toggle();
            }
          }
        }
      ],
      methods: {
        async toggle(type) {
          if (!trigger(this.target, type || "toggle", [this])) {
            return;
          }
          if (hasAttr(this.$el, "aria-expanded")) {
            this.$el.ariaExpanded = String(!this.isToggled(this.target));
          }
          if (!this.queued) {
            return this.toggleElement(this.target);
          }
          const leaving = this.target.filter((el) => hasClass(el, this.clsLeave));
          if (leaving.length) {
            for (const el of this.target) {
              const isLeaving = includes(leaving, el);
              this.toggleElement(el, isLeaving, isLeaving);
            }
            return;
          }
          const toggled = this.target.filter(this.isToggled);
          if (await this.toggleElement(toggled, false)) {
            await this.toggleElement(
              this.target.filter((el) => !includes(toggled, el)),
              true
            );
          }
        }
      }
    });
    function isMediaQueryList(value) {
      return typeof value === "object" && value !== null && "matches" in value && typeof value.matches === "boolean";
    }

    var components = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Accordion: Accordion,
        AccordionIcon: IconComponent,
        Alert: alert,
        Close: Close,
        Cover: cover,
        Drop: drop,
        DropParentIcon: IconComponent,
        Dropdown: drop,
        Dropnav: Dropnav,
        FormCustom: formCustom,
        Grid: grid,
        HeightMatch: heightMatch,
        HeightPlaceholder: heightPlaceholder,
        HeightViewport: heightViewport,
        Icon: Icon,
        Img: img,
        Inverse: inverse,
        Leader: leader,
        Margin: Margin,
        Marker: Marker,
        Modal: modal,
        Nav: nav,
        NavParentIcon: NavParentIcon,
        Navbar: navbar,
        NavbarParentIcon: IconComponent,
        NavbarToggleIcon: NavbarToggleIcon,
        Offcanvas: offcanvas,
        OverflowAuto: overflowAuto,
        OverflowFade: overflowFade,
        OverlayIcon: IconComponent,
        PaginationNext: PaginationNext,
        PaginationPrevious: PaginationPrevious,
        Responsive: responsive,
        Scroll: scroll,
        Scrollspy: scrollspy,
        ScrollspyNav: scrollspyNav,
        SearchIcon: Search,
        SlidenavNext: Slidenav,
        SlidenavPrevious: Slidenav,
        Spinner: Spinner,
        Sticky: sticky,
        Svg: svg,
        Switcher: Switcher,
        Tab: tab,
        Toggle: toggle,
        Totop: Totop,
        Video: Video
    });

    each(components, (component, name) => App.component(name, component));
    boot(App);

    return App;

}));
