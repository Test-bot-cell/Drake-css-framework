import { hasClass } from '../util/class.js';
import { trigger, isTouch, once } from '../util/event.js';
import { includes, isBoolean } from '../util/lang.js';
import { hasAttr } from '../util/attr.js';
import { isTag } from '../util/dom.js';
import { pointerDown, pointerEnter, pointerLeave } from '../util/env.js';
import { matches, isSameSiteAnchor, isFocusable } from '../util/filter.js';
import { queryAll } from '../util/selector.js';
import { lazyload } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Media from '../mixin/media.js';
import Togglable from '../mixin/togglable.js';
import { keyMap } from '../util/keys.js';

var toggle = defineComponent()({
  mixins: [Media, Togglable],
  args: "target",
  props: {
    href: String,
    target: null,
    mode: "list",
    queued: Boolean
  },
  data: {
    href: false,
    target: false,
    mode: "click",
    queued: true
  },
  computed: {
    target: {
      get: ({ target }, $el) => {
        const selector = target || $el.hash;
        const elements = selector ? queryAll(selector, $el) : [];
        return elements.length ? elements : [$el];
      },
      observe: ({ target }) => target
    }
  },
  connected() {
    if (!includes(this.mode, "media")) {
      if (!isFocusable(this.$el)) {
        this.$el.tabIndex = 0;
      }
      if (!this.cls && isTag(this.$el, "a")) {
        this.$el.role = "button";
      }
    }
  },
  observe: lazyload({ targets: ({ target }) => target }),
  events: [
    {
      name: pointerDown,
      filter: ({ mode }) => includes(mode, "hover"),
      handler(e) {
        this._preventClick = null;
        if (!isTouch(e) || isBoolean(this._showState) || this.$el.disabled) {
          return;
        }
        trigger(this.$el, "focus");
        once(
          document,
          pointerDown,
          () => trigger(this.$el, "blur"),
          true,
          (e2) => !(e2.target instanceof Node) || !this.$el.contains(e2.target)
        );
        if (includes(this.mode, "click")) {
          this._preventClick = true;
        }
      }
    },
    {
      name: `${pointerEnter} ${pointerLeave} focus blur`,
      filter: ({ mode }) => includes(mode, "hover"),
      handler(e) {
        if (isTouch(e) || this.$el.disabled || document.readyState === "loading") {
          return;
        }
        const show = includes([pointerEnter, "focus"], e.type);
        const expanded = this.isToggled(this.target);
        if (!show && (!isBoolean(this._showState) || e.type === pointerLeave && matches(this.$el, ":focus") || e.type === "blur" && matches(this.$el, ":hover"))) {
          if (expanded === this._showState) {
            this._showState = null;
          }
          return;
        }
        if (show && isBoolean(this._showState) && expanded !== this._showState) {
          return;
        }
        this._showState = show ? expanded : null;
        this.toggle(`toggle${show ? "show" : "hide"}`);
      }
    },
    {
      name: "keydown",
      filter: ({ $el, mode }) => includes(mode, "click") && !isTag($el, "input"),
      handler(e) {
        if (e.keyCode === keyMap.SPACE || e.keyCode === keyMap.ENTER) {
          e.preventDefault();
          this.$el.click();
        }
      }
    },
    {
      name: "click",
      filter: ({ mode }) => ["click", "hover"].some((m) => includes(mode, m)),
      handler(e) {
        var _a, _b;
        if (e.defaultPrevented) {
          return;
        }
        const link = (_b = (_a = e.target) == null ? void 0 : _a.closest("a[href]")) != null ? _b : null;
        const isButtonLike = isSameSiteAnchor(link) && (!link.hash || matches(this.target, link.hash));
        if (this._preventClick || isButtonLike || link && !this.isToggled(this.target)) {
          e.preventDefault();
        }
        if (!this._preventClick && includes(this.mode, "click") && (!link || isButtonLike || e.defaultPrevented)) {
          this.toggle();
        }
      }
    },
    {
      name: "mediachange",
      filter: ({ mode }) => includes(mode, "media"),
      el: ({ target }) => target,
      handler(_event, mediaObj) {
        if (isMediaQueryList(mediaObj) && mediaObj.matches !== this.isToggled(this.target)) {
          this.toggle();
        }
      }
    }
  ],
  methods: {
    async toggle(type) {
      if (!trigger(this.target, type || "toggle", [this])) {
        return;
      }
      if (hasAttr(this.$el, "aria-expanded")) {
        this.$el.ariaExpanded = String(!this.isToggled(this.target));
      }
      if (!this.queued) {
        return this.toggleElement(this.target);
      }
      const leaving = this.target.filter((el) => hasClass(el, this.clsLeave));
      if (leaving.length) {
        for (const el of this.target) {
          const isLeaving = includes(leaving, el);
          this.toggleElement(el, isLeaving, isLeaving);
        }
        return;
      }
      const toggled = this.target.filter(this.isToggled);
      if (await this.toggleElement(toggled, false)) {
        await this.toggleElement(
          this.target.filter((el) => !includes(toggled, el)),
          true
        );
      }
    }
  }
});
function isMediaQueryList(value) {
  return typeof value === "object" && value !== null && "matches" in value && typeof value.matches === "boolean";
}

export { toggle as default };
