import { trigger, off, on } from '../util/event.js';
import { $ } from '../util/dom.js';
import { isSameSiteAnchor, getTargetedElement } from '../util/filter.js';
import { scrollIntoView } from '../util/viewport.js';
import { defineComponent } from '../api/options.js';

var scroll = defineComponent()({
  props: {
    offset: Number
  },
  data: {
    offset: 0
  },
  connected() {
    registerClick(this);
  },
  disconnected() {
    unregisterClick(this);
  },
  methods: {
    async scrollTo(el) {
      el = el && $(el) || document.body;
      if (trigger(this.$el, "beforescroll", [this, el])) {
        await scrollIntoView(el, { offset: this.offset });
        trigger(this.$el, "scrolled", [this, el]);
      }
    }
  }
});
const instances = /* @__PURE__ */ new Set();
function registerClick(cmp) {
  if (!instances.size) {
    on(document, "click", clickHandler);
  }
  instances.add(cmp);
}
function unregisterClick(cmp) {
  instances.delete(cmp);
  if (!instances.size) {
    off(document, "click", clickHandler);
  }
}
function clickHandler(e) {
  if (e.defaultPrevented) {
    return;
  }
  for (const instance of instances) {
    if (e.target instanceof Node && instance.$el.contains(e.target) && isSameSiteAnchor(instance.$el)) {
      e.preventDefault();
      if (window.location.href !== instance.$el.href) {
        window.history.pushState({}, "", instance.$el.href);
      }
      instance.scrollTo(getTargetedElement(instance.$el));
    }
  }
}

export { scroll as default };
