/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

import { isString, startsWith, isObject, memoize, hyphenate, $, toPx, css, includes, flipPosition, dimensions, isRtl, scrollParent, positionAt, hasClass, toggleClass, trigger, toNode, isVisible, toNodes, isBoolean, addClass, removeClass, $$, Animation, Transition, propName, toFloat, wrapInner, pointerEnter, pointerDown, isTouch, append, on, once, overflowParents, matches, remove, attr, pointerLeave, offset, data, isFocusable } from './../drake-util.esm.js';

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

memoize((id, props) => {
  const attributes = Object.keys(props);
  const filter = attributes.concat(id).filter(Boolean).flatMap((key) => [hyphenate(key), `data-${hyphenate(key)}`]);
  return { attributes, filter };
});

let id = 1;
function generateId(instance, element) {
  var _a;
  return `${(_a = instance.$options.id) != null ? _a : "drk"}-${id++}`;
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
  ESC: 27};

var Component = defineComponent()({
  mixins: [Container, Togglable, Position],
  data: {
    pos: "top",
    animation: ["drk-animation-scale-up"],
    duration: 100,
    cls: "drk-active"
  },
  connected() {
    makeFocusable(this.$el);
  },
  disconnected() {
    this.hide();
  },
  methods: {
    show() {
      if (this.isToggled(this.tooltip || null)) {
        return;
      }
      const { delay = 0, title } = parseProps(this.$options);
      if (!title) {
        return;
      }
      const titleAttr = attr(this.$el, "title");
      const off = on(this.$el, ["blur", pointerLeave], (e) => !isTouch(e) && this.hide());
      this.reset = () => {
        attr(this.$el, { title: titleAttr != null ? titleAttr : null, "aria-describedby": null });
        off();
      };
      const id = generateId(this);
      attr(this.$el, { title: null, "aria-describedby": id });
      clearTimeout(this.showTimer);
      this.showTimer = setTimeout(() => this._show(title, id), delay);
    },
    async hide() {
      var _a;
      if (matches(this.$el, "input:focus")) {
        return;
      }
      clearTimeout(this.showTimer);
      const tooltip = this.tooltip;
      if (tooltip && this.isToggled(tooltip)) {
        await this.toggleElement(tooltip, false, false);
      }
      (_a = this.reset) == null ? void 0 : _a.call(this);
      remove(this.tooltip);
      this.tooltip = null;
    },
    async _show(title, id) {
      const tooltip = append(
        this.container,
        `<div id="${id}" class="drk-${this.$options.name}" role="tooltip">  <div class="drk-${this.$options.name}-inner">${title}</div>  </div>`
      );
      if (!(tooltip instanceof HTMLElement)) {
        return;
      }
      this.tooltip = tooltip;
      on(tooltip, "toggled", (_event, toggled) => {
        if (!toggled) {
          return;
        }
        const update = () => this.positionAt(tooltip, this.$el);
        update();
        const [dir, align] = getAlignment(tooltip, this.$el, this.pos);
        this.origin = this.axis === "y" ? `${flipPosition(dir)}-${align}` : `${align}-${flipPosition(dir)}`;
        const handlers = [
          once(document, `keydown ${pointerDown}`, this.hide, false, (e) => {
            const outsidePointer = e.type === pointerDown && (!(e.target instanceof Node) || !this.$el.contains(e.target));
            const escapeKey = e.type === "keydown" && e instanceof KeyboardEvent && e.keyCode === keyMap.ESC;
            return outsidePointer || escapeKey;
          }),
          on([document, ...overflowParents(this.$el)], "scroll", update, {
            passive: true
          })
        ];
        once(tooltip, "hide", () => handlers.forEach((handler) => handler()), {
          self: true
        });
      });
      if (!await this.toggleElement(tooltip, true)) {
        this.hide();
      }
    }
  },
  events: {
    name: `focus ${pointerEnter} ${pointerDown}`,
    // Clicking a button does not give it focus on all browsers and platforms
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#clicking_and_focus
    handler(e) {
      if ((!isTouch(e) || e.type === pointerDown) && document.readyState !== "loading") {
        this.show();
      }
    }
  }
});
function makeFocusable(el) {
  if (!isFocusable(el)) {
    el.tabIndex = 0;
  }
}
function getAlignment(el, target, [dir, align]) {
  const elOffset = offset(el);
  const targetOffset = offset(target);
  const properties = [
    ["left", "right"],
    ["top", "bottom"]
  ];
  for (const props2 of properties) {
    if (elOffset[props2[0]] >= targetOffset[props2[1]]) {
      dir = props2[1];
      break;
    }
    if (elOffset[props2[1]] <= targetOffset[props2[0]]) {
      dir = props2[0];
      break;
    }
  }
  const props = dir === "left" || dir === "right" ? properties[1] : properties[0];
  align = props.find((prop) => elOffset[prop] === targetOffset[prop]) || "center";
  return [dir, align];
}
function parseProps(options) {
  const { el, id, data: data$1 } = options;
  const optionData = typeof data$1 === "object" && data$1 !== null && !Array.isArray(data$1) ? data$1 : {};
  const values = {
    ...parseOptions(data(el, id != null ? id : ""), ["title"]),
    ...optionData
  };
  for (const key of ["delay", "title"]) {
    if (!(key in values)) {
      values[key] = data(el, key);
    }
  }
  return {
    delay: Number(values.delay) || 0,
    title: values.title ? String(values.title) : ""
  };
}

var name = 'tooltip';

if (typeof window !== "undefined" && window.Drake) {
  window.Drake.component(name, Component);
}

export { Component as default };
