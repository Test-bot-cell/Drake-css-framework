import { Transition } from '../util/animation.js';
import { attr } from '../util/attr.js';
import { toggleClass, hasClass } from '../util/class.js';
import { dimensions } from '../util/dimensions.js';
import { $, isTag, $$, wrapAll, unwrap } from '../util/dom.js';
import { getIndex, includes, toFloat, sumBy } from '../util/lang.js';
import { filter, children } from '../util/filter.js';
import { css } from '../util/style.js';
import { scrollParent } from '../util/viewport.js';
import { generateId } from '../api/instance.js';
import { lazyload } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import { maybeDefaultPreventClick } from '../mixin/event.js';
import Togglable from '../mixin/togglable.js';
import { keyMap } from '../util/keys.js';

var Accordion = defineComponent()({
  mixins: [Class, Togglable],
  props: {
    animation: Boolean,
    targets: String,
    active: null,
    collapsible: Boolean,
    multiple: Boolean,
    toggle: String,
    content: String,
    offset: Number
  },
  data: {
    targets: "> *",
    active: false,
    animation: true,
    collapsible: true,
    multiple: false,
    clsOpen: "drk-open",
    toggle: ".drk-accordion-title",
    content: ".drk-accordion-content",
    offset: 0
  },
  computed: {
    items: ({ targets }, $el) => $$(targets, $el),
    toggles({ toggle }) {
      return this.items.map((item) => $(toggle, item));
    },
    contents({ content }) {
      return this.items.map((item) => {
        var _a;
        return ((_a = item._wrapper) == null ? void 0 : _a.firstElementChild) || $(content, item);
      });
    }
  },
  watch: {
    items(items, prev) {
      if (prev || hasClass(items, this.clsOpen)) {
        return;
      }
      const active = this.active !== false && items[Number(this.active)] || !this.collapsible && items[0];
      if (active) {
        this.toggle(active, false);
      }
    },
    toggles() {
      this.$emit();
    },
    contents(items) {
      for (const el of items) {
        const isOpen = hasClass(
          this.items.find((item) => Boolean(el && item.contains(el))),
          this.clsOpen
        );
        hide(el, !isOpen);
      }
      this.$emit();
    }
  },
  observe: lazyload(),
  events: [
    {
      name: "click keydown",
      delegate: ({ targets, $props }) => `${targets} ${$props.toggle}`,
      handler(e) {
        if (e.type === "keydown" && e.keyCode !== keyMap.SPACE) {
          return;
        }
        if (!(e.current instanceof HTMLElement)) {
          return;
        }
        const item = this.toggles.indexOf(e.current);
        if (item === -1) {
          return;
        }
        maybeDefaultPreventClick(e);
        if (!e.target) {
          return;
        }
        const off = keepScrollPosition(e.target);
        this.toggle(item).finally(off);
      }
    },
    {
      name: "show hide shown hidden",
      self: true,
      delegate: ({ targets }) => targets,
      handler() {
        this.$emit();
      }
    }
  ],
  update() {
    const activeItems = filter(this.items, `.${this.clsOpen}`);
    for (const [itemIndex, item] of this.items.entries()) {
      const toggle = this.toggles[itemIndex];
      const content = this.contents[itemIndex];
      if (!toggle || !content) {
        continue;
      }
      toggle.id = generateId(this, toggle);
      content.id = generateId(this, content);
      const active = includes(activeItems, item);
      attr(toggle, {
        role: isTag(toggle, "a") ? "button" : null,
        "aria-controls": content.id,
        "aria-expanded": active,
        "aria-disabled": !this.collapsible && activeItems.length < 2 && active
      });
      attr(content, { role: "region", "aria-labelledby": toggle.id });
      if (isTag(content, "ul")) {
        attr(children(content), "role", "presentation");
      }
    }
  },
  methods: {
    toggle(item, animate) {
      const selected = this.items[getIndex(item, this.items)];
      let items = [selected];
      const activeItems = filter(this.items, `.${this.clsOpen}`);
      if (!this.multiple && !includes(activeItems, items[0])) {
        items = items.concat(activeItems);
      }
      if (!this.collapsible && activeItems.length < 2 && includes(activeItems, selected)) {
        items = [];
      }
      return Promise.all(
        items.map(
          (el) => this.toggleElement(el, !includes(activeItems, el), (el2, show) => {
            toggleClass(el2, this.clsOpen, show);
            if (animate === false || !this.animation) {
              hide($(this.content, el2), !show);
              return;
            }
            return transition(el2, show, this);
          })
        )
      );
    }
  }
});
function hide(el, hidden) {
  if (el) {
    el.hidden = hidden;
  }
}
async function transition(el, show, context) {
  var _a;
  const { content, velocity, transition: transition2 } = context;
  let { duration } = context;
  const contentElement = ((_a = el._wrapper) == null ? void 0 : _a.firstElementChild) || $(content, el);
  if (!(contentElement instanceof HTMLElement)) {
    return;
  }
  if (!el._wrapper) {
    const wrapper2 = wrapAll(contentElement, "<div>");
    if (wrapper2 instanceof HTMLElement) {
      el._wrapper = wrapper2;
    }
  }
  const wrapper = el._wrapper;
  if (!wrapper) {
    return;
  }
  css(wrapper, "overflow", "hidden");
  const currentHeight = toFloat(css(wrapper, "height"));
  await Transition.cancel(wrapper);
  hide(contentElement, false);
  const endHeight = sumBy(["marginTop", "marginBottom"], (prop) => css(contentElement, prop)) + dimensions(contentElement).height;
  const percent = currentHeight / endHeight;
  duration = endHeight ? (velocity * endHeight + duration) * (show ? 1 - percent : percent) : 0;
  css(wrapper, "height", currentHeight);
  await Transition.start(wrapper, { height: show ? endHeight : 0 }, duration, transition2);
  unwrap(contentElement);
  delete el._wrapper;
  if (!show) {
    hide(contentElement, true);
  }
}
function keepScrollPosition(el) {
  const scrollElement = scrollParent(el, true);
  let frame = 0;
  (function scroll() {
    frame = requestAnimationFrame(() => {
      const { top } = dimensions(el);
      if (top < 0) {
        scrollElement.scrollTop += top;
      }
      scroll();
    });
  })();
  return () => requestAnimationFrame(() => cancelAnimationFrame(frame));
}

export { Accordion as default };
