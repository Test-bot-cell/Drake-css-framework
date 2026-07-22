/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

import { removeClass, hasClass, addClass, fastdom, isPlainObject, assign, observeIntersection, toNodes as toNodes$1, observeResize, isFunction, $$ as $$$1, removeAttr as removeAttr$1, on, scrollParent, trigger, createEvent, isString as isString$1, startsWith as startsWith$1, toFloat, css, isNumeric, clamp, propName, resetProps, ucfirst, noop, Dimensions, once, findIndex, toPx, includes, scrolledOver, query, Transition, isVisible as isVisible$1, matches as matches$1, attr as attr$1, off, isTouch, selInput, getEventPos, isRtl, isEqual, toArray as toArray$1, memoize as memoize$1, hyphenate, children as children$1, $, html, data, toNumber, toggleClass, parent as parent$1, isTag, isNumber, getIndex } from './../drake-util.esm.js';

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
}
function defineComponent(options) {
  return ((component) => component);
}
function defineMixin(options) {
  return ((mixin) => mixin);
}

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
function lazyload(options = {}) {
  return intersection({
    ...options,
    handler(entries, observer) {
      var _a, _b;
      const targets = isFunction(options.targets) ? options.targets(this) : (_a = options.targets) != null ? _a : this.$el;
      for (const element of toNodes$1(targets).filter(
        (node) => node instanceof Element
      )) {
        $$$1('[loading="lazy"]', element).slice(0, ((_b = options.preload) != null ? _b : 5) - 1).forEach((item) => removeAttr$1(item, "loading"));
      }
      for (const element of entries.filter(({ isIntersecting }) => isIntersecting).map(({ target }) => target)) {
        observer.unobserve(element);
      }
    }
  });
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
function createObservable(observe, options, emit) {
  return {
    observe,
    handler: function() {
      callUpdate(this, emit);
    },
    ...options
  };
}
function toScrollTargets(elements) {
  return toNodes$1(elements).flatMap((node) => {
    var _a;
    const parentElement = scrollParent(node instanceof Element ? node : void 0, true);
    const target = parentElement === ((_a = node.ownerDocument) == null ? void 0 : _a.scrollingElement) ? node.ownerDocument : parentElement;
    return target ? [target] : [];
  });
}
function toElementInput(target) {
  return toNodes$1(target).filter((node) => node instanceof Element);
}
function isResizeOptions(value) {
  return typeof value === "object" && value !== null;
}
function isIntersectionOptions(value) {
  return typeof value === "object" && value !== null;
}
function isIntersectionArgs(value) {
  return typeof value === "object" && value !== null;
}

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
  if (isString$1(value)) {
    if (startsWith$1(value, "@")) {
      value = toFloat(css(element, `--drk-breakpoint-${value.slice(1)}`));
    } else if (Number.isNaN(Number(value))) {
      return value;
    }
  }
  return value && isNumeric(value) ? `(min-width: ${value}px)` : "";
}

function startsWith(value, search) {
  return typeof value === "string" && value.startsWith(search);
}
function toArray(value) {
  return Array.from(value);
}
function isObject(value) {
  return value !== null && typeof value === "object";
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
function nodeType(value) {
  return !isWindow(value) && isObject(value) && typeof value.nodeType === "number" ? value.nodeType : 0;
}
function isString(value) {
  return typeof value === "string";
}
function isUndefined(value) {
  return value === void 0;
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
function removeAttr(element, name) {
  toNodes(element).forEach((item) => item.removeAttribute(name));
}

const inBrowser = typeof window !== "undefined";

function isVisible(element) {
  return toNodes(element).some((item) => {
    if (inBrowser && typeof item.checkVisibility === "function") {
      return item.checkVisibility();
    }
    return item instanceof HTMLElement && Boolean(item.offsetWidth || item.offsetHeight) || item.getClientRects().length > 0;
  });
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

function findAll(selector, context) {
  if (!isString(selector)) {
    return toNodes(selector);
  }
  return toNodes(_query(selector, context != null ? context : document, "querySelectorAll"));
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
function $$(selector, context) {
  return isHtml(selector) ? toNodes(fragment(selector)) : findAll(selector, context);
}
function isHtml(value) {
  return isString(value) && startsWith(value.trim(), "<");
}

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

const propertyFactories = {
  x: transformFn,
  y: transformFn,
  rotate: transformFn,
  scale: transformFn,
  color: colorFn,
  backgroundColor: colorFn,
  borderColor: colorFn,
  blur: filterFn,
  hue: filterFn,
  fopacity: filterFn,
  grayscale: filterFn,
  invert: filterFn,
  saturate: filterFn,
  sepia: filterFn,
  opacity: cssPropFn,
  stroke: strokeFn,
  bgx: backgroundFn,
  bgy: backgroundFn
};
const { keys } = Object;
defineMixin()({
  mixins: [Media],
  props: fillObject(keys(propertyFactories), "list"),
  data: fillObject(keys(propertyFactories), void 0),
  computed: {
    props(properties, $el) {
      const stops = {};
      for (const property in properties) {
        const values = toRawStops(properties[property]);
        if (isParallaxProperty(property) && values) {
          stops[property] = values.slice();
        }
      }
      const result = {};
      for (const property in stops) {
        const values = stops[property];
        if (isParallaxProperty(property) && isRawStops(values)) {
          result[property] = propertyFactories[property](property, $el, values, stops);
        }
      }
      return result;
    }
  },
  events: {
    name: "load",
    handler() {
      this.$emit();
    }
  },
  methods: {
    reset() {
      resetProps(this.$el, this.getCss(0));
    },
    getCss(percent) {
      var _a, _b;
      const styles = {};
      for (const property in this.props) {
        if (isParallaxProperty(property)) {
          (_b = (_a = this.props)[property]) == null ? void 0 : _b.call(_a, styles, clamp(percent));
        }
      }
      styles.willChange = Object.keys(styles).map(propName).join(",");
      return styles;
    }
  }
});
function transformFn(property, el, inputStops) {
  let unit = getUnit(inputStops) || (property === "x" || property === "y" ? "px" : property === "rotate" ? "deg" : "");
  let transformName = property;
  let convert = toFloat;
  if (property === "x" || property === "y") {
    transformName = `translate${ucfirst(property)}`;
    convert = (stop) => toFloat(toFloat(stop).toFixed(unit === "px" ? 0 : 6));
  } else if (property === "scale") {
    unit = "";
    convert = (stop) => getUnit([stop]) ? toPx(stop, "width", el, true) / (typeof stop === "string" && stop.endsWith("vh") ? el.offsetHeight : el.offsetWidth) : toFloat(stop);
  }
  if (inputStops.length === 1) {
    inputStops.unshift(property === "scale" ? 1 : 0);
  }
  const stops = parseStops(inputStops, convert);
  return (styles, percent) => {
    styles.transform = `${styles.transform || ""} ${transformName}(${getValue(stops, percent)}${unit})`;
  };
}
function colorFn(property, el, inputStops) {
  if (inputStops.length === 1) {
    inputStops.unshift(getCssValue(el, property, ""));
  }
  const stops = parseStops(inputStops, (stop) => parseColor(el, stop));
  return (styles, percent) => {
    const stop = getStop(stops, percent);
    if (!stop) {
      return;
    }
    const [start, end, progress] = stop;
    const value = start.map((value2, i) => {
      var _a;
      value2 += progress * (((_a = end[i]) != null ? _a : value2) - value2);
      return i === 3 ? toFloat(value2) : Number.parseInt(String(value2), 10);
    }).join(",");
    styles[property] = `rgba(${value})`;
  };
}
function parseColor(el, color) {
  const channels = getCssValue(el, "color", color).split(/[(),]/g).slice(1, -1);
  channels.push(1);
  return channels.slice(0, 4).map(toFloat);
}
function filterFn(property, _el, inputStops) {
  if (inputStops.length === 1) {
    inputStops.unshift(0);
  }
  const unit = getUnit(inputStops) || (property === "blur" ? "px" : property === "hue" ? "deg" : "%");
  const filterName = property === "fopacity" ? "opacity" : property === "hue" ? "hue-rotate" : property;
  const stops = parseStops(inputStops, toFloat);
  return (styles, percent) => {
    const value = getValue(stops, percent);
    styles.filter = `${styles.filter || ""} ${filterName}(${value + unit})`;
  };
}
function cssPropFn(property, el, inputStops) {
  if (inputStops.length === 1) {
    inputStops.unshift(getCssValue(el, property, ""));
  }
  const stops = parseStops(inputStops, toFloat);
  return (styles, percent) => {
    styles[property] = getValue(stops, percent);
  };
}
function strokeFn(_property, el, inputStops) {
  if (inputStops.length === 1) {
    inputStops.unshift(0);
  }
  const unit = getUnit(inputStops);
  const length = getMaxPathLength(el);
  const stops = parseStops(inputStops.reverse(), (stop) => {
    const value = toFloat(stop);
    return unit === "%" ? value * length / 100 : value;
  });
  if (!stops.some(([value]) => value)) {
    return noop;
  }
  css(el, "strokeDasharray", length);
  return (styles, percent) => {
    styles.strokeDashoffset = getValue(stops, percent);
  };
}
function backgroundFn(property, el, inputStops, properties) {
  if (inputStops.length === 1) {
    inputStops.unshift(0);
  }
  const dimension = property === "bgy" ? "height" : "width";
  properties[property] = parseStops(inputStops, (stop) => toPx(stop, dimension, el));
  const backgroundProperties = getBackgroundProperties(properties);
  if (backgroundProperties.length === 2 && property === "bgx") {
    return noop;
  }
  if (getCssValue(el, "backgroundSize", "") === "cover") {
    return backgroundCoverFn(property, el, properties);
  }
  const positions = {};
  for (const backgroundProperty of backgroundProperties) {
    positions[backgroundProperty] = getBackgroundPos(el, backgroundProperty);
  }
  return setBackgroundPosFn(backgroundProperties, positions, properties);
}
function backgroundCoverFn(_property, el, properties) {
  var _a;
  const dimImage = getBackgroundImageDimensions(el);
  if (!dimImage.width) {
    return noop;
  }
  const dimEl = {
    width: el.offsetWidth,
    height: el.offsetHeight
  };
  const backgroundProperties = getBackgroundProperties(properties);
  const positions = {};
  for (const property of backgroundProperties) {
    const stops = getNumericStops(properties[property]);
    if (!stops.length) {
      continue;
    }
    const values = stops.map(([value]) => value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const down = values.indexOf(min) < values.indexOf(max);
    const diff = max - min;
    positions[property] = `${(down ? -diff : 0) - (down ? min : max)}px`;
    dimEl[property === "bgy" ? "height" : "width"] += diff;
  }
  const dim = Dimensions.cover(dimImage, dimEl);
  for (const property of backgroundProperties) {
    const dimension = property === "bgy" ? "height" : "width";
    const overflow = dim[dimension] - dimEl[dimension];
    positions[property] = `max(${getBackgroundPos(el, property)},-${overflow}px) + ${(_a = positions[property]) != null ? _a : ""}`;
  }
  const setBackgroundPosition = setBackgroundPosFn(backgroundProperties, positions, properties);
  return (styles, percent) => {
    setBackgroundPosition(styles, percent);
    styles.backgroundSize = `${dim.width}px ${dim.height}px`;
    styles.backgroundRepeat = "no-repeat";
  };
}
function getBackgroundPos(el, property) {
  return getCssValue(el, `background-position-${property.slice(-1)}`, "");
}
function setBackgroundPosFn(backgroundProperties, positions, properties) {
  return (styles, percent) => {
    var _a;
    for (const property of backgroundProperties) {
      const value = getValue(getNumericStops(properties[property]), percent);
      styles[`background-position-${property.slice(-1)}`] = `calc(${(_a = positions[property]) != null ? _a : ""} + ${value}px)`;
    }
  };
}
const loading = {};
const dimensions = {};
function getBackgroundImageDimensions(el) {
  const src = css(el, "backgroundImage").replace(/^none|url\(["']?(.+?)["']?\)$/, "$1");
  const cached = dimensions[src];
  if (cached) {
    return cached;
  }
  const image = new Image();
  if (src) {
    image.src = src;
    if (!image.naturalWidth && !loading[src]) {
      once(image, "error load", () => {
        dimensions[src] = toDimensions(image);
        trigger(el, createEvent("load", false));
      });
      loading[src] = true;
      return toDimensions(image);
    }
  }
  return dimensions[src] = toDimensions(image);
}
function toDimensions(image) {
  return {
    width: image.naturalWidth,
    height: image.naturalHeight
  };
}
function parseStops(stops, convert) {
  var _a, _b;
  const result = [];
  const { length } = stops;
  let nullIndex = 0;
  for (let i = 0; i < length; i++) {
    const rawStop = (_a = stops[i]) != null ? _a : 0;
    const [rawValue = 0, rawPercent] = isString$1(rawStop) ? rawStop.trim().split(/ (?![^(]*\))/) : [rawStop];
    const value = convert(rawValue);
    let percent = rawPercent ? toFloat(rawPercent) / 100 : null;
    if (i === 0) {
      if (percent === null) {
        percent = 0;
      } else if (percent) {
        result.push([value, 0]);
      }
    } else if (i === length - 1) {
      if (percent === null) {
        percent = 1;
      } else if (percent !== 1) {
        result.push([value, percent]);
        percent = 1;
      }
    }
    result.push([value, percent]);
    if (percent === null) {
      nullIndex++;
    } else if (nullIndex) {
      const left = result[i - nullIndex - 1];
      if (!left) {
        continue;
      }
      const leftPercent = (_b = left[1]) != null ? _b : 0;
      const p = (percent - leftPercent) / (nullIndex + 1);
      for (let j = nullIndex; j > 0; j--) {
        const unresolved = result[i - j];
        if (unresolved) {
          unresolved[1] = leftPercent + p * (nullIndex - j + 1);
        }
      }
      nullIndex = 0;
    }
  }
  return result.map(([value, percent]) => [value, percent != null ? percent : 0]);
}
function getStop(stops, percent) {
  const index = findIndex(stops.slice(1), ([, targetPercent]) => percent <= targetPercent) + 1;
  const start = stops[index - 1];
  const end = stops[index];
  if (!start || !end) {
    return void 0;
  }
  return [start[0], end[0], (percent - start[1]) / (end[1] - start[1])];
}
function getValue(stops, percent) {
  const stop = getStop(stops, percent);
  if (!stop) {
    return 0;
  }
  const [start, end, progress] = stop;
  return start + (end - start) * progress;
}
const unitRe = /^-?\d+(?:\.\d+)?(\S+)?/;
function getUnit(stops, defaultUnit) {
  for (const stop of stops) {
    const match = isString$1(stop) ? stop.match(unitRe) : null;
    if (match) {
      return match[1];
    }
  }
  return defaultUnit;
}
function getCssValue(el, property, value) {
  const cssProperty = propName(property);
  const previous = el.style.getPropertyValue(cssProperty);
  const val = css(css(el, property, value), property);
  el.style.setProperty(cssProperty, previous);
  return val;
}
function fillObject(keys2, value) {
  return keys2.reduce((data, property) => {
    data[property] = value;
    return data;
  }, {});
}
function isParallaxProperty(value) {
  return Object.hasOwn(propertyFactories, value);
}
function isRawStop(value) {
  return typeof value === "string" || typeof value === "number";
}
function toRawStops(value) {
  if (!Array.isArray(value)) {
    return void 0;
  }
  const stops = [];
  for (const stop of value) {
    if (!isRawStop(stop)) {
      return void 0;
    }
    stops.push(stop);
  }
  return stops;
}
function isRawStops(value) {
  return Boolean(value == null ? void 0 : value.every(isRawStop));
}
function getNumericStops(value) {
  if (!value) {
    return [];
  }
  const stops = [];
  for (const stop of value) {
    if (Array.isArray(stop) && typeof stop[0] === "number" && typeof stop[1] === "number") {
      stops.push([stop[0], stop[1]]);
    }
  }
  return stops;
}
function getBackgroundProperties(properties) {
  return ["bgx", "bgy"].filter((property) => property in properties);
}
function ease(percent, easing) {
  return easing >= 0 ? Math.pow(percent, easing + 1) : 1 - Math.pow(1 - percent, 1 - easing);
}

var SliderParallax = defineMixin()({
  props: {
    parallax: Boolean,
    parallaxTarget: Boolean,
    parallaxStart: String,
    parallaxEnd: String,
    parallaxEasing: Number
  },
  data: {
    parallax: false,
    parallaxTarget: false,
    parallaxStart: 0,
    parallaxEnd: 0,
    parallaxEasing: 0
  },
  observe: [
    resize({
      target: ({ $el, parallaxTarget }) => parallaxTarget ? [$el, parallaxTarget] : [$el],
      filter: ({ parallax }) => parallax
    }),
    scroll({ filter: ({ parallax }) => parallax })
  ],
  computed: {
    parallaxTarget({ parallaxTarget }, $el) {
      return parallaxTarget && query(parallaxTarget, $el) || this.list;
    }
  },
  update: {
    read() {
      if (!this.parallax) {
        return false;
      }
      const target = this.parallaxTarget;
      if (!target) {
        return false;
      }
      const start = toPx(this.parallaxStart, "height", target, true);
      const end = toPx(this.parallaxEnd, "height", target, true);
      const percent = ease(scrolledOver(target, start, end), this.parallaxEasing);
      return { parallax: this.getIndexAt(percent) };
    },
    write({ parallax }) {
      const [prevIndex, slidePercent] = parallax;
      const nextIndex = this.getValidIndex(prevIndex + Math.ceil(slidePercent));
      const prev = this.slides[prevIndex];
      const next = this.slides[nextIndex];
      const { triggerShow, triggerShown, triggerHide, triggerHidden } = useTriggers(this);
      if (~this.prevIndex) {
        for (const i of /* @__PURE__ */ new Set([this.index, this.prevIndex])) {
          if (!includes([nextIndex, prevIndex], i)) {
            triggerHide(this.slides[i]);
            triggerHidden(this.slides[i]);
          }
        }
      }
      const changed = this.prevIndex !== prevIndex || this.index !== nextIndex;
      this.dir = 1;
      this.prevIndex = prevIndex;
      this.index = nextIndex;
      if (prev !== next) {
        triggerHide(prev);
      }
      triggerShow(next);
      if (changed) {
        triggerShown(prev);
      }
      this._translate(prev === next ? 1 : slidePercent, prev, next);
    },
    events: ["scroll", "resize"]
  },
  methods: {
    getIndexAt(percent) {
      const index = percent * (this.length - 1);
      return [Math.floor(index), index % 1];
    }
  }
});
function useTriggers(cmp) {
  const { clsSlideActive, clsEnter, clsLeave } = cmp;
  return { triggerShow, triggerShown, triggerHide, triggerHidden };
  function triggerShow(el) {
    if (hasClass(el, clsLeave)) {
      triggerHide(el);
      triggerHidden(el);
    }
    if (!hasClass(el, clsSlideActive)) {
      trigger(el, "beforeitemshow", [cmp]);
      trigger(el, "itemshow", [cmp]);
    }
  }
  function triggerShown(el) {
    if (hasClass(el, clsEnter)) {
      trigger(el, "itemshown", [cmp]);
    }
  }
  function triggerHide(el) {
    if (!hasClass(el, clsSlideActive)) {
      triggerShow(el);
    }
    if (hasClass(el, clsEnter)) {
      triggerShown(el);
    }
    if (!hasClass(el, clsLeave)) {
      trigger(el, "beforeitemhide", [cmp]);
      trigger(el, "itemhide", [cmp]);
    }
  }
  function triggerHidden(el) {
    if (hasClass(el, clsLeave)) {
      trigger(el, "itemhidden", [cmp]);
    }
  }
}

var SliderReactive = defineMixin()({
  update: {
    write() {
      if (this.stack.length || this.dragging || this.parallax) {
        return;
      }
      const index = this.getValidIndex();
      if (!~this.prevIndex || this.index !== index) {
        void this.show(index);
      } else {
        this._translate(1);
      }
    },
    events: ["resize"]
  }
});

const animations = {
  slide: {
    show(dir) {
      return [{ transform: translate(dir * -100) }, { transform: translate() }];
    },
    percent(current) {
      return translated(current);
    },
    translate(percent, dir) {
      return [
        { transform: translate(dir * -100 * percent) },
        { transform: translate(dir * 100 * (1 - percent)) }
      ];
    }
  }
};
function translated(el) {
  return Math.abs(new DOMMatrix(css(el, "transform")).m41 / el.offsetWidth);
}
function translate(value = 0, unit = "%") {
  return value ? `translate3d(${value + unit}, 0, 0)` : "";
}

function Transitioner(prev, next, dir, { animation, easing }) {
  const { percent, translate, show } = animation;
  const props = show(dir);
  const { promise, resolve } = withResolvers();
  return {
    dir,
    show(duration, initialPercent = 0, linear = false) {
      const timing = linear ? "linear" : easing;
      duration -= Math.round(duration * clamp(initialPercent, -1, 1));
      this.translate(initialPercent);
      triggerUpdate(next, "itemin", { percent: initialPercent, duration, timing, dir });
      triggerUpdate(prev, "itemout", {
        percent: 1 - initialPercent,
        duration,
        timing,
        dir
      });
      Promise.all([
        Transition.start(next, props[1], duration, timing),
        Transition.start(prev, props[0], duration, timing)
      ]).then(() => {
        this.reset();
        resolve(void 0);
      }, noop);
      return promise;
    },
    cancel() {
      return Transition.cancel([next, prev].filter(isHtmlElement));
    },
    reset() {
      resetProps([next, prev].filter(isHtmlElement), props[0]);
    },
    async forward(duration, initialPercent = this.percent()) {
      await this.cancel();
      return this.show(duration, initialPercent, true);
    },
    translate(initialPercent) {
      this.reset();
      const translatedProps = translate(initialPercent, dir);
      css(next, translatedProps[1]);
      css(prev, translatedProps[0]);
      triggerUpdate(next, "itemtranslatein", { percent: initialPercent, dir });
      triggerUpdate(prev, "itemtranslateout", { percent: 1 - initialPercent, dir });
    },
    percent() {
      const current = prev || next;
      return current ? percent(current, next, dir) : 0;
    },
    getDistance() {
      return prev == null ? void 0 : prev.offsetWidth;
    }
  };
}
function triggerUpdate(el, type, data) {
  trigger(el, createEvent(type, false, false, data));
}
function withResolvers() {
  let resolve;
  const promise = new Promise((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}
function isHtmlElement(value) {
  return value instanceof HTMLElement;
}

function awaitFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

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

var SliderAutoplay = defineMixin()({
  props: {
    autoplay: Boolean,
    autoplayInterval: Number,
    pauseOnHover: Boolean
  },
  data: {
    autoplay: false,
    autoplayInterval: 7e3,
    pauseOnHover: true
  },
  connected() {
    attr$1(this.list, "aria-live", this.autoplay ? "off" : "polite");
    if (this.autoplay) {
      this.startAutoplay();
    }
  },
  disconnected() {
    this.stopAutoplay();
  },
  update() {
    attr$1(this.slides, "tabindex", "-1");
  },
  events: [
    {
      name: "visibilitychange",
      el: () => document,
      filter: ({ autoplay }) => autoplay,
      handler() {
        if (document.hidden) {
          this.stopAutoplay();
        } else {
          this.startAutoplay();
        }
      }
    }
  ],
  methods: {
    startAutoplay() {
      this.stopAutoplay();
      this.interval = setInterval(() => {
        if (!(this.stack.length || !isVisible$1(this.$el) || this.draggable && matches$1(this.$el, ":focus-within") && !matches$1(this.$el, ":focus") || this.pauseOnHover && matches$1(this.$el, ":hover"))) {
          void this.show("next");
        }
      }, this.autoplayInterval);
    },
    stopAutoplay() {
      clearInterval(this.interval);
    }
  }
});

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
  return css(el, "userSelect") !== "none" && toArray$1(el.childNodes).some(
    (child) => {
      var _a;
      return child.nodeType === 3 && Boolean((_a = child.textContent) == null ? void 0 : _a.trim());
    }
  );
}
function getAngle(pos1, pos2) {
  return Math.atan2(Math.abs(pos2.y - pos1.y), Math.abs(pos2.x - pos1.x)) * 180 / Math.PI;
}

memoize$1((id, props) => {
  const attributes = Object.keys(props);
  const filter = attributes.concat(id).filter(Boolean).flatMap((key) => [hyphenate(key), `data-${hyphenate(key)}`]);
  return { attributes, filter };
});

let id = 1;
function generateId(instance, element) {
  var _a;
  return (element == null ? void 0 : element.id) || `${(_a = instance.$options.id) != null ? _a : "drk"}-${id++}`;
}

const keyMap = {
  SPACE: 32,
  END: 35,
  HOME: 36,
  LEFT: 37,
  RIGHT: 39};

function maybeDefaultPreventClick(e) {
  var _a;
  if ((_a = e.target) == null ? void 0 : _a.closest('a[href="#"],a[href=""]')) {
    e.preventDefault();
  }
}

var SliderNav = defineMixin()({
  i18n: {
    next: "Next slide",
    previous: "Previous slide",
    slideX: "Slide %s",
    slideLabel: "%s of %s"
  },
  data: {
    selNav: false,
    role: "region"
  },
  computed: {
    nav: ({ selNav }, $el) => selNav ? $$$1(selNav, $el) : [],
    navChildren() {
      return this.nav.flatMap((nav) => children$1(nav)).filter((item) => item instanceof HTMLElement);
    },
    selNavItem: ({ attrItem }) => `[${attrItem}],[data-${attrItem}]`,
    navItems(_data, $el) {
      return $$$1(this.selNavItem, $el);
    }
  },
  watch: {
    nav(nav, prev) {
      attr$1(nav, "role", "tablist");
      this.padNavitems();
      if (prev) {
        this.$emit();
      }
    },
    list(list) {
      if (isTag(list, "ul")) {
        attr$1(list, "role", "presentation");
      }
    },
    navChildren(items) {
      attr$1(items, "role", "presentation");
      this.padNavitems();
      this.updateNav();
    },
    navItems(items) {
      for (const el of items) {
        const cmd = data(el, this.attrItem);
        const button = $("a,button", el) || el;
        let ariaLabel;
        let ariaControls = null;
        if (isNumeric(cmd)) {
          const item = toNumber(cmd);
          if (item === false) {
            continue;
          }
          const slide = this.slides[item];
          if (slide) {
            if (!slide.id) {
              slide.id = generateId(this, slide);
            }
            ariaControls = slide.id;
          }
          ariaLabel = this.t("slideX", toFloat(cmd) + 1);
          button.role = "tab";
        } else {
          if (this.list) {
            if (!this.list.id) {
              this.list.id = generateId(this, this.list);
            }
            ariaControls = this.list.id;
          }
          ariaLabel = this.t(cmd != null ? cmd : "");
        }
        attr$1(button, "aria-controls", ariaControls);
        button.ariaLabel = button.ariaLabel || ariaLabel;
      }
    },
    slides(slides) {
      slides.forEach(
        (slide, i) => attr$1(slide, {
          role: this.nav.length ? "tabpanel" : "group",
          "aria-label": this.t("slideLabel", i + 1, this.length),
          "aria-roledescription": this.nav.length ? null : "slide"
        })
      );
      this.padNavitems();
    }
  },
  connected() {
    this.$el.role = this.role;
    this.$el.ariaRoleDescription = "carousel";
  },
  update: [
    {
      write() {
        this.navItems.concat(this.nav).forEach((el) => el && (el.hidden = this.maxIndex < 1));
        this.updateNav();
      },
      events: ["resize"]
    }
  ],
  events: [
    {
      name: "click keydown",
      delegate: ({ selNavItem }) => selNavItem,
      filter: ({ parallax }) => !parallax,
      handler(e) {
        if (e.target.closest("a,button") && (e.type === "click" || e.keyCode === keyMap.SPACE)) {
          maybeDefaultPreventClick(e);
          const command = toSliderIndex(data(e.current, this.attrItem));
          if (command !== void 0) {
            void this.show(command);
          }
        }
      }
    },
    {
      name: "itemshow",
      handler() {
        this.updateNav();
      }
    },
    {
      name: "keydown",
      delegate: ({ selNavItem }) => selNavItem,
      filter: ({ parallax }) => !parallax,
      handler(e) {
        const { current, keyCode } = e;
        const cmd = data(current, this.attrItem);
        if (!isNumeric(cmd)) {
          return;
        }
        const item = keyCode === keyMap.HOME ? 0 : keyCode === keyMap.END ? "last" : keyCode === keyMap.LEFT ? "previous" : keyCode === keyMap.RIGHT ? "next" : -1;
        if (item !== -1) {
          e.preventDefault();
          void this.show(item);
        }
      }
    }
  ],
  methods: {
    updateNav() {
      const index = this.getValidIndex();
      for (const el of this.navItems) {
        const cmd = data(el, this.attrItem);
        const button = $("a,button", el) || el;
        if (isNumeric(cmd)) {
          const item = toNumber(cmd);
          if (item === false) {
            continue;
          }
          const active = item === index;
          toggleClass(el, this.clsActive, active);
          toggleClass(button, "drk-disabled", !!this.parallax);
          button.ariaSelected = String(active);
          button.tabIndex = active && !this.parallax ? 0 : -1;
          if (active && button && matches$1(parent$1(el), ":focus-within")) {
            button.focus();
          }
        } else {
          toggleClass(
            el,
            "drk-invisible",
            this.finite && (cmd === "previous" && index === 0 || cmd === "next" && index >= this.maxIndex)
          );
        }
      }
    },
    padNavitems() {
      for (const nav of this.nav) {
        const navChildren = children$1(nav);
        const navItems = [];
        for (let i = 0; i < this.length; i++) {
          const attr2 = `${this.attrItem}="${i}"`;
          const existing = [...navChildren].reverse().find((element) => element.matches(`[${attr2}]`));
          const created = $(`<li ${attr2}><a href></a></li>`);
          const item = existing || created;
          if (item) {
            navItems[i] = item;
          }
        }
        if (!isEqual(navItems, navChildren)) {
          html(nav, navItems);
        }
      }
    }
  }
});
function toSliderIndex(value) {
  if (isNumeric(value)) {
    const number = toNumber(value);
    return number === false ? void 0 : number;
  }
  return value === "next" || value === "previous" || value === "last" ? value : void 0;
}

const easeOutQuad = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const easeOutQuart = "cubic-bezier(0.165, 0.84, 0.44, 1)";
var Slider = defineMixin()({
  mixins: [SliderAutoplay, SliderDrag, SliderNav, I18n],
  props: {
    clsActivated: String,
    easing: String,
    index: Number,
    finite: Boolean,
    velocity: Number
  },
  data: () => ({
    easing: "ease",
    finite: false,
    velocity: 1,
    index: 0,
    prevIndex: -1,
    stack: [],
    percent: 0,
    clsActive: "drk-active",
    clsActivated: "",
    clsEnter: "drk-slide-enter",
    clsLeave: "drk-slide-leave",
    clsSlideActive: "drk-slide-active",
    Transitioner: false,
    transitionOptions: {}
  }),
  connected() {
    this.prevIndex = -1;
    this.index = this.getValidIndex(this.$props.index);
    this.stack = [];
  },
  disconnected() {
    removeClass(this.slides, this.clsActive);
  },
  computed: {
    duration: ({ velocity }, $el) => speedUp($el.offsetWidth / velocity),
    list: ({ selList }, $el) => $(selList, $el),
    maxIndex() {
      return this.length - 1;
    },
    slides() {
      return children$1(this.list).filter(
        (slide) => slide instanceof HTMLElement
      );
    },
    length() {
      return this.slides.length;
    }
  },
  watch: {
    slides(_slides, prev) {
      if (prev) {
        this.$emit();
      }
    }
  },
  events: [
    {
      name: "itemshow",
      handler({ target }) {
        addClass(target, this.clsEnter, this.clsSlideActive);
      }
    },
    {
      name: "itemshown",
      handler({ target }) {
        removeClass(target, this.clsEnter);
      }
    },
    {
      name: "itemhide",
      handler({ target }) {
        addClass(target, this.clsLeave);
      }
    },
    {
      name: "itemhidden",
      handler({ target }) {
        removeClass(target, this.clsLeave, this.clsSlideActive);
      }
    }
  ],
  methods: {
    async show(index, force = false) {
      var _a;
      if (this.dragging || !this.length || this.parallax) {
        return;
      }
      const { stack } = this;
      const queueIndex = force ? 0 : stack.length;
      const reset = () => {
        stack.splice(queueIndex, 1);
        const queued2 = stack.shift();
        if (queued2 !== void 0) {
          void this.show(queued2, true);
        }
      };
      if (force) {
        stack.unshift(index);
      } else {
        stack.push(index);
      }
      if (!force && stack.length > 1) {
        if (stack.length === 2) {
          (_a = this._transitioner) == null ? void 0 : _a.forward(Math.min(this.duration, 200));
        }
        return;
      }
      const prevIndex = this.getIndex(this.index);
      const prev = hasClass(this.slides, this.clsActive) && this.slides[prevIndex];
      const nextIndex = this.getIndex(index, this.index);
      const next = this.slides[nextIndex];
      if (!next) {
        reset();
        return;
      }
      if (prev === next) {
        reset();
        return;
      }
      this.dir = getDirection(index, prevIndex);
      this.prevIndex = prevIndex;
      this.index = nextIndex;
      if (prev && !trigger(prev, "beforeitemhide", [this]) || !trigger(next, "beforeitemshow", [this, prev])) {
        this.index = this.prevIndex;
        reset();
        return;
      }
      if (prev) {
        trigger(prev, "itemhide", [this]);
      }
      trigger(next, "itemshow", [this]);
      await this._show(prev, next, force);
      if (prev) {
        trigger(prev, "itemhidden", [this]);
      }
      trigger(next, "itemshown", [this]);
      stack.shift();
      this._transitioner = null;
      await awaitFrame();
      const queued = stack.shift();
      if (queued !== void 0) {
        void this.show(queued, true);
      }
    },
    getIndex(index = this.index, prev = this.index) {
      return clamp(
        getIndex(index, this.slides, prev, this.finite),
        0,
        Math.max(0, this.maxIndex)
      );
    },
    getValidIndex(index = this.index, prevIndex = this.prevIndex) {
      return this.getIndex(index, prevIndex);
    },
    async _show(prev, next, force) {
      var _a;
      this._transitioner = this._getTransitioner(prev, next, this.dir, {
        easing: force ? typeof next !== "number" && next.offsetWidth < 600 ? easeOutQuad : easeOutQuart : this.easing,
        ...this.transitionOptions
      });
      if (!force && !prev) {
        this._translate(1);
        return;
      }
      const { length } = this.stack;
      return this._transitioner[length > 1 ? "forward" : "show"](
        length > 1 ? Math.min(this.duration, 75 + 75 / (length - 1)) : this.duration,
        (_a = this.percent) != null ? _a : 0
      );
    },
    _translate(percent, prev = this.prevIndex, next = this.index) {
      const transitioner = this._getTransitioner(prev === next ? false : prev, next);
      transitioner.translate(percent);
      return transitioner;
    },
    _getTransitioner(prev = this.prevIndex, next = this.index, dir = this.dir || 1, options = this.transitionOptions) {
      return new this.Transitioner(
        isNumber(prev) ? this.slides[prev] : prev || void 0,
        isNumber(next) ? this.slides[next] : next || void 0,
        dir * (isRtl ? -1 : 1),
        options
      );
    }
  }
});
function getDirection(index, prevIndex) {
  return index === "next" ? 1 : index === "previous" ? -1 : Number(index) < prevIndex ? -1 : 1;
}
function speedUp(x) {
  return 0.5 * x + 300;
}

var Slideshow = defineMixin()({
  mixins: [Slider],
  props: {
    animation: String
  },
  data: {
    animation: "slide",
    clsActivated: "drk-transition-active",
    Animations: animations,
    Transitioner
  },
  computed: {
    animation({
      animation,
      Animations: animationRegistry
    }) {
      return {
        ...animationRegistry[animation] || animationRegistry.slide,
        name: animation
      };
    },
    transitionOptions() {
      return { animation: this.animation };
    }
  },
  observe: resize(),
  events: [
    {
      name: "itemshow",
      handler({ target }) {
        addClass(target, this.clsActive);
      }
    },
    {
      name: "itemshown",
      handler({ target }) {
        addClass(target, this.clsActivated);
      }
    },
    {
      name: "itemhidden",
      handler({ target }) {
        removeClass(target, this.clsActive, this.clsActivated);
      }
    }
  ]
});

var SliderPreload = defineMixin()({
  observe: lazyload({
    target: (instance) => isSliderPreloadInstance(instance) ? instance.slides : [],
    targets: (instance) => isSliderPreloadInstance(instance) ? instance.getAdjacentSlides().filter((slide) => slide instanceof HTMLElement) : []
  }),
  methods: {
    getAdjacentSlides() {
      return [1, -1].map((i) => this.slides[this.getIndex(this.index + i)]);
    }
  }
});
function isSliderPreloadInstance(instance) {
  return Array.isArray(instance.slides) && instance.slides.every((slide) => slide instanceof HTMLElement) && typeof instance.index === "number" && typeof instance.getIndex === "function" && typeof instance.getAdjacentSlides === "function";
}

var Animations = {
  ...animations,
  fade: {
    show() {
      return [{ opacity: 0, zIndex: 0 }, { zIndex: -1 }];
    },
    percent(current) {
      return 1 - Number(css(current, "opacity"));
    },
    translate(percent) {
      return [{ opacity: 1 - percent, zIndex: 0 }, { zIndex: -1 }];
    }
  },
  scale: {
    show() {
      return [{ opacity: 0, transform: scale3d(1 + 0.5), zIndex: 0 }, { zIndex: -1 }];
    },
    percent(current) {
      return 1 - Number(css(current, "opacity"));
    },
    translate(percent) {
      return [
        { opacity: 1 - percent, transform: scale3d(1 + 0.5 * percent), zIndex: 0 },
        { zIndex: -1 }
      ];
    }
  },
  pull: {
    show(dir) {
      return dir < 0 ? [
        { transform: translate(30), zIndex: -1 },
        { transform: translate(), zIndex: 0 }
      ] : [
        { transform: translate(-100), zIndex: 0 },
        { transform: translate(), zIndex: -1 }
      ];
    },
    percent(current, next, dir) {
      return dir < 0 ? 1 - translated(next) : translated(current);
    },
    translate(percent, dir) {
      return dir < 0 ? [
        { transform: translate(30 * percent), zIndex: -1 },
        { transform: translate(-100 * (1 - percent)), zIndex: 0 }
      ] : [
        { transform: translate(-percent * 100), zIndex: 0 },
        { transform: translate(30 * (1 - percent)), zIndex: -1 }
      ];
    }
  },
  push: {
    show(dir) {
      return dir < 0 ? [
        { transform: translate(100), zIndex: 0 },
        { transform: translate(), zIndex: -1 }
      ] : [
        { transform: translate(-30), zIndex: -1 },
        { transform: translate(), zIndex: 0 }
      ];
    },
    percent(current, next, dir) {
      return dir > 0 ? 1 - translated(next) : translated(current);
    },
    translate(percent, dir) {
      return dir < 0 ? [
        { transform: translate(percent * 100), zIndex: 0 },
        { transform: translate(-30 * (1 - percent)), zIndex: -1 }
      ] : [
        { transform: translate(-30 * percent), zIndex: -1 },
        { transform: translate(100 * (1 - percent)), zIndex: 0 }
      ];
    }
  }
};
function scale3d(value) {
  return `scale3d(${value}, ${value}, 1)`;
}

var Component = defineComponent()({
  mixins: [Class, Slideshow, SliderReactive, SliderParallax, SliderPreload],
  props: {
    ratio: String,
    minHeight: String,
    maxHeight: String
  },
  data: {
    ratio: "16:9",
    minHeight: void 0,
    maxHeight: void 0,
    selList: ".drk-slideshow-items",
    attrItem: "drk-slideshow-item",
    selNav: ".drk-slideshow-nav",
    Animations
  },
  watch: {
    list(value) {
      if (!(value instanceof HTMLElement)) {
        return;
      }
      css(value, {
        aspectRatio: this.ratio ? this.ratio.replace(":", "/") : void 0,
        minHeight: this.minHeight,
        maxHeight: this.maxHeight,
        width: "100%"
      });
    }
  },
  methods: {
    getAdjacentSlides() {
      return [1, -1].map((i) => this.slides[this.getIndex(this.index + i)]);
    }
  }
});

var name = 'slideshow';

if (typeof window !== "undefined" && window.Drake) {
  window.Drake.component(name, Component);
}

export { Component as default };
