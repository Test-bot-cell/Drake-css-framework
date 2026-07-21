/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('drake-util')) :
    typeof define === 'function' && define.amd ? define('drakesortable', ['drake-util'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DrakeSortable = factory(global.Drake.util));
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
        drakeUtil.fastdom.read(() => {
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
        if (result && drakeUtil.isPlainObject(result)) {
          drakeUtil.assign(data, result);
        }
        if (write && result !== false) {
          drakeUtil.fastdom.write(() => {
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
          return drakeUtil.observeResize(
            toElementInput(target),
            callback,
            isResizeOptions(observerOptions) ? observerOptions : void 0
          );
        },
        options,
        "resize"
      );
    }
    function mutation(options = {}) {
      return createObservable(
        (target, handler, observerOptions) => drakeUtil.observeMutation(
          target,
          (records, observer) => handler(records, observer),
          isMutationOptions(observerOptions) ? observerOptions : void 0
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
    function toElementInput(target) {
      return drakeUtil.toNodes(target).filter((node) => node instanceof Element);
    }
    function isResizeOptions(value) {
      return typeof value === "object" && value !== null;
    }
    function isMutationOptions(value) {
      return typeof value === "object" && value !== null;
    }

    defineComponent()({
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
          target: ({ $el }) => [$el, ...drakeUtil.children($el)]
        })
      ],
      update: {
        read() {
          return {
            rows: getRows(drakeUtil.children(this.$el))
          };
        },
        write({ rows }) {
          for (const row of rows) {
            for (const el of row) {
              drakeUtil.toggleClass(el, this.margin, rows[0] !== row);
              drakeUtil.toggleClass(el, this.firstColumn, row[drakeUtil.isRtl ? row.length - 1 : 0] === el);
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
        if (!drakeUtil.isVisible(el)) {
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
        [offsetTop, offsetLeft] = drakeUtil.offsetPosition(element);
      }
      return {
        top: offsetTop,
        left: offsetLeft,
        bottom: offsetTop + offsetHeight,
        right: offsetLeft + offsetWidth
      };
    }

    function awaitFrame() {
      return new Promise((resolve) => requestAnimationFrame(resolve));
    }
    function awaitTimeout(timeout = 0) {
      return new Promise((resolve) => setTimeout(resolve, timeout));
    }

    const clsLeave = "drk-transition-leave";
    const clsEnter = "drk-transition-enter";
    function fade(action, target, duration, stagger = 0) {
      const index = transitionIndex(target, true);
      const propsIn = { opacity: 1 };
      const propsOut = { opacity: 0 };
      const isCurrentIndex = () => index === transitionIndex(target);
      const wrapIndexFn = (fn) => () => isCurrentIndex() ? fn() : Promise.reject();
      const leaveFn = wrapIndexFn(async () => {
        drakeUtil.addClass(target, clsLeave);
        await (stagger ? getTransitionNodes(target).reduce(async (promise, child, i, array) => {
          await promise;
          if (!drakeUtil.isInView(child) || !isCurrentIndex()) {
            drakeUtil.css(child, propsOut);
            return;
          }
          await awaitTimeout(stagger);
          const transition = drakeUtil.Transition.start(child, propsOut, duration / 2, "ease");
          if (array.length - 1 === i) {
            await transition;
          }
        }, Promise.resolve()) : drakeUtil.Transition.start(target, propsOut, duration / 2, "ease"));
        drakeUtil.removeClass(target, clsLeave);
      });
      const enterFn = wrapIndexFn(async () => {
        const oldHeight = drakeUtil.height(target);
        drakeUtil.addClass(target, clsEnter);
        action();
        drakeUtil.css(stagger ? drakeUtil.children(target) : target, propsOut);
        drakeUtil.height(target, oldHeight);
        await awaitTimeout();
        drakeUtil.height(target, "");
        const newHeight = drakeUtil.height(target);
        drakeUtil.css(target, "alignContent", "flex-start");
        drakeUtil.height(target, oldHeight);
        const transitions = [];
        let targetDuration = duration / 2;
        if (stagger) {
          const nodes = getTransitionNodes(target);
          drakeUtil.css(drakeUtil.children(target), propsOut);
          transitions.push(
            nodes.reduce(async (promise, child, i, array) => {
              await promise;
              if (!drakeUtil.isInView(child) || !isCurrentIndex()) {
                drakeUtil.resetProps(child, propsIn);
                return;
              }
              await awaitTimeout(stagger);
              const transition = drakeUtil.Transition.start(child, propsIn, duration / 2, "ease").then(
                () => isCurrentIndex() && drakeUtil.resetProps(child, propsIn)
              );
              if (array.length - 1 === i) {
                await transition;
              }
            }, Promise.resolve())
          );
          targetDuration += nodes.length * stagger;
        }
        if (!stagger || oldHeight !== newHeight) {
          const targetProps = { height: newHeight, ...stagger ? {} : propsIn };
          transitions.push(drakeUtil.Transition.start(target, targetProps, targetDuration, "ease"));
        }
        await Promise.all(transitions);
        drakeUtil.removeClass(target, clsEnter);
        if (isCurrentIndex()) {
          drakeUtil.resetProps(target, { height: "", alignContent: "", ...propsIn });
          delete target.dataset.transition;
        }
      });
      return drakeUtil.hasClass(target, clsLeave) ? waitTransitionend(target).then(enterFn) : drakeUtil.hasClass(target, clsEnter) ? waitTransitionend(target).then(leaveFn).then(enterFn) : leaveFn().then(enterFn);
    }
    function transitionIndex(target, next = false) {
      if (next) {
        target.dataset.transition = String(1 + transitionIndex(target));
      }
      return drakeUtil.toNumber(target.dataset.transition) || 0;
    }
    function waitTransitionend(target) {
      return Promise.all(
        drakeUtil.children(target).filter(drakeUtil.Transition.inProgress).map(
          (el) => new Promise(
            (resolve) => drakeUtil.once(el, "transitionend transitioncanceled", resolve)
          )
        )
      );
    }
    function getTransitionNodes(target) {
      const rows = getRows(drakeUtil.children(target));
      return rows.flat().filter((node) => node instanceof HTMLElement && drakeUtil.isVisible(node));
    }

    async function animateSlide(action, target, duration) {
      await awaitFrame();
      let nodes = htmlChildren(target);
      const currentProps = nodes.map((el) => getProps(el, true));
      const targetProps = { ...drakeUtil.css(target, ["height", "padding"]), display: "block" };
      const transitionNodes = nodes.filter((node) => drakeUtil.isInView(node));
      const targets = nodes.concat(target);
      await Promise.all(targets.map(drakeUtil.Transition.cancel));
      drakeUtil.css(targets, "transitionProperty", "none");
      await action();
      const newNodes = htmlChildren(target).filter((el) => !drakeUtil.includes(nodes, el));
      nodes = nodes.concat(newNodes);
      await Promise.resolve();
      drakeUtil.css(targets, "transitionProperty", "");
      const targetStyle = drakeUtil.attr(target, "style");
      const targetPropsTo = drakeUtil.css(target, ["height", "padding"]);
      const [propsTo, propsFrom] = getTransitionProps(target, nodes, currentProps);
      const attrsTo = nodes.map((el) => {
        var _a;
        return { style: (_a = drakeUtil.attr(el, "style")) != null ? _a : null };
      });
      transitionNodes.push(...nodes.filter((node) => drakeUtil.isInView(node)));
      nodes.forEach((el, i) => propsFrom[i] && drakeUtil.css(el, propsFrom[i]));
      drakeUtil.css(target, targetProps);
      drakeUtil.trigger(target, "scroll");
      await awaitFrame();
      const transitions = nodes.map((el, i) => {
        const properties = propsTo[i];
        if (properties && drakeUtil.parent(el) === target && transitionNodes.includes(el)) {
          return drakeUtil.Transition.start(el, properties, duration, "ease", !newNodes.includes(el));
        }
      }).concat(drakeUtil.Transition.start(target, targetPropsTo, duration, "ease", true));
      try {
        await Promise.all(transitions);
        nodes.forEach((el, i) => {
          const attributes = attrsTo[i];
          if (attributes) {
            drakeUtil.attr(el, attributes);
          }
          if (drakeUtil.parent(el) === target) {
            const properties = propsTo[i];
            drakeUtil.css(el, "display", properties && properties.opacity === 0 ? "none" : "");
          }
        });
        drakeUtil.attr(target, "style", targetStyle != null ? targetStyle : null);
      } catch {
        drakeUtil.attr(nodes, "style", "");
        drakeUtil.resetProps(target, targetProps);
      }
    }
    function getProps(el, opacity = false) {
      const zIndex = drakeUtil.css(el, "zIndex");
      return drakeUtil.isVisible(el) ? {
        display: "",
        opacity: opacity ? drakeUtil.css(el, "opacity") : "0",
        pointerEvents: "none",
        position: "absolute",
        zIndex: zIndex === "auto" ? drakeUtil.index(el) : zIndex,
        ...getPositionWithMargin(el)
      } : false;
    }
    function getTransitionProps(target, nodes, currentProps) {
      const propsTo = nodes.map(
        (el, i) => drakeUtil.parent(el) && i in currentProps ? currentProps[i] ? drakeUtil.isVisible(el) ? getPositionWithMargin(el) : { opacity: 0 } : { opacity: drakeUtil.isVisible(el) ? 1 : 0 } : false
      );
      const propsFrom = propsTo.map((props, i) => {
        const node = nodes[i];
        const from = node && drakeUtil.parent(node) === target && (currentProps[i] || getProps(node));
        if (!from) {
          return false;
        }
        if (!props) {
          delete from.opacity;
        } else if (!("opacity" in props)) {
          const { opacity } = from;
          if (Number(opacity) % 1) {
            props.opacity = 1;
          } else {
            delete from.opacity;
          }
        }
        return from;
      });
      return [propsTo, propsFrom];
    }
    function getPositionWithMargin(el) {
      const { height, width } = drakeUtil.dimensions(el);
      return {
        height,
        width,
        transform: "",
        ...drakeUtil.position(el),
        ...drakeUtil.css(el, ["marginTop", "marginLeft"])
      };
    }
    function htmlChildren(target) {
      return drakeUtil.children(target).filter(
        (element) => element instanceof HTMLElement
      );
    }

    var Animate = defineMixin()({
      props: {
        duration: Number,
        animation: Boolean
      },
      data: {
        duration: 150,
        animation: "slide"
      },
      methods: {
        animate(action, target = this.$el) {
          const name = this.animation;
          const animationFn = name === "fade" ? fade : name === "delayed-fade" ? (nextAction, nextTarget, nextDuration) => fade(nextAction, nextTarget, nextDuration, 40) : name ? animateSlide : (nextAction) => {
            nextAction();
            return Promise.resolve();
          };
          return animationFn(action, target, this.duration).catch(drakeUtil.noop);
        }
      }
    });

    var Class = defineMixin()({
      connected() {
        this._cmpCls = drakeUtil.hasClass(this.$el, this.$options.id);
        drakeUtil.addClass(this.$el, this.$options.id);
      },
      disconnected() {
        if (!this._cmpCls) {
          drakeUtil.removeClass(this.$el, this.$options.id);
        }
      }
    });

    var Component = defineComponent()({
      mixins: [Class, Animate],
      props: {
        group: String,
        threshold: Number,
        clsItem: String,
        clsPlaceholder: String,
        clsDrag: String,
        clsDragState: String,
        clsBase: String,
        clsNoDrag: String,
        clsEmpty: String,
        clsCustom: String,
        handle: String
      },
      data: {
        group: false,
        threshold: 5,
        clsItem: "drk-sortable-item",
        clsPlaceholder: "drk-sortable-placeholder",
        clsDrag: "drk-sortable-drag",
        clsDragState: "drk-drag",
        clsBase: "drk-sortable",
        clsNoDrag: "drk-sortable-nodrag",
        clsEmpty: "drk-sortable-empty",
        clsCustom: "",
        handle: false,
        pos: {}
      },
      events: {
        name: drakeUtil.pointerDown,
        passive: false,
        handler(e) {
          this.init(e);
        }
      },
      computed: {
        target: (_props, $el) => {
          var _a;
          return $el instanceof HTMLTableElement ? (_a = $el.tBodies[0]) != null ? _a : $el : $el;
        },
        items() {
          return drakeUtil.children(this.target).filter(
            (item) => item instanceof HTMLElement
          );
        },
        isEmpty() {
          return !this.items.length;
        },
        handles({ handle }, $el) {
          return handle ? drakeUtil.$$(handle, $el) : this.items;
        }
      },
      watch: {
        isEmpty(empty) {
          drakeUtil.toggleClass(this.target, this.clsEmpty, Boolean(empty));
        },
        handles(handles, prev) {
          const props = { touchAction: "none", userSelect: "none" };
          drakeUtil.resetProps(toHtmlElements(prev), props);
          drakeUtil.css(toHtmlElements(handles), props);
        }
      },
      update: {
        write(data) {
          var _a;
          if (!this.drag || !drakeUtil.parent(this.placeholder)) {
            return;
          }
          const {
            pos: { x, y },
            origin: { offsetTop, offsetLeft },
            placeholder
          } = this;
          if (offsetTop === void 0 || offsetLeft === void 0) {
            return;
          }
          drakeUtil.css(this.drag, {
            top: y - offsetTop,
            left: x - offsetLeft
          });
          const sortable = this.getSortable(document.elementFromPoint(x, y));
          if (!sortable) {
            return;
          }
          const { items } = sortable;
          if (items.some(drakeUtil.Transition.inProgress)) {
            return;
          }
          const target = findTarget(items, { x, y });
          if (items.length && (!target || target === placeholder)) {
            return;
          }
          const previous = this.getSortable(placeholder);
          if (!previous) {
            return;
          }
          const insertTarget = findInsertTarget(
            sortable.target,
            target,
            placeholder,
            { x, y },
            sortable === previous && data.moved !== target
          );
          if (insertTarget === false) {
            return;
          }
          if (insertTarget && placeholder === insertTarget) {
            return;
          }
          if (sortable !== previous) {
            previous.remove(placeholder);
            data.moved = target;
          } else {
            delete data.moved;
          }
          sortable.insert(placeholder, insertTarget);
          (_a = this.touched) == null ? void 0 : _a.add(sortable);
        },
        events: ["move"]
      },
      methods: {
        init(e) {
          const { target, defaultPrevented } = e;
          if (!(target instanceof Node)) {
            return;
          }
          const targetElement = target instanceof Element ? target : target.parentElement;
          if (!targetElement) {
            return;
          }
          const button = e instanceof MouseEvent ? e.button : 0;
          const [placeholder] = this.items.filter((el) => el.contains(target));
          if (!placeholder || defaultPrevented || button > 0 || target instanceof Element && drakeUtil.isInput(target) || targetElement.closest(`.${this.clsNoDrag}`) || this.handle && !targetElement.closest(this.handle)) {
            return;
          }
          e.preventDefault();
          this.pos = drakeUtil.getEventPos(e);
          this.touched = /* @__PURE__ */ new Set([this]);
          this.placeholder = placeholder;
          this.origin = { target, index: drakeUtil.index(placeholder), ...this.pos };
          drakeUtil.on(document, drakeUtil.pointerMove, this.move);
          drakeUtil.on(document, drakeUtil.pointerUp, this.end);
          if (!this.threshold) {
            this.start(e);
          }
        },
        start(e) {
          this.drag = appendDrag(this.$container, this.placeholder);
          const { left, top } = drakeUtil.dimensions(this.placeholder);
          drakeUtil.assign(this.origin, { offsetLeft: this.pos.x - left, offsetTop: this.pos.y - top });
          drakeUtil.addClass(this.drag, this.clsDrag, this.clsCustom);
          drakeUtil.addClass(this.placeholder, this.clsPlaceholder);
          drakeUtil.addClass(this.items, this.clsItem);
          drakeUtil.addClass(document.documentElement, this.clsDragState);
          drakeUtil.trigger(this.$el, "start", [this, this.placeholder]);
          trackScroll(this.pos);
          this.move(e);
        },
        move: throttle(function(e) {
          drakeUtil.assign(this.pos, drakeUtil.getEventPos(e));
          if (!this.drag && (Math.abs(this.pos.x - this.origin.x) > this.threshold || Math.abs(this.pos.y - this.origin.y) > this.threshold)) {
            this.start(e);
          }
          this.$emit("move");
        }),
        end() {
          drakeUtil.off(document, drakeUtil.pointerMove, this.move);
          drakeUtil.off(document, drakeUtil.pointerUp, this.end);
          if (!this.drag) {
            return;
          }
          untrackScroll();
          const sortable = this.getSortable(this.placeholder);
          if (!sortable) {
            return;
          }
          if (this === sortable) {
            if (this.origin.index !== drakeUtil.index(this.placeholder)) {
              drakeUtil.trigger(this.$el, "moved", [this, this.placeholder]);
            }
          } else {
            drakeUtil.trigger(sortable.$el, "added", [sortable, this.placeholder]);
            drakeUtil.trigger(this.$el, "removed", [this, this.placeholder]);
          }
          drakeUtil.trigger(this.$el, "stop", [this, this.placeholder]);
          drakeUtil.remove(this.drag);
          this.drag = null;
          const touched = this.touched;
          for (const { clsPlaceholder, clsItem } of touched != null ? touched : []) {
            for (const sortable2 of touched != null ? touched : []) {
              drakeUtil.removeClass(sortable2.items, clsPlaceholder, clsItem);
            }
          }
          this.touched = null;
          drakeUtil.removeClass(document.documentElement, this.clsDragState);
        },
        insert(element, target) {
          drakeUtil.addClass(this.items, this.clsItem);
          if (target && target.previousElementSibling !== element) {
            this.animate(() => drakeUtil.before(target, element));
          } else if (!target && this.target.lastElementChild !== element) {
            this.animate(() => drakeUtil.append(this.target, element));
          }
        },
        remove(element) {
          if (this.target.contains(element)) {
            this.animate(() => drakeUtil.remove(element));
          }
        },
        getSortable(element) {
          var _a;
          let current = element;
          while (current) {
            const sortable = this.$getComponent(current, "sortable");
            if (isSortable(sortable) && (sortable === this || this.group !== false && sortable.group === this.group)) {
              return sortable;
            }
            current = (_a = drakeUtil.parent(current)) != null ? _a : null;
          }
        }
      }
    });
    let trackTimer;
    function trackScroll(pos) {
      let last = Date.now();
      trackTimer = setInterval(() => {
        var _a, _b;
        const { x } = pos;
        let { y } = pos;
        y += (_b = (_a = document.scrollingElement) == null ? void 0 : _a.scrollTop) != null ? _b : 0;
        const dist = (Date.now() - last) * 0.3;
        last = Date.now();
        drakeUtil.scrollParents(document.elementFromPoint(x, pos.y)).reverse().some((scrollEl) => {
          let { scrollTop: scroll } = scrollEl;
          const { scrollHeight } = scrollEl;
          const { top, bottom, height: height2 } = drakeUtil.offsetViewport(scrollEl);
          if (top < y && top + 35 > y) {
            scroll -= dist;
          } else if (bottom > y && bottom - 35 < y) {
            scroll += dist;
          } else {
            return false;
          }
          if (scroll > 0 && scroll < scrollHeight - height2) {
            scrollEl.scrollTop = scroll;
            return true;
          }
          return false;
        });
      }, 15);
    }
    function untrackScroll() {
      clearInterval(trackTimer);
    }
    function appendDrag(container, element) {
      let clone;
      if (drakeUtil.isTag(element, "li", "tr")) {
        clone = document.createElement("div");
        const clonedElement = element.cloneNode(true);
        if (!(clonedElement instanceof Element)) {
          throw new TypeError("Sortable drag source clone must be an element");
        }
        drakeUtil.append(clone, clonedElement.children);
        for (const attribute of element.getAttributeNames()) {
          drakeUtil.attr(clone, attribute, element.getAttribute(attribute));
        }
      } else {
        const clonedNode = element.cloneNode(true);
        if (!(clonedNode instanceof HTMLElement)) {
          throw new TypeError("Sortable drag clone must be an HTML element");
        }
        clone = clonedNode;
      }
      drakeUtil.append(container, clone);
      drakeUtil.css(clone, "margin", "0", "important");
      drakeUtil.css(clone, {
        boxSizing: "border-box",
        width: element.offsetWidth,
        height: element.offsetHeight,
        padding: drakeUtil.css(element, "padding")
      });
      drakeUtil.height(clone.firstElementChild, drakeUtil.height(element.firstElementChild));
      return clone;
    }
    function findTarget(items, point) {
      return items[drakeUtil.findIndex(items, (item) => drakeUtil.pointInRect(point, drakeUtil.dimensions(item)))];
    }
    function findInsertTarget(list, target, placeholder, point, sameList) {
      if (!drakeUtil.children(list).length) {
        return;
      }
      if (!target) {
        return;
      }
      const rect = drakeUtil.dimensions(target);
      if (!sameList) {
        if (!isHorizontal(list, placeholder)) {
          return point.y < rect.top + rect.height / 2 ? target : target.nextElementSibling;
        }
        return target;
      }
      const placeholderRect = drakeUtil.dimensions(placeholder);
      const sameRow = linesIntersect(
        [rect.top, rect.bottom],
        [placeholderRect.top, placeholderRect.bottom]
      );
      const [pointerPos, lengthProp, startProp, endProp] = sameRow ? [point.x, "width", "left", "right"] : [point.y, "height", "top", "bottom"];
      const diff = placeholderRect[lengthProp] < rect[lengthProp] ? rect[lengthProp] - placeholderRect[lengthProp] : 0;
      if (placeholderRect[startProp] < rect[startProp]) {
        if (diff && pointerPos < rect[startProp] + diff) {
          return false;
        }
        return target.nextElementSibling;
      }
      if (diff && pointerPos > rect[endProp] - diff) {
        return false;
      }
      return target;
    }
    function isHorizontal(list, placeholder) {
      const single = drakeUtil.children(list).length === 1;
      if (single) {
        drakeUtil.append(list, placeholder);
      }
      const items = drakeUtil.children(list);
      const isHorizontal2 = items.some((el, i) => {
        const rectA = drakeUtil.dimensions(el);
        return items.slice(i + 1).some((el2) => {
          const rectB = drakeUtil.dimensions(el2);
          return !linesIntersect([rectA.left, rectA.right], [rectB.left, rectB.right]);
        });
      });
      if (single) {
        drakeUtil.remove(placeholder);
      }
      return isHorizontal2;
    }
    function linesIntersect(lineA, lineB) {
      return lineA[1] > lineB[0] && lineB[1] > lineA[0];
    }
    function throttle(fn) {
      let throttled = false;
      return function(...args) {
        if (!throttled) {
          throttled = true;
          fn.call(this, ...args);
          requestAnimationFrame(() => throttled = false);
        }
      };
    }
    function toHtmlElements(value) {
      return Array.isArray(value) ? value.filter((item) => item instanceof HTMLElement) : [];
    }
    function isSortable(instance) {
      return Boolean(instance) && typeof (instance == null ? void 0 : instance.group) !== "undefined" && typeof instance.insert === "function" && typeof instance.remove === "function";
    }

    var name = 'sortable';

    if (typeof window !== "undefined" && window.Drake) {
      window.Drake.component(name, Component);
    }

    return Component;

}));
