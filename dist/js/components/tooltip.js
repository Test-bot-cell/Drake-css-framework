/*! Drake.css framework 0.1.0 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('drake-util')) :
    typeof define === 'function' && define.amd ? define('draketooltip', ['drake-util'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DrakeTooltip = factory(global.Drake.util));
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

    util.memoize((id, props) => {
      const attributes = Object.keys(props);
      const filter = attributes.concat(id).filter(Boolean).flatMap((key) => [util.hyphenate(key), `data-${util.hyphenate(key)}`]);
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
            return container ? util.$(container) : "";
          }
          return container ? util.$(container) : false;
        }
      }
    });

    const positionWithViewportOffset = util.positionAt;
    var Position = defineMixin()({
      props: {
        pos: String,
        offset: Boolean,
        flip: Boolean,
        shift: Boolean,
        inset: Boolean
      },
      data: {
        pos: `bottom-${util.isRtl ? "right" : "left"}`,
        offset: false,
        flip: true,
        shift: true,
        inset: false
      },
      connected() {
        const [direction = "center", alignment = "center"] = this.$props.pos.split("-").concat("center");
        this.pos = [toDirection(direction), toDirection(alignment)];
        [this.dir, this.align] = this.pos;
        this.axis = util.includes(["top", "bottom"], this.dir) ? "y" : "x";
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
            element: [this.inset ? this.dir : toDirection(util.flipPosition(this.dir)), this.align],
            target: [this.dir, this.align]
          };
          if (this.axis === "y") {
            attach.element.reverse();
            attach.target.reverse();
            offset.reverse();
            placement.reverse();
          }
          const restoreScrollPosition = storeScrollPosition(element);
          const elDim = util.dimensions(element);
          util.css(element, { top: -elDim.height, left: -elDim.width });
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
          return util.toPx(
            this.offset === false ? util.css(element, "--drk-position-offset") : this.offset,
            this.axis === "x" ? "width" : "height",
            element
          ) * (util.includes(["left", "top"], this.dir) ? -1 : 1) * (this.inset ? -1 : 1);
        },
        getShiftOffset(element = this.$el) {
          return this.align === "center" ? 0 : util.toPx(
            util.css(element, "--drk-position-shift-offset"),
            this.axis === "y" ? "width" : "height",
            element
          ) * (util.includes(["left", "top"], this.align) ? 1 : -1);
        },
        getViewportOffset(element) {
          return util.toPx(util.css(element, "--drk-position-viewport-offset"));
        }
      }
    });
    function storeScrollPosition(element) {
      const scrollElement = util.scrollParent(element);
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
          const titleAttr = util.attr(this.$el, "title");
          const off = util.on(this.$el, ["blur", util.pointerLeave], (e) => !util.isTouch(e) && this.hide());
          this.reset = () => {
            util.attr(this.$el, { title: titleAttr != null ? titleAttr : null, "aria-describedby": null });
            off();
          };
          const id = generateId(this);
          util.attr(this.$el, { title: null, "aria-describedby": id });
          clearTimeout(this.showTimer);
          this.showTimer = setTimeout(() => this._show(title, id), delay);
        },
        async hide() {
          var _a;
          if (util.matches(this.$el, "input:focus")) {
            return;
          }
          clearTimeout(this.showTimer);
          const tooltip = this.tooltip;
          if (tooltip && this.isToggled(tooltip)) {
            await this.toggleElement(tooltip, false, false);
          }
          (_a = this.reset) == null ? void 0 : _a.call(this);
          util.remove(this.tooltip);
          this.tooltip = null;
        },
        async _show(title, id) {
          const tooltip = util.append(
            this.container,
            `<div id="${id}" class="drk-${this.$options.name}" role="tooltip">  <div class="drk-${this.$options.name}-inner">${title}</div>  </div>`
          );
          if (!(tooltip instanceof HTMLElement)) {
            return;
          }
          this.tooltip = tooltip;
          util.on(tooltip, "toggled", (_event, toggled) => {
            if (!toggled) {
              return;
            }
            const update = () => this.positionAt(tooltip, this.$el);
            update();
            const [dir, align] = getAlignment(tooltip, this.$el, this.pos);
            this.origin = this.axis === "y" ? `${util.flipPosition(dir)}-${align}` : `${align}-${util.flipPosition(dir)}`;
            const handlers = [
              util.once(document, `keydown ${util.pointerDown}`, this.hide, false, (e) => {
                const outsidePointer = e.type === util.pointerDown && (!(e.target instanceof Node) || !this.$el.contains(e.target));
                const escapeKey = e.type === "keydown" && e instanceof KeyboardEvent && e.keyCode === keyMap.ESC;
                return outsidePointer || escapeKey;
              }),
              util.on([document, ...util.overflowParents(this.$el)], "scroll", update, {
                passive: true
              })
            ];
            util.once(tooltip, "hide", () => handlers.forEach((handler) => handler()), {
              self: true
            });
          });
          if (!await this.toggleElement(tooltip, true)) {
            this.hide();
          }
        }
      },
      events: {
        name: `focus ${util.pointerEnter} ${util.pointerDown}`,
        // Clicking a button does not give it focus on all browsers and platforms
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#clicking_and_focus
        handler(e) {
          if ((!util.isTouch(e) || e.type === util.pointerDown) && document.readyState !== "loading") {
            this.show();
          }
        }
      }
    });
    function makeFocusable(el) {
      if (!util.isFocusable(el)) {
        el.tabIndex = 0;
      }
    }
    function getAlignment(el, target, [dir, align]) {
      const elOffset = util.offset(el);
      const targetOffset = util.offset(target);
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
      const { el, id, data } = options;
      const optionData = typeof data === "object" && data !== null && !Array.isArray(data) ? data : {};
      const values = {
        ...parseOptions(util.data(el, id != null ? id : ""), ["title"]),
        ...optionData
      };
      for (const key of ["delay", "title"]) {
        if (!(key in values)) {
          values[key] = util.data(el, key);
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

    return Component;

}));
