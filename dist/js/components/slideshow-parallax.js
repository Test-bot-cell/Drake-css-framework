/*! Drake.css framework 0.1.0 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('drake-util')) :
    typeof define === 'function' && define.amd ? define('drakeslideshow_parallax', ['drake-util'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DrakeSlideshow_parallax = factory(global.Drake.util));
})(this, (function (drakeUtil) { 'use strict';

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
            drakeUtil.trigger(this.$el, drakeUtil.createEvent("mediachange", false, true, [this.mediaObj]));
          };
          this.offMediaObj = drakeUtil.on(this.mediaObj, "change", () => {
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
      if (drakeUtil.isString(value)) {
        if (drakeUtil.startsWith(value, "@")) {
          value = drakeUtil.toFloat(drakeUtil.css(element, `--drk-breakpoint-${value.slice(1)}`));
        } else if (Number.isNaN(Number(value))) {
          return value;
        }
      }
      return value && drakeUtil.isNumeric(value) ? `(min-width: ${value}px)` : "";
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
    var Parallax = defineMixin()({
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
          drakeUtil.resetProps(this.$el, this.getCss(0));
        },
        getCss(percent) {
          var _a, _b;
          const styles = {};
          for (const property in this.props) {
            if (isParallaxProperty(property)) {
              (_b = (_a = this.props)[property]) == null ? void 0 : _b.call(_a, styles, drakeUtil.clamp(percent));
            }
          }
          styles.willChange = Object.keys(styles).map(drakeUtil.propName).join(",");
          return styles;
        }
      }
    });
    function transformFn(property, el, inputStops) {
      let unit = getUnit(inputStops) || (property === "x" || property === "y" ? "px" : property === "rotate" ? "deg" : "");
      let transformName = property;
      let convert = drakeUtil.toFloat;
      if (property === "x" || property === "y") {
        transformName = `translate${drakeUtil.ucfirst(property)}`;
        convert = (stop) => drakeUtil.toFloat(drakeUtil.toFloat(stop).toFixed(unit === "px" ? 0 : 6));
      } else if (property === "scale") {
        unit = "";
        convert = (stop) => getUnit([stop]) ? drakeUtil.toPx(stop, "width", el, true) / (typeof stop === "string" && stop.endsWith("vh") ? el.offsetHeight : el.offsetWidth) : drakeUtil.toFloat(stop);
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
          return i === 3 ? drakeUtil.toFloat(value2) : Number.parseInt(String(value2), 10);
        }).join(",");
        styles[property] = `rgba(${value})`;
      };
    }
    function parseColor(el, color) {
      const channels = getCssValue(el, "color", color).split(/[(),]/g).slice(1, -1);
      channels.push(1);
      return channels.slice(0, 4).map(drakeUtil.toFloat);
    }
    function filterFn(property, _el, inputStops) {
      if (inputStops.length === 1) {
        inputStops.unshift(0);
      }
      const unit = getUnit(inputStops) || (property === "blur" ? "px" : property === "hue" ? "deg" : "%");
      const filterName = property === "fopacity" ? "opacity" : property === "hue" ? "hue-rotate" : property;
      const stops = parseStops(inputStops, drakeUtil.toFloat);
      return (styles, percent) => {
        const value = getValue(stops, percent);
        styles.filter = `${styles.filter || ""} ${filterName}(${value + unit})`;
      };
    }
    function cssPropFn(property, el, inputStops) {
      if (inputStops.length === 1) {
        inputStops.unshift(getCssValue(el, property, ""));
      }
      const stops = parseStops(inputStops, drakeUtil.toFloat);
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
        const value = drakeUtil.toFloat(stop);
        return unit === "%" ? value * length / 100 : value;
      });
      if (!stops.some(([value]) => value)) {
        return drakeUtil.noop;
      }
      drakeUtil.css(el, "strokeDasharray", length);
      return (styles, percent) => {
        styles.strokeDashoffset = getValue(stops, percent);
      };
    }
    function backgroundFn(property, el, inputStops, properties) {
      if (inputStops.length === 1) {
        inputStops.unshift(0);
      }
      const dimension = property === "bgy" ? "height" : "width";
      properties[property] = parseStops(inputStops, (stop) => drakeUtil.toPx(stop, dimension, el));
      const backgroundProperties = getBackgroundProperties(properties);
      if (backgroundProperties.length === 2 && property === "bgx") {
        return drakeUtil.noop;
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
        return drakeUtil.noop;
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
      const dim = drakeUtil.Dimensions.cover(dimImage, dimEl);
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
      const src = drakeUtil.css(el, "backgroundImage").replace(/^none|url\(["']?(.+?)["']?\)$/, "$1");
      const cached = dimensions[src];
      if (cached) {
        return cached;
      }
      const image = new Image();
      if (src) {
        image.src = src;
        if (!image.naturalWidth && !loading[src]) {
          drakeUtil.once(image, "error load", () => {
            dimensions[src] = toDimensions(image);
            drakeUtil.trigger(el, drakeUtil.createEvent("load", false));
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
        const [rawValue = 0, rawPercent] = drakeUtil.isString(rawStop) ? rawStop.trim().split(/ (?![^(]*\))/) : [rawStop];
        const value = convert(rawValue);
        let percent = rawPercent ? drakeUtil.toFloat(rawPercent) / 100 : null;
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
      const index = drakeUtil.findIndex(stops.slice(1), ([, targetPercent]) => percent <= targetPercent) + 1;
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
        const match = drakeUtil.isString(stop) ? stop.match(unitRe) : null;
        if (match) {
          return match[1];
        }
      }
      return defaultUnit;
    }
    function getCssValue(el, property, value) {
      const cssProperty = drakeUtil.propName(property);
      const previous = el.style.getPropertyValue(cssProperty);
      const val = drakeUtil.css(drakeUtil.css(el, property, value), property);
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

    var Component = defineComponent()({
      mixins: [Parallax],
      beforeConnect() {
        this.item = this.$el.closest(`.${this.$options.id.replace("parallax", "items")} > *`);
      },
      disconnected() {
        this.item = null;
      },
      events: [
        {
          name: "itemin itemout",
          self: true,
          el: ({ item }) => item,
          handler({ type, detail }) {
            if (!isTransitionDetail(detail)) {
              return;
            }
            const { percent, duration, timing, dir } = detail;
            drakeUtil.fastdom.read(() => {
              if (!this.matchMedia) {
                return;
              }
              const propsFrom = this.getCss(getCurrentPercent(type, dir, percent));
              const propsTo = this.getCss(isIn(type) ? 0.5 : dir > 0 ? 1 : 0);
              drakeUtil.fastdom.write(() => {
                drakeUtil.css(this.$el, propsFrom);
                drakeUtil.Transition.start(this.$el, propsTo, duration, timing).catch(drakeUtil.noop);
              });
            });
          }
        },
        {
          name: "transitioncanceled transitionend",
          self: true,
          el: ({ item }) => item,
          handler() {
            drakeUtil.Transition.cancel(this.$el);
          }
        },
        {
          name: "itemtranslatein itemtranslateout",
          self: true,
          el: ({ item }) => item,
          handler({ type, detail }) {
            if (!isTranslationDetail(detail)) {
              return;
            }
            const { percent, dir } = detail;
            drakeUtil.fastdom.read(() => {
              if (!this.matchMedia) {
                this.reset();
                return;
              }
              const props = this.getCss(getCurrentPercent(type, dir, percent));
              drakeUtil.fastdom.write(() => drakeUtil.css(this.$el, props));
            });
          }
        }
      ]
    });
    function isIn(type) {
      return drakeUtil.endsWith(type, "in");
    }
    function getCurrentPercent(type, dir, percent) {
      percent /= 2;
      return isIn(type) !== dir < 0 ? percent : 1 - percent;
    }
    function isTranslationDetail(value) {
      return isRecord(value) && typeof value.percent === "number" && typeof value.dir === "number";
    }
    function isTransitionDetail(value) {
      return isRecord(value) && typeof value.percent === "number" && typeof value.dir === "number" && typeof value.duration === "number" && typeof value.timing === "string";
    }
    function isRecord(value) {
      return typeof value === "object" && value !== null;
    }

    var name = 'slideshowParallax';

    if (typeof window !== "undefined" && window.Drake) {
      window.Drake.component(name, Component);
    }

    return Component;

}));
