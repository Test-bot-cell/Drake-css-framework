/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('drake-util')) :
    typeof define === 'function' && define.amd ? define('drakelightbox_panel', ['drake-util'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DrakeLightbox_panel = factory(global.Drake.util));
})(this, (function (util) { 'use strict';

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
    function parseOptions(value, args = []) {
      if (!util.isString(value) || !value) {
        return {};
      }
      try {
        if (util.startsWith(value, "{")) {
          const parsed = JSON.parse(value);
          return util.isObject(parsed) ? { ...parsed } : {};
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
    function defineComponent(options) {
      return ((component) => component);
    }
    function defineMixin(options) {
      return ((mixin) => mixin);
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
        util.fastdom.read(() => {
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
        if (result && util.isPlainObject(result)) {
          util.assign(data, result);
        }
        if (write && result !== false) {
          util.fastdom.write(() => {
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
          return util.observeResize(
            toElementInput$1(target),
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
        (target, handler, observerOptions, args) => util.observeIntersection(
          toElementInput$1(target),
          (entries, observer) => handler(entries, observer),
          isIntersectionOptions(observerOptions) ? observerOptions : void 0,
          isIntersectionArgs(args) ? args : void 0
        ),
        options
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
    function toElementInput$1(target) {
      return util.toNodes(target).filter((node) => node instanceof Element);
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

    defineComponent()({
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
        target: ({ $el, $props }) => $props.target ? [$el, ...util.queryAll($props.target, $el)] : $el
      }),
      methods: {
        load() {
          if (this.img) {
            return this.img;
          }
          const image = isImg(this.$el) ? this.$el : getImageFromElement(this.$el, this.dataSrc, this.sources);
          util.removeAttr(image, "loading");
          setSrcAttrs(this.$el, image.currentSrc);
          return this.img = image;
        }
      }
    });
    function setSrcAttrs(el, src) {
      if (isImg(el)) {
        const parentNode = util.parent(el);
        const elements = util.isTag(parentNode, "picture") ? util.children(parentNode) : [el];
        elements.forEach((element) => setSourceProps(element, element));
      } else if (src) {
        const change = !util.includes(el.style.backgroundImage, src);
        if (change) {
          util.css(el, "backgroundImage", `url(${util.escape(src)})`);
          util.trigger(el, util.createEvent("load", false));
        }
      }
    }
    const srcProps = ["data-src", "data-srcset", "sizes"];
    function setSourceProps(sourceEl, targetEl) {
      for (const prop of srcProps) {
        const value = util.data(sourceEl, prop);
        if (value) {
          util.attr(targetEl, prop.replace(/data-/g, ""), value);
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
          util.attr(source, attrs);
          util.append(picture, source);
        }
        util.append(picture, img);
      }
    }
    function parseSources(sources) {
      if (!sources) {
        return [];
      }
      let parsedSources = sources;
      if (util.isString(sources)) {
        if (util.startsWith(sources, "[")) {
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
      const sourceList = util.isArray(parsedSources) ? parsedSources : [parsedSources];
      return sourceList.filter(isSourceAttributes).filter((source) => !util.isEmpty(source));
    }
    function isSourceInput(value) {
      return isSourceAttributes(value) || util.isArray(value) && value.every(isSourceAttributes);
    }
    function isSourceAttributes(value) {
      return util.isObject(value) && Object.values(value).every(
        (attribute) => attribute === null || ["string", "number", "boolean"].includes(typeof attribute)
      );
    }
    function isImg(el) {
      return util.isTag(el, "img");
    }

    function awaitFrame() {
      return new Promise((resolve) => requestAnimationFrame(resolve));
    }

    const hyphenateRe = /\B([A-Z])/g;
    const hyphenate = memoize(
      (value) => value.replace(hyphenateRe, "-$1").toLowerCase()
    );
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
    function isFunction(value) {
      return typeof value === "function";
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
    function isElement(value) {
      return nodeType(value) === 1;
    }
    function nodeType(value) {
      return !isWindow(value) && isObject(value) && typeof value.nodeType === "number" ? value.nodeType : 0;
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
    function isUndefined(value) {
      return value === void 0;
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
    function sumBy(array, iteratee) {
      return array.reduce((sum, item) => {
        const value = isFunction(iteratee) ? iteratee(item) : isObject(item) ? item[iteratee] : item;
        return sum + toFloat(value);
      }, 0);
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
          if (isAttributeValue$1(attributeValue)) {
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
    function isAttributeValue$1(value) {
      return ["string", "number", "boolean"].includes(typeof value) || value === null;
    }
    function removeAttr(element, name) {
      toNodes(element).forEach((item) => item.removeAttribute(name));
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
        {
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
          const result = (_a = void 0 ) != null ? _a : true;
          if (result) {
            teardown();
            listener(event, result);
          }
        }),
        capture
      );
      return teardown;
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

    const dirs = {
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
      const currentOffset = dimensions(element);
      if (element) {
        const { scrollY, scrollX } = toWindow(element);
        currentOffset.top += scrollY;
        currentOffset.bottom += scrollY;
        currentOffset.left += scrollX;
        currentOffset.right += scrollX;
      }
      {
        return currentOffset;
      }
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
        dirs[property],
        (side) => toFloat(css(element, `padding-${side}`)) + toFloat(css(element, `border-${side}-width`))
      ) : 0;
    }
    function toHtmlElement(value) {
      const node = toNode(value);
      return node instanceof HTMLElement ? node : void 0;
    }
    function toElementInput(value) {
      return isElement(value) ? value : void 0;
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
      const viewportElement = useWindow ? documentScroller === documentElement || documentScroller.clientHeight < body.clientHeight ? documentScroller : body : (_a = firstHtmlElement$1(scrollElement)) != null ? _a : documentScroller;
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
    function firstHtmlElement$1(element) {
      const node = firstElement(element);
      return node instanceof HTMLElement ? node : void 0;
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

    var Class = defineMixin()({
      connected() {
        this._cmpCls = util.hasClass(this.$el, this.$options.id);
        util.addClass(this.$el, this.$options.id);
      },
      disconnected() {
        if (!this._cmpCls) {
          util.removeClass(this.$el, this.$options.id);
        }
      }
    });

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
            return container ? util.$(container) : "";
          }
          return container ? util.$(container) : false;
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
        hasTransition: ({ animation }) => ["slide", "reveal"].some((transition) => util.startsWith(animation[0], transition))
      },
      methods: {
        async toggleElement(targets, toggle, animate) {
          const CANCELLED = {};
          return (await Promise.all(
            util.toNodes(targets).map((el) => {
              if (!(el instanceof HTMLElement)) {
                return CANCELLED;
              }
              const show = util.isBoolean(toggle) ? toggle : !this.isToggled(el);
              if (!util.trigger(el, `before${show ? "show" : "hide"}`, [this])) {
                return CANCELLED;
              }
              const handler = typeof animate === "function" ? animate : animate === false || !this.hasAnimation ? toggleInstant : this.hasTransition ? toggleTransition : toggleAnimation;
              const promise = handler(el, show, this);
              const cls = show ? this.clsEnter : this.clsLeave;
              util.addClass(el, cls);
              util.trigger(el, show ? "show" : "hide", [this]);
              const done = () => {
                var _a;
                util.removeClass(el, cls);
                util.trigger(el, show ? "shown" : "hidden", [this]);
                if (show) {
                  (_a = util.$$("[autofocus]", el).find(util.isVisible)) == null ? void 0 : _a.focus({ preventScroll: true });
                }
              };
              return promise ? promise.then(done, () => {
                util.removeClass(el, cls);
                return CANCELLED;
              }) : done();
            })
          )).every((r) => r !== CANCELLED);
        },
        isToggled(element = this.$el) {
          const el = util.toNode(element);
          return util.hasClass(el, this.clsEnter) ? true : util.hasClass(el, this.clsLeave) ? false : this.cls ? util.hasClass(el, this.cls.split(" ")[0]) : util.isVisible(el);
        },
        _toggle(el, toggled) {
          if (!el) {
            return;
          }
          toggled = Boolean(toggled);
          let changed;
          if (this.cls) {
            changed = util.includes(this.cls, " ") || toggled !== util.hasClass(el, this.cls);
            if (changed) {
              util.toggleClass(el, this.cls, util.includes(this.cls, " ") ? void 0 : toggled);
            }
          } else {
            changed = toggled === el.hidden;
            if (changed) {
              el.hidden = !toggled;
            }
          }
          if (changed) {
            util.trigger(el, "toggled", [toggled, this]);
          }
        }
      }
    });
    function toggleInstant(el, show, { _toggle }) {
      util.Animation.cancel(el);
      util.Transition.cancel(el);
      return _toggle(el, show);
    }
    async function toggleTransition(el, show, { animation, duration, velocity, transition, _toggle }) {
      const [mode = "reveal", startProp = "top"] = typeof animation[0] === "string" ? animation[0].split("-") : [];
      const dirs = [
        ["left", "right"],
        ["top", "bottom"]
      ];
      const dir = dirs[util.includes(dirs[0], startProp) ? 0 : 1];
      const end = dir[1] === startProp;
      const dimProp = dir === dirs[0] ? "width" : "height";
      const marginProp = `margin-${dir[0]}`;
      const marginStartProp = `margin-${startProp}`;
      let currentDim = util.dimensions(el)[dimProp];
      const inProgress = util.Transition.inProgress(el);
      await util.Transition.cancel(el);
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
        previousPropertyNames.map((key) => [key, el.style.getPropertyValue(util.propName(key))])
      );
      const dim = util.dimensions(el);
      const currentMargin = util.toFloat(util.css(el, marginProp));
      const marginStart = util.toFloat(util.css(el, marginStartProp));
      const endDim = dim[dimProp] + marginStart;
      if (!inProgress && !show) {
        currentDim += marginStart;
      }
      const [wrapper] = util.wrapInner(el, "<div>");
      if (!(wrapper instanceof HTMLElement)) {
        return;
      }
      util.css(wrapper, {
        boxSizing: "border-box",
        height: dim.height,
        width: dim.width,
        ...util.css(el, [
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
      util.css(el, {
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
        util.css(el, marginProp, endDim - currentDim + currentMargin);
        endProps[marginProp] = show ? currentMargin : endDim + currentMargin;
      }
      if (!end !== (mode === "reveal")) {
        util.css(wrapper, marginProp, -endDim + currentDim);
        util.Transition.start(wrapper, { [marginProp]: show ? 0 : -endDim }, duration, transition);
      }
      try {
        await util.Transition.start(el, endProps, duration, transition);
      } finally {
        util.css(el, prevProps);
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
        return util.Animation.in(el, toAnimationName(animation[0]), duration, cmp.origin || void 0);
      }
      return util.Animation.out(
        el,
        toAnimationName(animation[1] || animation[0]),
        duration,
        cmp.origin || void 0
      ).then(() => _toggle(el, false));
    }
    function toAnimationName(value) {
      return typeof value === "string" ? value : "";
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
        panel: ({ selPanel }, $el) => util.$(selPanel, $el),
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
        if (util.includes(active, this)) {
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
            if (!defaultPrevented && hash && util.isSameSiteAnchor(current) && !this.$el.contains((_a = util.$(hash)) != null ? _a : null)) {
              void this.hide();
            } else if (util.matches(current, this.selClose)) {
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
            if (this.isToggled() === util.includes(active, this)) {
              void this.toggle();
            }
          }
        },
        {
          name: "beforeshow",
          self: true,
          handler(e) {
            if (util.includes(active, this)) {
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
              util.css(this.$el, "zIndex", util.toFloat(util.css(this.$el, "zIndex")) + active.length);
            }
            const handlers = [
              this.overlay && preventBackgroundFocus(this),
              this.overlay && preventBackgroundScroll(this.$el),
              this.bgClose && listenForBackgroundClose(this),
              this.escClose && listenForEscClose(this)
            ];
            util.once(
              this.$el,
              "hidden",
              () => handlers.forEach((handler) => handler && handler()),
              { self: true }
            );
            util.addClass(document.documentElement, this.clsPage);
            setAriaExpanded(this.target, true);
          }
        },
        {
          name: "shown",
          self: true,
          handler() {
            if (!util.isFocusable(this.$el)) {
              this.$el.tabIndex = -1;
            }
            if (!util.matches(this.$el, ":focus-within")) {
              this.$el.focus();
            }
          }
        },
        {
          name: "hidden",
          self: true,
          handler() {
            if (util.includes(active, this)) {
              active.splice(active.indexOf(this), 1);
            }
            util.css(this.$el, "zIndex", "");
            const { target } = this;
            if (!active.some((modal) => modal.clsPage === this.clsPage)) {
              util.removeClass(document.documentElement, this.clsPage);
              queueMicrotask(() => {
                if (target && util.isFocusable(target)) {
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
          if (this.container && util.parent(this.$el) !== this.container) {
            util.append(this.container, this.$el);
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
        (resolve, reject) => util.once(el, "show hide", () => {
          var _a;
          (_a = rejectors.get(el)) == null ? void 0 : _a();
          rejectors.set(el, reject);
          _toggle(el, show);
          const off = util.once(
            transitionElement,
            "transitionstart",
            () => {
              util.once(transitionElement, "transitionend transitioncancel", () => resolve(), {
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
            toMs(util.css(transitionElement, "transitionDuration"))
          );
        })
      ).then(() => {
        rejectors.delete(el);
      });
    }
    function toMs(time) {
      return time ? util.endsWith(time, "ms") ? util.toFloat(time) : util.toFloat(time) * 1e3 : 0;
    }
    function preventBackgroundFocus(modal) {
      return util.on(document, "focusin", (e) => {
        if (!(e.target instanceof Element) || util.last(active) !== modal || modal.$el.contains(e.target)) {
          return;
        }
        const { left, top, width, height } = util.dimensions(e.target);
        const topEl = document.elementFromPoint(left + width / 2, top + height / 2);
        if (topEl && (e.target.contains(topEl) || topEl.contains(e.target))) {
          return;
        }
        modal.$el.focus();
      });
    }
    function listenForBackgroundClose(modal) {
      return util.on(document, util.pointerDown, ({ target }) => {
        if (!(target instanceof Element)) {
          return;
        }
        if (util.last(active) !== modal || modal.overlay && !modal.$el.contains(target) || !modal.panel || modal.panel.contains(target)) {
          return;
        }
        util.once(
          document,
          `${util.pointerUp} ${util.pointerCancel} scroll`,
          ({ defaultPrevented, type, target: newTarget }) => {
            if (!defaultPrevented && type === util.pointerUp && target === newTarget) {
              void modal.hide();
            }
          },
          true
        );
      });
    }
    function listenForEscClose(modal) {
      return util.on(document, "keydown", (e) => {
        if (e.keyCode === 27 && util.last(active) === modal) {
          void modal.hide();
        }
      });
    }
    function setAriaExpanded(el, toggled) {
      if (el == null ? void 0 : el.ariaExpanded) {
        el.ariaExpanded = String(toggled);
      }
    }

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
      return Math.abs(new DOMMatrix(util.css(el, "transform")).m41 / el.offsetWidth);
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
          duration -= Math.round(duration * util.clamp(initialPercent, -1, 1));
          this.translate(initialPercent);
          triggerUpdate(next, "itemin", { percent: initialPercent, duration, timing, dir });
          triggerUpdate(prev, "itemout", {
            percent: 1 - initialPercent,
            duration,
            timing,
            dir
          });
          Promise.all([
            util.Transition.start(next, props[1], duration, timing),
            util.Transition.start(prev, props[0], duration, timing)
          ]).then(() => {
            this.reset();
            resolve(void 0);
          }, util.noop);
          return promise;
        },
        cancel() {
          return util.Transition.cancel([next, prev].filter(isHtmlElement));
        },
        reset() {
          util.resetProps([next, prev].filter(isHtmlElement), props[0]);
        },
        async forward(duration, initialPercent = this.percent()) {
          await this.cancel();
          return this.show(duration, initialPercent, true);
        },
        translate(initialPercent) {
          this.reset();
          const translatedProps = translate(initialPercent, dir);
          util.css(next, translatedProps[1]);
          util.css(prev, translatedProps[0]);
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
      util.trigger(el, util.createEvent(type, false, false, data));
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
        util.attr(this.list, "aria-live", this.autoplay ? "off" : "polite");
        if (this.autoplay) {
          this.startAutoplay();
        }
      },
      disconnected() {
        this.stopAutoplay();
      },
      update() {
        util.attr(this.slides, "tabindex", "-1");
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
            if (!(this.stack.length || !util.isVisible(this.$el) || this.draggable && util.matches(this.$el, ":focus-within") && !util.matches(this.$el, ":focus") || this.pauseOnHover && util.matches(this.$el, ":hover"))) {
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
            const pos = util.getEventPos(e);
            if (util.isRtl) {
              pos.x = -pos.x;
            }
            this.prevPos = util.isEqual(pos, this.pos) ? this.prevPos : this.pos;
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
            if (!this.draggable || this.parallax || !util.isTouch(e) && hasSelectableText(e.target) || e.target.closest(util.selInput) || ((_a = e.button) != null ? _a : 0) > 0 || this.length < 2) {
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
          handler: util.noop,
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
          util.on(document, pointerMove, this.move, pointerOptions);
          util.on(document, pointerUp, this.end, { passive: true, capture: true, once: true });
          util.css(this.list, "userSelect", "none");
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
            if (!util.includes([nextIndex, prevIndex], i)) {
              util.trigger(slides[i], "itemhidden", [this]);
              if (edge) {
                itemShown = true;
                this.prevIndex = prevIndex;
              }
            }
          }
          if (this.index === prevIndex && this.prevIndex !== prevIndex || itemShown) {
            util.trigger(slides[this.index], "itemshown", [this]);
          }
          if (changed) {
            this.prevIndex = prevIndex;
            this.index = nextIndex;
            if (!edge) {
              util.trigger(prev, "beforeitemhide", [this]);
              util.trigger(prev, "itemhide", [this]);
            }
            util.trigger(next, "beforeitemshow", [this]);
            util.trigger(next, "itemshow", [this]);
          }
          this._transitioner = this._translate(Math.abs(this.percent), prev, !edge && next);
        },
        end() {
          var _a, _b;
          util.off(document, pointerMove, this.move, pointerOptions);
          if (this.dragging) {
            setTimeout(util.on(this.list, "click", (e) => e.preventDefault(), pointerOptions));
            this.dragging = null;
            if (this.index === this.prevIndex) {
              this.percent = 1 - ((_a = this.percent) != null ? _a : 0);
              this.dir *= -1;
              this._show(false, this.index, true);
              this._transitioner = null;
            } else {
              const dirChange = this.dir < 0 === this.prevPos.x > this.pos.x;
              if (dirChange) {
                util.trigger(this.slides[this.prevIndex], "itemhidden", [this]);
                util.trigger(this.slides[this.index], "itemshown", [this]);
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
          util.css(this.list, { userSelect: "" });
          this.drag = this.percent = null;
        }
      }
    });
    function getDistance(prev, next) {
      var _a;
      return this._getTransitioner(prev, prev !== next && next).getDistance() || ((_a = this.slides[prev]) == null ? void 0 : _a.offsetWidth) || 0;
    }
    function hasSelectableText(el) {
      return util.css(el, "userSelect") !== "none" && util.toArray(el.childNodes).some(
        (child) => {
          var _a;
          return child.nodeType === 3 && Boolean((_a = child.textContent) == null ? void 0 : _a.trim());
        }
      );
    }
    function getAngle(pos1, pos2) {
      return Math.atan2(Math.abs(pos2.y - pos1.y), Math.abs(pos2.x - pos1.x)) * 180 / Math.PI;
    }

    util.memoize((id, props) => {
      const attributes = Object.keys(props);
      const filter = attributes.concat(id).filter(Boolean).flatMap((key) => [util.hyphenate(key), `data-${util.hyphenate(key)}`]);
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
        nav: ({ selNav }, $el) => selNav ? util.$$(selNav, $el) : [],
        navChildren() {
          return this.nav.flatMap((nav) => util.children(nav)).filter((item) => item instanceof HTMLElement);
        },
        selNavItem: ({ attrItem }) => `[${attrItem}],[data-${attrItem}]`,
        navItems(_data, $el) {
          return util.$$(this.selNavItem, $el);
        }
      },
      watch: {
        nav(nav, prev) {
          util.attr(nav, "role", "tablist");
          this.padNavitems();
          if (prev) {
            this.$emit();
          }
        },
        list(list) {
          if (util.isTag(list, "ul")) {
            util.attr(list, "role", "presentation");
          }
        },
        navChildren(items) {
          util.attr(items, "role", "presentation");
          this.padNavitems();
          this.updateNav();
        },
        navItems(items) {
          for (const el of items) {
            const cmd = util.data(el, this.attrItem);
            const button = util.$("a,button", el) || el;
            let ariaLabel;
            let ariaControls = null;
            if (util.isNumeric(cmd)) {
              const item = util.toNumber(cmd);
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
              ariaLabel = this.t("slideX", util.toFloat(cmd) + 1);
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
            util.attr(button, "aria-controls", ariaControls);
            button.ariaLabel = button.ariaLabel || ariaLabel;
          }
        },
        slides(slides) {
          slides.forEach(
            (slide, i) => util.attr(slide, {
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
              const command = toSliderIndex(util.data(e.current, this.attrItem));
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
            const cmd = util.data(current, this.attrItem);
            if (!util.isNumeric(cmd)) {
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
            const cmd = util.data(el, this.attrItem);
            const button = util.$("a,button", el) || el;
            if (util.isNumeric(cmd)) {
              const item = util.toNumber(cmd);
              if (item === false) {
                continue;
              }
              const active = item === index;
              util.toggleClass(el, this.clsActive, active);
              util.toggleClass(button, "drk-disabled", !!this.parallax);
              button.ariaSelected = String(active);
              button.tabIndex = active && !this.parallax ? 0 : -1;
              if (active && button && util.matches(util.parent(el), ":focus-within")) {
                button.focus();
              }
            } else {
              util.toggleClass(
                el,
                "drk-invisible",
                this.finite && (cmd === "previous" && index === 0 || cmd === "next" && index >= this.maxIndex)
              );
            }
          }
        },
        padNavitems() {
          for (const nav of this.nav) {
            const navChildren = util.children(nav);
            const navItems = [];
            for (let i = 0; i < this.length; i++) {
              const attr2 = `${this.attrItem}="${i}"`;
              const existing = [...navChildren].reverse().find((element) => element.matches(`[${attr2}]`));
              const created = util.$(`<li ${attr2}><a href></a></li>`);
              const item = existing || created;
              if (item) {
                navItems[i] = item;
              }
            }
            if (!util.isEqual(navItems, navChildren)) {
              util.html(nav, navItems);
            }
          }
        }
      }
    });
    function toSliderIndex(value) {
      if (util.isNumeric(value)) {
        const number = util.toNumber(value);
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
        util.removeClass(this.slides, this.clsActive);
      },
      computed: {
        duration: ({ velocity }, $el) => speedUp($el.offsetWidth / velocity),
        list: ({ selList }, $el) => util.$(selList, $el),
        maxIndex() {
          return this.length - 1;
        },
        slides() {
          return util.children(this.list).filter(
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
            util.addClass(target, this.clsEnter, this.clsSlideActive);
          }
        },
        {
          name: "itemshown",
          handler({ target }) {
            util.removeClass(target, this.clsEnter);
          }
        },
        {
          name: "itemhide",
          handler({ target }) {
            util.addClass(target, this.clsLeave);
          }
        },
        {
          name: "itemhidden",
          handler({ target }) {
            util.removeClass(target, this.clsLeave, this.clsSlideActive);
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
          const prev = util.hasClass(this.slides, this.clsActive) && this.slides[prevIndex];
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
          if (prev && !util.trigger(prev, "beforeitemhide", [this]) || !util.trigger(next, "beforeitemshow", [this, prev])) {
            this.index = this.prevIndex;
            reset();
            return;
          }
          if (prev) {
            util.trigger(prev, "itemhide", [this]);
          }
          util.trigger(next, "itemshow", [this]);
          await this._show(prev, next, force);
          if (prev) {
            util.trigger(prev, "itemhidden", [this]);
          }
          util.trigger(next, "itemshown", [this]);
          stack.shift();
          this._transitioner = null;
          await awaitFrame();
          const queued = stack.shift();
          if (queued !== void 0) {
            void this.show(queued, true);
          }
        },
        getIndex(index = this.index, prev = this.index) {
          return util.clamp(
            util.getIndex(index, this.slides, prev, this.finite),
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
            util.isNumber(prev) ? this.slides[prev] : prev || void 0,
            util.isNumber(next) ? this.slides[next] : next || void 0,
            dir * (util.isRtl ? -1 : 1),
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
            util.addClass(target, this.clsActive);
          }
        },
        {
          name: "itemshown",
          handler({ target }) {
            util.addClass(target, this.clsActivated);
          }
        },
        {
          name: "itemhidden",
          handler({ target }) {
            util.removeClass(target, this.clsActive, this.clsActivated);
          }
        }
      ]
    });

    ({
      ...animations});
    function scale3d(value) {
      return `scale3d(${value}, ${value}, 1)`;
    }

    var Animations = {
      ...animations,
      fade: {
        show() {
          return [{ opacity: 0 }, { opacity: 1 }];
        },
        percent(current) {
          return 1 - Number(util.css(current, "opacity"));
        },
        translate(percent) {
          return [{ opacity: 1 - percent }, { opacity: percent }];
        }
      },
      scale: {
        show() {
          return [
            { opacity: 0, transform: scale3d(1 - 0.2) },
            { opacity: 1, transform: scale3d(1) }
          ];
        },
        percent(current) {
          return 1 - Number(util.css(current, "opacity"));
        },
        translate(percent) {
          return [
            { opacity: 1 - percent, transform: scale3d(1 - 0.2 * percent) },
            { opacity: percent, transform: scale3d(1 - 0.2 + 0.2 * percent) }
          ];
        }
      }
    };

    var Component = defineComponent()({
      i18n: {
        counter: "%s / %s"
      },
      mixins: [Modal, Slideshow],
      functional: true,
      props: {
        counter: Boolean,
        preload: Number,
        nav: Boolean,
        slidenav: Boolean,
        delayControls: Number,
        videoAutoplay: Boolean,
        template: String
      },
      data: () => ({
        counter: false,
        preload: 1,
        nav: false,
        slidenav: true,
        delayControls: 3e3,
        videoAutoplay: false,
        items: [],
        cls: "drk-open",
        clsPage: "drk-lightbox-page",
        clsFit: "drk-lightbox-items-fit",
        clsZoom: "drk-lightbox-zoom",
        attrItem: "drk-lightbox-item",
        selList: ".drk-lightbox-items",
        selClose: ".drk-close-large",
        selNav: ".drk-lightbox-thumbnav, .drk-lightbox-dotnav",
        selCaption: ".drk-lightbox-caption",
        selCounter: ".drk-lightbox-counter",
        pauseOnHover: false,
        velocity: 2,
        Animations,
        template: `<div class="drk-lightbox drk-overflow-hidden">  <div class="drk-lightbox-items"></div>  <div class="drk-position-top-right drk-position-small drk-transition-fade" drk-inverse>  <button class="drk-lightbox-close drk-close-large" type="button" drk-close></button>  </div>  <div class="drk-lightbox-slidenav drk-position-center-left drk-position-medium drk-transition-fade" drk-inverse>  <a href drk-slidenav-previous drk-lightbox-item="previous"></a>  </div>  <div class="drk-lightbox-slidenav drk-position-center-right drk-position-medium drk-transition-fade" drk-inverse>  <a href drk-slidenav-next drk-lightbox-item="next"></a>  </div>  <div class="drk-position-center-right drk-position-medium drk-transition-fade" drk-inverse style="max-height: 90vh; overflow: auto;">  <ul class="drk-lightbox-thumbnav drk-lightbox-thumbnav-vertical drk-thumbnav drk-thumbnav-vertical"></ul>  <ul class="drk-lightbox-dotnav drk-dotnav drk-dotnav-vertical"></ul>  </div>  <div class="drk-lightbox-counter drk-text-large drk-position-top-left drk-position-small drk-transition-fade" drk-inverse></div>  <div class="drk-lightbox-caption drk-position-bottom drk-text-center drk-transition-slide-bottom drk-transition-opaque"></div>  </div>`
      }),
      created() {
        var _a;
        let $el = util.$(this.template);
        if (!$el) {
          return;
        }
        if (util.isTag($el, "template")) {
          $el = firstHtmlElement(util.fragment((_a = util.html($el)) != null ? _a : ""));
        }
        if (!$el) {
          return;
        }
        const list = util.$(this.selList, $el);
        if (!list) {
          return;
        }
        const navType = this.$props.nav;
        util.remove(util.$$(this.selNav, $el).filter((el) => !util.matches(el, `.drk-${navType}`)));
        for (const [i, item] of this.items.entries()) {
          util.append(list, "<div>");
          if (navType === "thumbnav") {
            const nav = util.$(this.selNav, $el);
            const navItem = nav ? util.append(nav, `<li drk-lightbox-item="${i}"><a href></a></li>`) : void 0;
            if (navItem instanceof Element) {
              util.wrapAll(toThumbnavItem(item, this.videoAutoplay), navItem);
            }
          }
        }
        if (!this.slidenav) {
          util.remove(util.$$(".drk-lightbox-slidenav", $el));
        }
        if (!this.counter) {
          util.remove(util.$(this.selCounter, $el));
        }
        util.addClass(list, this.clsFit);
        const close = util.$("[drk-close]", $el);
        const closeLabel = this.t("close");
        if (close && closeLabel) {
          close.dataset.i18n = JSON.stringify({ label: closeLabel });
        }
        util.append(this.container, $el);
        this.$mount($el);
      },
      events: [
        {
          name: "click",
          self: true,
          filter: ({ bgClose }) => bgClose,
          delegate: ({ selList }) => `${selList} > *`,
          handler(e) {
            if (!e.defaultPrevented) {
              this.hide();
            }
          }
        },
        {
          name: "click",
          self: true,
          delegate: ({ clsZoom }) => `.${clsZoom}`,
          handler(e) {
            if (!e.defaultPrevented) {
              util.toggleClass(this.list, this.clsFit);
            }
          }
        },
        {
          name: `${util.pointerMove} ${util.pointerDown} keydown`,
          filter: ({ delayControls }) => Boolean(delayControls),
          handler() {
            this.showControls();
          }
        },
        {
          name: "shown",
          self: true,
          handler() {
            this.showControls();
          }
        },
        {
          name: "hide",
          self: true,
          handler() {
            this.hideControls();
            util.removeClass(this.slides, this.clsActive);
            util.Transition.stop(this.slides);
          }
        },
        {
          name: "hidden",
          self: true,
          handler() {
            this.$destroy(true);
          }
        },
        {
          name: "keyup",
          el: () => document,
          handler(event) {
            if (!this.isToggled() || !this.draggable) {
              return;
            }
            if (!(event instanceof KeyboardEvent)) {
              return;
            }
            const { keyCode } = event;
            let index;
            if (keyCode === keyMap.LEFT) {
              index = "previous";
            } else if (keyCode === keyMap.RIGHT) {
              index = "next";
            } else if (keyCode === keyMap.HOME) {
              index = 0;
            } else if (keyCode === keyMap.END) {
              index = "last";
            }
            if (index !== void 0) {
              void this.show(index);
            }
          }
        },
        {
          name: "beforeitemshow",
          handler(e) {
            util.html(util.$(this.selCaption, this.$el), this.getItem().caption || "");
            util.html(
              util.$(this.selCounter, this.$el),
              this.t("counter", this.index + 1, this.slides.length)
            );
            for (let j = -this.preload; j <= this.preload; j++) {
              this.loadItem(this.index + j);
            }
            if (this.isToggled()) {
              return;
            }
            this.draggable = false;
            e.preventDefault();
            this.toggleElement(this.$el, true, false);
            this.animation = Animations.scale;
            if (e.target instanceof Element) {
              util.removeClass(e.target, this.clsActive);
            }
            this.stack.splice(1, 0, this.index);
          }
        },
        {
          name: "itemshown",
          handler() {
            this.draggable = this.$props.draggable;
          }
        },
        {
          name: "itemload",
          async handler(_event, value) {
            var _a, _b, _c;
            if (!isLightboxItem(value)) {
              return;
            }
            const item = value;
            const { source: src, type } = item;
            const attrs = toAttributes(item.attrs);
            this.setItem(item, "<span drk-spinner drk-inverse></span>");
            if (!src) {
              return;
            }
            let matches2;
            const iframeAttrs = {
              allowfullscreen: "",
              style: "max-width: 100%; box-sizing: border-box;",
              "drk-responsive": "",
              "drk-video": Boolean(this.videoAutoplay)
            };
            if (type === "image" || isImage(src)) {
              const img = createEl("img");
              wrapInPicture(img, (_a = item.sources) != null ? _a : false);
              util.attr(img, {
                src,
                ...getImageAttributes(item),
                ...attrs
              });
              util.on(img, "load", () => this.setItem(item, util.parent(img) || img));
              util.on(img, "error", () => this.setError(item));
            } else if (type === "video" || isVideo(src)) {
              const inline = this.videoAutoplay === "inline";
              const video = createEl("video", {
                src,
                playsinline: "",
                controls: inline ? null : "",
                loop: inline ? "" : null,
                muted: inline ? "" : null,
                poster: this.videoAutoplay ? null : (_b = item.poster) != null ? _b : null,
                "drk-video": Boolean(this.videoAutoplay),
                ...attrs
              });
              util.on(video, "loadedmetadata", () => this.setItem(item, video));
              util.on(video, "error", () => this.setError(item));
            } else if (type === "iframe" || src.match(/\.(html|php)($|\?)/i)) {
              this.setItem(
                item,
                createEl("iframe", {
                  src,
                  allowfullscreen: "",
                  class: "drk-lightbox-iframe",
                  ...attrs
                })
              );
            } else if (matches2 = src.match(
              /\/\/(?:.*?youtube(-nocookie)?\..*?(?:[?&]v=|\/shorts\/)|youtu\.be\/)([\w-]{11})[&?]?(.*)?/
            )) {
              this.setItem(
                item,
                createEl("iframe", {
                  src: `https://www.youtube${matches2[1] || ""}.com/embed/${(_c = matches2[2]) != null ? _c : ""}${matches2[3] ? `?${matches2[3]}` : ""}`,
                  width: 1920,
                  height: 1080,
                  ...iframeAttrs,
                  ...attrs
                })
              );
            } else if (matches2 = src.match(/\/\/.*?vimeo\.[a-z]+\/(\d+)[&?]?(.*)?/)) {
              try {
                const response = await fetch(
                  `https://vimeo.com/api/oembed.json?maxwidth=1920&url=${encodeURI(src)}`,
                  { credentials: "omit" }
                );
                const metadata = await response.json();
                if (!isMediaDimensions(metadata)) {
                  throw new TypeError("Invalid Vimeo oEmbed dimensions");
                }
                const { height, width } = metadata;
                this.setItem(
                  item,
                  createEl("iframe", {
                    src: `https://player.vimeo.com/video/${matches2[1]}${matches2[2] ? `?${matches2[2]}` : ""}`,
                    width,
                    height,
                    ...iframeAttrs,
                    ...attrs
                  })
                );
              } catch {
                this.setError(item);
              }
            }
          }
        },
        {
          name: "itemloaded",
          handler() {
            this.$emit("resize");
          }
        }
      ],
      update: {
        read() {
          for (const media of util.$$(
            `${this.selList} :not([controls]):is(img,video)`,
            this.$el
          )) {
            const isImage2 = media instanceof HTMLImageElement;
            util.toggleClass(
              media,
              this.clsZoom,
              (isImage2 ? media.naturalHeight : media.videoHeight) - this.$el.offsetHeight > Math.max(
                0,
                (isImage2 ? media.naturalWidth : media.videoWidth) - this.$el.offsetWidth
              )
            );
          }
        },
        events: ["resize"]
      },
      methods: {
        loadItem(index = this.index) {
          const item = this.getItem(index);
          if (!this.getSlide(item).childElementCount) {
            util.trigger(this.$el, "itemload", [item]);
          }
        },
        getItem(index = this.index) {
          const item = this.items[util.getIndex(index, this.slides)];
          if (!item) {
            throw new RangeError("Lightbox item index is out of range");
          }
          return item;
        },
        setItem(item, content) {
          util.trigger(this.$el, "itemloaded", [this, util.html(this.getSlide(item), content)]);
        },
        getSlide(item) {
          const slide = this.slides[this.items.indexOf(item)];
          if (!slide) {
            throw new RangeError("Lightbox slide is missing");
          }
          return slide;
        },
        setError(item) {
          this.setItem(item, '<span drk-icon="icon: bolt; ratio: 2" drk-inverse></span>');
        },
        showControls() {
          clearTimeout(this.controlsTimer);
          this.controlsTimer = this.delayControls ? setTimeout(this.hideControls, this.delayControls) : void 0;
          util.addClass(this.$el, "drk-active", "drk-transition-active");
        },
        hideControls() {
          util.removeClass(this.$el, "drk-active", "drk-transition-active");
        }
      }
    });
    function createEl(tag, attrs = {}) {
      const el = document.createElement(tag);
      util.attr(el, attrs);
      return el;
    }
    function toThumbnavItem(item, videoAutoplay) {
      const el = item.poster || item.thumb && (item.type === "image" || isImage(item.thumb)) ? createEl("img", { src: item.poster || item.thumb || "", alt: "" }) : item.thumb && (item.type === "video" || isVideo(item.thumb)) ? createEl("video", {
        src: item.thumb,
        loop: "",
        playsinline: "",
        muted: "",
        "drk-video": videoAutoplay === "inline"
      }) : createEl("canvas");
      if (item.thumbRatio) {
        el.style.aspectRatio = String(item.thumbRatio);
      }
      return el;
    }
    function isImage(src) {
      return Boolean(src == null ? void 0 : src.match(/\.(avif|jpe?g|jfif|a?png|gif|svg|webp)($|\?)/i));
    }
    function isVideo(src) {
      return Boolean(src == null ? void 0 : src.match(/\.(mp4|webm|ogv)($|\?)/i));
    }
    function firstHtmlElement(value) {
      if (value instanceof HTMLElement) {
        return value;
      }
      return Array.isArray(value) ? value.find((node) => node instanceof HTMLElement) : void 0;
    }
    function isLightboxItem(value) {
      if (!isRecord(value)) {
        return false;
      }
      return (value.source === void 0 || typeof value.source === "string") && (value.type === void 0 || typeof value.type === "string") && (value.attrs === void 0 || isAttributes(value.attrs));
    }
    function toAttributes(value) {
      if (!isRecord(value)) {
        return {};
      }
      return Object.fromEntries(
        Object.entries(value).filter(
          (entry) => isAttributeValue(entry[1])
        )
      );
    }
    function isAttributes(value) {
      return isRecord(value) && Object.values(value).every(isAttributeValue);
    }
    function isAttributeValue(value) {
      return value === null || ["string", "number", "boolean"].includes(typeof value);
    }
    function getImageAttributes(item) {
      return toAttributes({ alt: item.alt, srcset: item.srcset, sizes: item.sizes });
    }
    function isMediaDimensions(value) {
      return isRecord(value) && typeof value.width === "number" && typeof value.height === "number";
    }
    function isRecord(value) {
      return typeof value === "object" && value !== null;
    }

    var name = 'lightboxPanel';

    if (typeof window !== "undefined" && window.Drake) {
      window.Drake.component(name, Component);
    }

    return Component;

}));
