import { toggleClass, hasClass } from '../util/class.js';
import { toArray, isNumeric, getIndex, findIndex, endsWith } from '../util/lang.js';
import { queryAll } from '../util/selector.js';
import { css } from '../util/style.js';
import { attr, data } from '../util/attr.js';
import { isTag, $$ } from '../util/dom.js';
import { matches, children } from '../util/filter.js';
import { generateId } from '../api/instance.js';
import { lazyload, swipe } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import { maybeDefaultPreventClick } from '../mixin/event.js';
import Togglable from '../mixin/togglable.js';
import { keyMap } from '../util/keys.js';

const selDisabled = ".drk-disabled *, .drk-disabled, [disabled]";
var Switcher = defineComponent()({
  mixins: [Togglable],
  args: "connect",
  props: {
    connect: String,
    toggle: String,
    itemNav: String,
    active: Number,
    followFocus: Boolean,
    swiping: Boolean
  },
  data: {
    connect: "~.drk-switcher",
    toggle: "> * > :first-child",
    itemNav: false,
    active: 0,
    cls: "drk-active",
    attrItem: "drk-switcher-item",
    selVertical: ".drk-nav",
    followFocus: false,
    swiping: true
  },
  computed: {
    connects: {
      get: ({ connect }, $el) => queryAll(connect, $el),
      observe: ({ connect }) => connect
    },
    connectChildren() {
      return this.connects.map((el) => children(el)).flat();
    },
    toggles: ({ toggle }, $el) => $$(toggle, $el),
    children(_props, $el) {
      return children($el).filter(
        (child) => this.toggles.some((toggle) => child.contains(toggle))
      );
    }
  },
  watch: {
    connects(connects) {
      if (this.swiping) {
        css(connects, "touchAction", "pan-y pinch-zoom");
      }
      this.$emit();
    },
    connectChildren() {
      const index = Math.max(0, this.index());
      for (const el of this.connects) {
        children(el).forEach((child, i) => toggleClass(child, this.cls, i === index));
      }
      this.$emit();
    },
    toggles() {
      this.$emit();
      const active = this.index();
      this.show(~active ? active : this.next(this.active));
    }
  },
  connected() {
    this.$el.role = "tablist";
  },
  observe: [
    lazyload({ targets: ({ connectChildren }) => connectChildren }),
    swipe({
      target: ({ connects }) => connects,
      filter: ({ swiping }) => swiping
    })
  ],
  events: [
    {
      name: "click keydown",
      delegate: ({ toggle }) => toggle,
      handler(e) {
        if (!matches(e.current, selDisabled) && (e.type === "click" || e.keyCode === keyMap.SPACE)) {
          maybeDefaultPreventClick(e);
          if (e.current) {
            this.show(e.current);
          }
        }
      }
    },
    {
      name: "keydown",
      delegate: ({ toggle }) => toggle,
      handler(e) {
        const { current, keyCode } = e;
        const isVertical = matches(this.$el, this.selVertical);
        const item = keyCode === keyMap.HOME ? 0 : keyCode === keyMap.END ? "last" : keyCode === keyMap.LEFT && !isVertical || keyCode === keyMap.UP && isVertical ? "previous" : keyCode === keyMap.RIGHT && !isVertical || keyCode === keyMap.DOWN && isVertical ? "next" : -1;
        if (item !== -1) {
          e.preventDefault();
          const next = this.toggles[this.next(
            item,
            current instanceof HTMLElement ? this.toggles.indexOf(current) : -1
          )];
          if (next) {
            next.focus();
            if (this.followFocus) {
              this.show(next);
            }
          }
        }
      }
    },
    {
      name: "click",
      el: ({ $el, connects, itemNav }) => connects.concat(itemNav ? queryAll(itemNav, $el) : []),
      delegate: ({ attrItem }) => `[${attrItem}],[data-${attrItem}]`,
      handler(e) {
        var _a;
        if ((_a = e.target) == null ? void 0 : _a.closest("a,button")) {
          maybeDefaultPreventClick(e);
          const item = data(e.current, this.attrItem);
          if (item !== void 0 && item !== null) {
            this.show(item);
          }
        }
      }
    },
    {
      name: "swipeRight swipeLeft",
      filter: ({ swiping }) => swiping,
      el: ({ connects }) => connects,
      handler({ type }) {
        this.show(endsWith(type, "Left") ? "next" : "previous");
      }
    }
  ],
  update() {
    var _a;
    for (const el of this.connects) {
      if (isTag(el, "ul")) {
        el.role = "presentation";
      }
    }
    attr(children(this.$el), "role", "presentation");
    for (const [index, toggle] of this.toggles.entries()) {
      const item = (_a = this.connects[0]) == null ? void 0 : _a.children[index];
      toggle.role = "tab";
      if (!item) {
        continue;
      }
      toggle.id = generateId(this, toggle);
      item.id = generateId(this, item);
      attr(toggle, "aria-controls", item.id);
      attr(item, { role: "tabpanel", "aria-labelledby": toggle.id });
    }
    attr(this.$el, "aria-orientation", matches(this.$el, this.selVertical) ? "vertical" : null);
  },
  methods: {
    index() {
      return findIndex(this.children, (el) => hasClass(el, this.cls));
    },
    next(item, prev) {
      var _a;
      prev != null ? prev : prev = this.index();
      if (isNumeric(item)) {
        for (let i = 0; i < this.toggles.length; i++) {
          const index = getIndex(i + Number(item), this.toggles);
          if (!matches(this.toggles[index], selDisabled)) {
            return index;
          }
        }
      }
      const toggles = this.toggles.filter((el) => !matches(el, selDisabled));
      const currentToggle = this.toggles[prev];
      const resolvedItem = resolveSwitcherItem(item);
      return getIndex(
        (_a = toggles[getIndex(
          resolvedItem,
          toggles,
          currentToggle ? toggles.indexOf(currentToggle) : -1
        )]) != null ? _a : -1,
        this.toggles
      );
    },
    show(item) {
      const prev = this.index();
      const next = this.next(item);
      this.children.forEach((child, i) => {
        toggleClass(child, this.cls, next === i);
        attr(this.toggles[i], {
          "aria-selected": next === i,
          tabindex: next === i ? null : -1
        });
      });
      const animate = prev >= 0 && prev !== next;
      this.connects.forEach(async ({ children: children2 }) => {
        const actives = toArray(children2).filter(
          (child, i) => i !== next && hasClass(child, this.cls)
        );
        if (await this.toggleElement(actives, false, animate)) {
          await this.toggleElement(children2[next], true, animate);
        }
      });
    }
  }
});
function resolveSwitcherItem(item) {
  if (item instanceof Node || typeof item === "number") {
    return item;
  }
  if (item === "next" || item === "previous" || item === "last") {
    return item;
  }
  return isNumeric(item) ? Number(item) : -1;
}

export { Switcher as default };
