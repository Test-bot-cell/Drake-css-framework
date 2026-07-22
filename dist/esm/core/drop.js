import { removeClass, addClass, hasClass } from '../util/class.js';
import { isTouch, once, on } from '../util/event.js';
import { includes } from '../util/lang.js';
import { css } from '../util/style.js';
import { attr } from '../util/attr.js';
import { offset } from '../util/dimensions.js';
import { $$, append, $ } from '../util/dom.js';
import { pointerEnter, pointerLeave, pointerUp, pointerCancel, pointerDown } from '../util/env.js';
import { parent, isSameSiteAnchor, matches } from '../util/filter.js';
import { MouseTracker } from '../util/mouse.js';
import { observeViewportResize, observeResize } from '../util/observer.js';
import { overflowParents, offsetViewport } from '../util/viewport.js';
import { query } from '../util/selector.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import Container from '../mixin/container.js';
import { maybeDefaultPreventClick } from '../mixin/event.js';
import Position, { storeScrollPosition } from '../mixin/position.js';
import Togglable from '../mixin/togglable.js';
import { keyMap } from '../util/keys.js';
import { preventBackgroundScroll } from '../util/scroll.js';

let active;
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
      active = null;
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
          listenForEscClose(this),
          listenForBackgroundClose(this),
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
          active = active === null && this.$el.contains(target) && this.isToggled() ? this : active;
          return;
        }
        active = this.isActive() ? null : active;
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
      if (active) {
        if (delay && active.isDelaying()) {
          this.showTimer = setTimeout(() => matches(target, ":hover") && this.show(), 10);
          return;
        }
        let prev;
        while (active && prev !== active && !active.$el.contains(this.$el)) {
          prev = active;
          active.hide(false, false);
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
      return active === this;
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
        getViewport(this.$el, this.target[0]),
        getViewport(this.$el, this.target[1])
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
  active = drop;
}
function getViewport(el, target) {
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
function listenForEscClose(drop) {
  return on(document, "keydown", (e) => {
    if (e.keyCode === keyMap.ESC) {
      drop.hide(false);
    }
  });
}
function listenForScrollClose(drop) {
  return listenForScroll(drop, () => drop.hide(false));
}
function listenForBackgroundClose(drop) {
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

export { active, drop as default };
