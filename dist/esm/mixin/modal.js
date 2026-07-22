import { addClass, removeClass } from '../util/class.js';
import { once, on } from '../util/event.js';
import { includes, toFloat, last, endsWith } from '../util/lang.js';
import { css } from '../util/style.js';
import { dimensions } from '../util/dimensions.js';
import { append, $ } from '../util/dom.js';
import { pointerUp, pointerCancel, pointerDown } from '../util/env.js';
import { parent, isSameSiteAnchor, matches, isFocusable } from '../util/filter.js';
import { defineMixin } from '../api/options.js';
import { awaitFrame } from '../util/await.js';
import { preventBackgroundScroll } from '../util/scroll.js';
import Class from './class.js';
import Container from './container.js';
import { maybeDefaultPreventClick } from './event.js';
import Togglable from './togglable.js';

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

export { Modal as default };
