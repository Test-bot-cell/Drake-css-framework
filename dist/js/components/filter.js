/*! Drake.css framework 0.1.0 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('drake-util')) :
    typeof define === 'function' && define.amd ? define('drakefilter', ['drake-util'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DrakeFilter = factory(global.Drake.util));
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
    function parseOptions(value, args = []) {
      if (!drakeUtil.isString(value) || !value) {
        return {};
      }
      try {
        if (drakeUtil.startsWith(value, "{")) {
          const parsed = JSON.parse(value);
          return drakeUtil.isObject(parsed) ? { ...parsed } : {};
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

    function maybeDefaultPreventClick(e) {
      var _a;
      if ((_a = e.target) == null ? void 0 : _a.closest('a[href="#"],a[href=""]')) {
        e.preventDefault();
      }
    }

    const keyMap = {
      SPACE: 32};

    var Component = defineComponent()({
      mixins: [Animate],
      args: "target",
      props: {
        target: String,
        selActive: Boolean
      },
      data: {
        target: "",
        selActive: false,
        attrItem: "drk-filter-control",
        cls: "drk-active",
        duration: 250
      },
      computed: {
        children: ({ target }, $el) => drakeUtil.$$(`${target} > *`, $el),
        toggles: ({ attrItem }, $el) => drakeUtil.$$(`[${attrItem}],[data-${attrItem}]`, $el)
      },
      watch: {
        toggles(value) {
          const toggles = toHtmlElements(value);
          this.updateState();
          const actives = this.selActive === false ? [] : drakeUtil.$$(this.selActive, this.$el);
          for (const toggle of toggles) {
            if (this.selActive !== false) {
              drakeUtil.toggleClass(toggle, this.cls, drakeUtil.includes(actives, toggle));
            }
            const button = findButton(toggle);
            if (drakeUtil.isTag(button, "a")) {
              button.role = "button";
            }
          }
        },
        children(_list, previous) {
          if (previous) {
            this.updateState();
          }
        }
      },
      events: {
        name: "click keydown",
        delegate: ({ attrItem }) => `[${attrItem}],[data-${attrItem}]`,
        handler(e) {
          var _a;
          if (e.type === "keydown" && (!(e instanceof KeyboardEvent) || e.keyCode !== keyMap.SPACE)) {
            return;
          }
          if (hasElementTarget(e) && ((_a = e.target) == null ? void 0 : _a.closest("a,button"))) {
            maybeDefaultPreventClick(e);
            if (e.current instanceof HTMLElement) {
              this.apply(e.current);
            }
          }
        }
      },
      methods: {
        apply(el) {
          const prevState = this.getState();
          const newState = mergeState(el, this.attrItem, this.getState());
          if (!isEqualState(prevState, newState)) {
            this.setState(newState);
          }
        },
        getState() {
          return this.toggles.filter((item) => drakeUtil.hasClass(item, this.cls)).reduce((state, el) => mergeState(el, this.attrItem, state), {
            filter: { "": "" },
            sort: []
          });
        },
        async setState(state, animate = true) {
          var _a, _b;
          const nextState = {
            filter: (_a = state.filter) != null ? _a : { "": "" },
            sort: (_b = state.sort) != null ? _b : []
          };
          drakeUtil.trigger(this.$el, "beforeFilter", [this, nextState]);
          for (const toggle of this.toggles) {
            drakeUtil.toggleClass(toggle, this.cls, matchFilter(toggle, this.attrItem, nextState));
          }
          await Promise.all(
            drakeUtil.$$(this.target, this.$el).map((target) => {
              const filterFn = () => applyState(nextState, target, drakeUtil.children(target));
              return animate ? this.animate(filterFn, target) : filterFn();
            })
          );
          drakeUtil.trigger(this.$el, "afterFilter", [this]);
        },
        updateState() {
          drakeUtil.fastdom.write(() => this.setState(this.getState(), false));
        }
      }
    });
    function getFilter(el, attr) {
      const options = parseOptions(drakeUtil.data(el, attr), ["filter"]);
      return {
        filter: stringOption(options.filter),
        group: stringOption(options.group),
        sort: stringOption(options.sort),
        order: stringOption(options.order)
      };
    }
    function isEqualState(stateA, stateB) {
      return drakeUtil.isEqual(stateA.filter, stateB.filter) && drakeUtil.isEqual(stateA.sort, stateB.sort);
    }
    function applyState(state, target, children) {
      for (const el of children) {
        drakeUtil.css(
          el,
          "display",
          Object.values(state.filter).every((selector) => !selector || drakeUtil.matches(el, selector)) ? "" : "none"
        );
      }
      const [sort, order] = state.sort;
      if (sort) {
        const sorted = sortItems(children, sort, order);
        if (!drakeUtil.isEqual(sorted, children)) {
          drakeUtil.append(target, sorted);
        }
      }
    }
    function mergeState(el, attr, state) {
      const { filter, group, sort, order = "asc" } = getFilter(el, attr);
      if (filter || drakeUtil.isUndefined(sort)) {
        if (group) {
          if (filter) {
            delete state.filter[""];
            state.filter[group] = filter;
          } else {
            delete state.filter[group];
            if (drakeUtil.isEmpty(state.filter) || "" in state.filter) {
              state.filter = { "": filter || "" };
            }
          }
        } else {
          state.filter = { "": filter || "" };
        }
      }
      if (!drakeUtil.isUndefined(sort)) {
        state.sort = [sort, order];
      }
      return state;
    }
    function matchFilter(el, attr, { filter: stateFilter = { "": "" }, sort: [stateSort, stateOrder] }) {
      const { filter = "", group = "", sort, order = "asc" } = getFilter(el, attr);
      const defaultFilterMatches = !group && filter === stateFilter[""];
      const groupFilterMatches = Boolean(group) && filter === stateFilter[group];
      const groupResetMatches = !filter && Boolean(group) && !(group in stateFilter) && !stateFilter[""];
      const filterMatches = defaultFilterMatches || groupFilterMatches || groupResetMatches;
      if (drakeUtil.isUndefined(sort)) {
        return filterMatches;
      }
      const sortMatches = stateSort === sort && stateOrder === order;
      const hasFilter = Boolean(filter || group);
      return sortMatches && (!hasFilter || filterMatches);
    }
    function sortItems(nodes, sort, order) {
      return [...nodes].sort((a, b) => {
        const valA = drakeUtil.data(a, sort) || "";
        const valB = drakeUtil.data(b, sort) || "";
        const cmp = drakeUtil.isNumeric(valA) && drakeUtil.isNumeric(valB) ? Number(valA) - Number(valB) : valA.localeCompare(valB, void 0, { numeric: true });
        return cmp * (order === "asc" ? 1 : -1);
      });
    }
    function findButton(el) {
      return drakeUtil.$("a,button", el) || el;
    }
    function stringOption(value) {
      return value === void 0 ? void 0 : String(value);
    }
    function toHtmlElements(value) {
      return Array.isArray(value) ? value.filter((item) => item instanceof HTMLElement) : [];
    }
    function hasElementTarget(event) {
      return event.target instanceof Element;
    }

    var name = 'filter';

    if (typeof window !== "undefined" && window.Drake) {
      window.Drake.component(name, Component);
    }

    return Component;

}));
