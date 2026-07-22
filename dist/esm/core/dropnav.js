import { Transition } from '../util/animation.js';
import { includes, noop, getIndex, findIndex, toFloat } from '../util/lang.js';
import { hasClass, addClass } from '../util/class.js';
import { offset, height } from '../util/dimensions.js';
import { $, $$, after, remove } from '../util/dom.js';
import { isRtl, pointerMove, pointerEnter, pointerLeave } from '../util/env.js';
import { once, on } from '../util/event.js';
import { selFocusable, isInput, matches, parents } from '../util/filter.js';
import { observeResize } from '../util/observer.js';
import { css } from '../util/style.js';
import { query } from '../util/selector.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import Container from '../mixin/container.js';
import { keyMap } from '../util/keys.js';
import { active } from './drop.js';

var Dropnav = defineComponent()({
  mixins: [Class, Container],
  props: {
    align: String,
    boundary: Boolean,
    dropbar: Boolean,
    dropbarAnchor: Boolean,
    duration: Number,
    mode: Boolean,
    offset: Boolean,
    stretch: Boolean,
    delayShow: Boolean,
    delayHide: Boolean,
    target: Boolean,
    targetX: Boolean,
    targetY: Boolean,
    animation: Boolean,
    animateOut: Boolean,
    closeOnScroll: Boolean
  },
  data: {
    align: isRtl ? "right" : "left",
    clsDrop: "drk-dropdown",
    clsDropbar: "drk-dropnav-dropbar",
    boundary: true,
    dropbar: false,
    dropbarAnchor: false,
    flip: true,
    delayShow: 160,
    duration: 200,
    container: false,
    selNavItem: "> li > a, > ul > li > a"
  },
  computed: {
    dropbarAnchor: ({ dropbarAnchor }, $el) => resolveDropnavElement(dropbarAnchor, $el) || $el,
    dropbar({ dropbar }) {
      if (!dropbar) {
        return null;
      }
      const element = this._dropbar || resolveDropnavElement(dropbar, this.$el) || $(`+ .${this.clsDropbar}`, this.$el);
      return element || (this._dropbar = document.createElement("div"));
    },
    dropContainer(_props, $el) {
      return this.container || $el;
    },
    dropdowns({ clsDrop }, $el) {
      var _a;
      const dropdowns = $$(`.${clsDrop}`, $el);
      if (this.dropContainer !== $el) {
        for (const el of $$(`.${clsDrop}`, this.dropContainer)) {
          const target = (_a = this.getDropdown(el)) == null ? void 0 : _a.targetEl;
          if (!includes(dropdowns, el) && target && this.$el.contains(target)) {
            dropdowns.push(el);
          }
        }
      }
      return dropdowns;
    },
    items({ selNavItem }, $el) {
      return $$(selNavItem, $el);
    }
  },
  watch: {
    dropbar(dropbar) {
      addClass(
        dropbar,
        "drk-dropbar",
        "drk-dropbar-top",
        this.clsDropbar,
        `drk-${this.$options.name}-dropbar`
      );
    },
    dropdowns() {
      this.initializeDropdowns();
    }
  },
  connected() {
    this.initializeDropdowns();
    preventInitialPointerEnter(this.$el);
  },
  disconnected() {
    remove(this._dropbar);
    delete this._dropbar;
  },
  events: [
    {
      name: "mouseover focusin",
      delegate: ({ selNavItem }) => selNavItem,
      handler({ current }) {
        const active2 = this.getActive();
        if (active2 && includes(active2.mode, "hover") && active2.targetEl && current && !current.contains(active2.targetEl) && !active2.isDelaying()) {
          active2.hide(false);
        }
      }
    },
    {
      name: "keydown",
      self: true,
      delegate: ({ selNavItem }) => selNavItem,
      handler(e) {
        var _a;
        const { current, keyCode } = e;
        const active2 = this.getActive();
        if (keyCode === keyMap.DOWN) {
          if (active2 && active2.targetEl === current) {
            e.preventDefault();
            (_a = $(selFocusable, active2.$el)) == null ? void 0 : _a.focus();
          } else {
            const dropdown = this.dropdowns.find(
              (el) => {
                var _a2;
                return ((_a2 = this.getDropdown(el)) == null ? void 0 : _a2.targetEl) === current;
              }
            );
            if (dropdown) {
              e.preventDefault();
              if (current instanceof HTMLElement) {
                current.click();
              }
              once(dropdown, "show", (event) => {
                var _a2;
                if (event.target) {
                  (_a2 = $(selFocusable, event.target)) == null ? void 0 : _a2.focus();
                }
              });
            }
          }
        }
        handleNavItemNavigation(e, this.items, active2);
      }
    },
    {
      name: "keydown",
      el: ({ dropContainer }) => dropContainer,
      delegate: ({ clsDrop }) => `.${clsDrop}`,
      handler(e) {
        var _a, _b;
        const { current, keyCode, target } = e;
        if (isInput(target) || !includes(this.dropdowns, current)) {
          return;
        }
        const active2 = this.getActive();
        let next = -1;
        if (keyCode === keyMap.HOME) {
          next = 0;
        } else if (keyCode === keyMap.END) {
          next = "last";
        } else if (keyCode === keyMap.UP) {
          next = "previous";
        } else if (keyCode === keyMap.DOWN) {
          next = "next";
        } else if (keyCode === keyMap.ESC) {
          (_a = active2 == null ? void 0 : active2.targetEl) == null ? void 0 : _a.focus();
        }
        if (next !== -1) {
          e.preventDefault();
          const elements = $$(selFocusable, current);
          (_b = elements[getIndex(
            next,
            elements,
            findIndex(elements, (el) => matches(el, ":focus"))
          )]) == null ? void 0 : _b.focus();
          return;
        }
        handleNavItemNavigation(e, this.items, active2);
      }
    },
    {
      name: "mouseleave",
      el: ({ dropbar }) => dropbar,
      filter: ({ dropbar }) => Boolean(dropbar),
      handler() {
        const active2 = this.getActive();
        if (active2 && includes(active2.mode, "hover") && !this.dropdowns.some((el) => matches(el, ":hover"))) {
          active2.hide();
        }
      }
    },
    {
      name: "beforeshow",
      el: ({ dropContainer }) => dropContainer,
      filter: ({ dropbar }) => Boolean(dropbar),
      handler({ target }) {
        if (!(target instanceof HTMLElement) || !this.dropbar || !this.isDropbarDrop(target)) {
          return;
        }
        if (this.dropbar.previousElementSibling !== this.dropbarAnchor) {
          after(this.dropbarAnchor, this.dropbar);
        }
        addClass(target, `${this.clsDrop}-dropbar`);
      }
    },
    {
      name: "show",
      el: ({ dropContainer }) => dropContainer,
      filter: ({ dropbar }) => Boolean(dropbar),
      handler({ target }) {
        if (!(target instanceof HTMLElement) || !this.dropbar || !this.isDropbarDrop(target)) {
          return;
        }
        const dropdownElement = target;
        const drop = this.getDropdown(dropdownElement);
        if (!drop) {
          return;
        }
        const dropbar = this.dropbar;
        const adjustHeight = () => {
          const maxBottom = Math.max(
            ...parents(dropdownElement, `.${this.clsDrop}`).concat(dropdownElement).map((el) => offset(el).bottom)
          );
          offset(dropbar, {
            left: offset(dropbar).left,
            top: this.getDropbarOffset(drop.getPositionOffset())
          });
          this.transitionTo(
            maxBottom - offset(dropbar).top + toFloat(css(dropdownElement, "marginBottom")),
            dropdownElement
          );
        };
        const resizeTargets = [drop.$el, ...drop.target].filter(
          (element) => element instanceof Element
        );
        this._observer = observeResize(resizeTargets, adjustHeight);
        adjustHeight();
      }
    },
    {
      name: "beforehide",
      el: ({ dropContainer }) => dropContainer,
      filter: ({ dropbar }) => Boolean(dropbar),
      handler(e) {
        const active2 = this.getActive();
        if (matches(this.dropbar, ":hover") && active2 && active2.$el === e.target && this.isDropbarDrop(active2.$el) && includes(active2.mode, "hover") && active2.isDelayedHide && !this.items.some((el) => active2.targetEl !== el && matches(el, ":focus"))) {
          e.preventDefault();
        }
      }
    },
    {
      name: "hide",
      el: ({ dropContainer }) => dropContainer,
      filter: ({ dropbar }) => Boolean(dropbar),
      handler({ target }) {
        var _a;
        if (!target || !this.isDropbarDrop(target)) {
          return;
        }
        (_a = this._observer) == null ? void 0 : _a.disconnect();
        const active2 = this.getActive();
        if (!active2 || active2.$el === target) {
          this.transitionTo(0);
        }
      }
    }
  ],
  methods: {
    getActive() {
      var _a;
      return includes(this.dropdowns, (_a = active) == null ? void 0 : _a.$el) && active;
    },
    async transitionTo(newHeight, el) {
      const { dropbar } = this;
      if (!dropbar) {
        return;
      }
      const oldHeight = height(dropbar);
      if (oldHeight >= newHeight) {
        el = void 0;
      }
      await Transition.cancel(el ? [el, dropbar] : dropbar);
      if (el) {
        const diff = offset(el).top - offset(dropbar).top - oldHeight;
        if (diff > 0) {
          css(el, "transitionDelay", `${diff / newHeight * this.duration}ms`);
        }
      }
      css(el, "clipPath", `polygon(0 0,100% 0,100% ${oldHeight}px,0 ${oldHeight}px)`);
      height(dropbar, oldHeight);
      await Promise.all([
        Transition.start(dropbar, { height: newHeight }, this.duration),
        Transition.start(
          el,
          { clipPath: `polygon(0 0,100% 0,100% ${newHeight}px,0 ${newHeight}px)` },
          this.duration
        ).finally(() => css(el, { clipPath: "", transitionDelay: "" }))
      ]).catch(noop);
    },
    getDropdown(el) {
      const component = this.$getComponent(el, "drop") || this.$getComponent(el, "dropdown");
      return isDropInstance(component) ? component : void 0;
    },
    isDropbarDrop(el) {
      return includes(this.dropdowns, el) && hasClass(el, this.clsDrop);
    },
    getDropbarOffset(offsetTop) {
      const { $el, target, targetY } = this;
      const targetElement = resolveDropnavElement(targetY || target, $el) || $el;
      const { top, height: height2 } = offset(targetElement);
      return top + height2 + offsetTop;
    },
    initializeDropdowns() {
      this.$create(
        "drop",
        this.dropdowns.filter((el) => !this.getDropdown(el)),
        {
          ...this.$props,
          flip: this.flip && !this.$props.dropbar,
          shift: true,
          pos: `bottom-${this.align}`,
          boundary: false,
          boundaryX: this.boundary === true ? this.$el : this.boundary
        }
      );
    }
  }
});
function handleNavItemNavigation(e, toggles, currentDrop) {
  var _a, _b;
  const { current, keyCode } = e;
  let next = -1;
  if (keyCode === keyMap.HOME) {
    next = 0;
  } else if (keyCode === keyMap.END) {
    next = "last";
  } else if (keyCode === keyMap.LEFT) {
    next = "previous";
  } else if (keyCode === keyMap.RIGHT) {
    next = "next";
  } else if (keyCode === keyMap.TAB) {
    (_a = currentDrop == null ? void 0 : currentDrop.targetEl) == null ? void 0 : _a.focus();
    currentDrop == null ? void 0 : currentDrop.hide(false);
  }
  if (next !== -1) {
    e.preventDefault();
    currentDrop == null ? void 0 : currentDrop.hide(false);
    const currentToggle = (currentDrop == null ? void 0 : currentDrop.targetEl) || current;
    const currentIndex = currentToggle instanceof HTMLElement ? toggles.indexOf(currentToggle) : -1;
    (_b = toggles[getIndex(next, toggles, currentIndex)]) == null ? void 0 : _b.focus();
  }
}
function preventInitialPointerEnter(el) {
  let handlers = [];
  const off = () => handlers.forEach((handler) => handler());
  handlers = [
    once(el.ownerDocument, pointerMove, (e) => {
      if (!(e.target instanceof Node && el.contains(e.target))) {
        off();
      }
    }),
    on(el, `mouseenter ${pointerEnter}`, (e) => e.stopPropagation(), { capture: true }),
    on(el, `mouseleave ${pointerLeave}`, off, { capture: true })
  ];
}
function resolveDropnavElement(value, context) {
  if (value instanceof HTMLElement) {
    return value;
  }
  return typeof value === "string" ? query(value, context) : void 0;
}
function isDropInstance(value) {
  return typeof value === "object" && value !== null && "$el" in value && value.$el instanceof HTMLElement && "hide" in value && typeof value.hide === "function" && "getPositionOffset" in value && typeof value.getPositionOffset === "function";
}

export { Dropnav as default };
