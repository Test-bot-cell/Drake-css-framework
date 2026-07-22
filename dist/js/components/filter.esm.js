/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

import { isString, startsWith, isObject, fastdom, isPlainObject, assign, observeResize, observeMutation, toNodes, toggleClass, isRtl, children, isVisible, offsetPosition, hasClass, toNumber, Transition, once, addClass, isInView, css, removeClass, height, resetProps, includes, attr, trigger, parent, index, dimensions, position, noop, $$, isTag, isUndefined, isEmpty, isEqual, $, matches, append, data, isNumeric } from './../drake-util.esm.js';

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
  return toNodes(target).filter((node) => node instanceof Element);
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
    addClass(target, clsLeave);
    await (stagger ? getTransitionNodes(target).reduce(async (promise, child, i, array) => {
      await promise;
      if (!isInView(child) || !isCurrentIndex()) {
        css(child, propsOut);
        return;
      }
      await awaitTimeout(stagger);
      const transition = Transition.start(child, propsOut, duration / 2, "ease");
      if (array.length - 1 === i) {
        await transition;
      }
    }, Promise.resolve()) : Transition.start(target, propsOut, duration / 2, "ease"));
    removeClass(target, clsLeave);
  });
  const enterFn = wrapIndexFn(async () => {
    const oldHeight = height(target);
    addClass(target, clsEnter);
    action();
    css(stagger ? children(target) : target, propsOut);
    height(target, oldHeight);
    await awaitTimeout();
    height(target, "");
    const newHeight = height(target);
    css(target, "alignContent", "flex-start");
    height(target, oldHeight);
    const transitions = [];
    let targetDuration = duration / 2;
    if (stagger) {
      const nodes = getTransitionNodes(target);
      css(children(target), propsOut);
      transitions.push(
        nodes.reduce(async (promise, child, i, array) => {
          await promise;
          if (!isInView(child) || !isCurrentIndex()) {
            resetProps(child, propsIn);
            return;
          }
          await awaitTimeout(stagger);
          const transition = Transition.start(child, propsIn, duration / 2, "ease").then(
            () => isCurrentIndex() && resetProps(child, propsIn)
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
      transitions.push(Transition.start(target, targetProps, targetDuration, "ease"));
    }
    await Promise.all(transitions);
    removeClass(target, clsEnter);
    if (isCurrentIndex()) {
      resetProps(target, { height: "", alignContent: "", ...propsIn });
      delete target.dataset.transition;
    }
  });
  return hasClass(target, clsLeave) ? waitTransitionend(target).then(enterFn) : hasClass(target, clsEnter) ? waitTransitionend(target).then(leaveFn).then(enterFn) : leaveFn().then(enterFn);
}
function transitionIndex(target, next = false) {
  if (next) {
    target.dataset.transition = String(1 + transitionIndex(target));
  }
  return toNumber(target.dataset.transition) || 0;
}
function waitTransitionend(target) {
  return Promise.all(
    children(target).filter(Transition.inProgress).map(
      (el) => new Promise(
        (resolve) => once(el, "transitionend transitioncanceled", resolve)
      )
    )
  );
}
function getTransitionNodes(target) {
  const rows = getRows(children(target));
  return rows.flat().filter((node) => node instanceof HTMLElement && isVisible(node));
}

async function animateSlide(action, target, duration) {
  await awaitFrame();
  let nodes = htmlChildren(target);
  const currentProps = nodes.map((el) => getProps(el, true));
  const targetProps = { ...css(target, ["height", "padding"]), display: "block" };
  const transitionNodes = nodes.filter((node) => isInView(node));
  const targets = nodes.concat(target);
  await Promise.all(targets.map(Transition.cancel));
  css(targets, "transitionProperty", "none");
  await action();
  const newNodes = htmlChildren(target).filter((el) => !includes(nodes, el));
  nodes = nodes.concat(newNodes);
  await Promise.resolve();
  css(targets, "transitionProperty", "");
  const targetStyle = attr(target, "style");
  const targetPropsTo = css(target, ["height", "padding"]);
  const [propsTo, propsFrom] = getTransitionProps(target, nodes, currentProps);
  const attrsTo = nodes.map((el) => {
    var _a;
    return { style: (_a = attr(el, "style")) != null ? _a : null };
  });
  transitionNodes.push(...nodes.filter((node) => isInView(node)));
  nodes.forEach((el, i) => propsFrom[i] && css(el, propsFrom[i]));
  css(target, targetProps);
  trigger(target, "scroll");
  await awaitFrame();
  const transitions = nodes.map((el, i) => {
    const properties = propsTo[i];
    if (properties && parent(el) === target && transitionNodes.includes(el)) {
      return Transition.start(el, properties, duration, "ease", !newNodes.includes(el));
    }
  }).concat(Transition.start(target, targetPropsTo, duration, "ease", true));
  try {
    await Promise.all(transitions);
    nodes.forEach((el, i) => {
      const attributes = attrsTo[i];
      if (attributes) {
        attr(el, attributes);
      }
      if (parent(el) === target) {
        const properties = propsTo[i];
        css(el, "display", properties && properties.opacity === 0 ? "none" : "");
      }
    });
    attr(target, "style", targetStyle != null ? targetStyle : null);
  } catch {
    attr(nodes, "style", "");
    resetProps(target, targetProps);
  }
}
function getProps(el, opacity = false) {
  const zIndex = css(el, "zIndex");
  return isVisible(el) ? {
    display: "",
    opacity: opacity ? css(el, "opacity") : "0",
    pointerEvents: "none",
    position: "absolute",
    zIndex: zIndex === "auto" ? index(el) : zIndex,
    ...getPositionWithMargin(el)
  } : false;
}
function getTransitionProps(target, nodes, currentProps) {
  const propsTo = nodes.map(
    (el, i) => parent(el) && i in currentProps ? currentProps[i] ? isVisible(el) ? getPositionWithMargin(el) : { opacity: 0 } : { opacity: isVisible(el) ? 1 : 0 } : false
  );
  const propsFrom = propsTo.map((props, i) => {
    const node = nodes[i];
    const from = node && parent(node) === target && (currentProps[i] || getProps(node));
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
  const { height, width } = dimensions(el);
  return {
    height,
    width,
    transform: "",
    ...position(el),
    ...css(el, ["marginTop", "marginLeft"])
  };
}
function htmlChildren(target) {
  return children(target).filter(
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
      return animationFn(action, target, this.duration).catch(noop);
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
    children: ({ target }, $el) => $$(`${target} > *`, $el),
    toggles: ({ attrItem }, $el) => $$(`[${attrItem}],[data-${attrItem}]`, $el)
  },
  watch: {
    toggles(value) {
      const toggles = toHtmlElements(value);
      this.updateState();
      const actives = this.selActive === false ? [] : $$(this.selActive, this.$el);
      for (const toggle of toggles) {
        if (this.selActive !== false) {
          toggleClass(toggle, this.cls, includes(actives, toggle));
        }
        const button = findButton(toggle);
        if (isTag(button, "a")) {
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
      return this.toggles.filter((item) => hasClass(item, this.cls)).reduce((state, el) => mergeState(el, this.attrItem, state), {
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
      trigger(this.$el, "beforeFilter", [this, nextState]);
      for (const toggle of this.toggles) {
        toggleClass(toggle, this.cls, matchFilter(toggle, this.attrItem, nextState));
      }
      await Promise.all(
        $$(this.target, this.$el).map((target) => {
          const filterFn = () => applyState(nextState, target, children(target));
          return animate ? this.animate(filterFn, target) : filterFn();
        })
      );
      trigger(this.$el, "afterFilter", [this]);
    },
    updateState() {
      fastdom.write(() => this.setState(this.getState(), false));
    }
  }
});
function getFilter(el, attr) {
  const options = parseOptions(data(el, attr), ["filter"]);
  return {
    filter: stringOption(options.filter),
    group: stringOption(options.group),
    sort: stringOption(options.sort),
    order: stringOption(options.order)
  };
}
function isEqualState(stateA, stateB) {
  return isEqual(stateA.filter, stateB.filter) && isEqual(stateA.sort, stateB.sort);
}
function applyState(state, target, children) {
  for (const el of children) {
    css(
      el,
      "display",
      Object.values(state.filter).every((selector) => !selector || matches(el, selector)) ? "" : "none"
    );
  }
  const [sort, order] = state.sort;
  if (sort) {
    const sorted = sortItems(children, sort, order);
    if (!isEqual(sorted, children)) {
      append(target, sorted);
    }
  }
}
function mergeState(el, attr, state) {
  const { filter, group, sort, order = "asc" } = getFilter(el, attr);
  if (filter || isUndefined(sort)) {
    if (group) {
      if (filter) {
        delete state.filter[""];
        state.filter[group] = filter;
      } else {
        delete state.filter[group];
        if (isEmpty(state.filter) || "" in state.filter) {
          state.filter = { "": filter || "" };
        }
      }
    } else {
      state.filter = { "": filter || "" };
    }
  }
  if (!isUndefined(sort)) {
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
  if (isUndefined(sort)) {
    return filterMatches;
  }
  const sortMatches = stateSort === sort && stateOrder === order;
  const hasFilter = Boolean(filter || group);
  return sortMatches && (!hasFilter || filterMatches);
}
function sortItems(nodes, sort, order) {
  return [...nodes].sort((a, b) => {
    const valA = data(a, sort) || "";
    const valB = data(b, sort) || "";
    const cmp = isNumeric(valA) && isNumeric(valB) ? Number(valA) - Number(valB) : valA.localeCompare(valB, void 0, { numeric: true });
    return cmp * (order === "asc" ? 1 : -1);
  });
}
function findButton(el) {
  return $("a,button", el) || el;
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

export { Component as default };
