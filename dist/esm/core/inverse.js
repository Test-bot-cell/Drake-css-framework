import { replaceClass } from '../util/class.js';
import { on } from '../util/event.js';
import { toNodes, intersectRect } from '../util/lang.js';
import { css } from '../util/style.js';
import { dimensions } from '../util/dimensions.js';
import { $$ } from '../util/dom.js';
import { matches, parent } from '../util/filter.js';
import { observeResize } from '../util/observer.js';
import { intersection, mutation } from '../api/observables.js';
import { defineComponent } from '../api/options.js';

var inverse = defineComponent()({
  props: {
    target: String,
    selActive: String
  },
  data: {
    target: false,
    selActive: false
  },
  connected() {
    this.isIntersecting = 0;
  },
  computed: {
    target: ({ target }, $el) => target ? $$(target, $el) : $el
  },
  watch: {
    target: {
      handler() {
        queueMicrotask(() => this.$reset());
      },
      immediate: false
    }
  },
  observe: [
    intersection({
      handler(entries) {
        this.isIntersecting = entries.reduce(
          (sum, { isIntersecting }) => sum + (isIntersecting ? 1 : this.isIntersecting ? -1 : 0),
          this.isIntersecting
        );
        this.$emit();
      },
      target: ({ target }) => target,
      args: { intersecting: false }
    }),
    mutation({
      target: ({ target }) => target,
      options: { attributes: true, attributeFilter: ["class"] }
    }),
    {
      target: ({ target }) => target,
      observe: (target, handler) => {
        const targets = toNodes(target).filter(
          (node) => node instanceof Element
        );
        const observer = observeResize([...targets, document.documentElement], handler);
        const notify = () => handler();
        const observe = (element) => {
          if ("observe" in observer) {
            observer.observe(element);
          }
        };
        const unobserve = (element) => {
          if ("unobserve" in observer) {
            observer.unobserve(element);
          }
        };
        const listener = [
          on(document, "scroll itemshown itemhidden", notify, {
            passive: true,
            capture: true
          }),
          on(document, "show hide transitionstart", (e) => {
            handler();
            if (e.target instanceof Element) {
              observe(e.target);
            }
          }),
          on(
            document,
            "shown hidden transitionend transitioncancel",
            (e) => {
              handler();
              if (e.target instanceof Element) {
                unobserve(e.target);
              }
            }
          )
        ];
        return {
          observe,
          unobserve,
          disconnect() {
            observer.disconnect();
            listener.map((off) => off());
          }
        };
      },
      handler() {
        this.$emit();
      }
    }
  ],
  update: {
    read() {
      if (!this.isIntersecting) {
        return false;
      }
      for (const target of toNodes(this.target)) {
        const color = !this.selActive || matches(target, this.selActive) ? findTargetColor(target) : "";
        if (color !== false) {
          replaceClass(target, "drk-light drk-dark", color);
        }
      }
    }
  }
});
function findTargetColor(target) {
  const dim = dimensions(target);
  const viewport = dimensions(window);
  if (!intersectRect(dim, viewport)) {
    return false;
  }
  const { left, top, height, width } = dim;
  let last = "";
  for (const percent of [0.25, 0.5, 0.75]) {
    const elements = target.ownerDocument.elementsFromPoint(
      Math.max(0, Math.min(left + width * percent, viewport.width - 1)),
      Math.max(0, Math.min(top + height / 2, viewport.height - 1))
    );
    for (const element of elements) {
      if (target.contains(element) || !checkVisibility(element) || element.closest('[class*="-leave"]') && elements.some((el) => element !== el && matches(el, '[class*="-enter"]'))) {
        continue;
      }
      const color = css(element, "--drk-inverse");
      if (color) {
        if (color === last) {
          return `drk-${color}`;
        }
        last = color;
        break;
      }
    }
  }
  return last ? `drk-${last}` : "";
}
function checkVisibility(element) {
  if (css(element, "visibility") !== "visible") {
    return false;
  }
  let current = element;
  while (current) {
    if (css(current, "opacity") === "0") {
      return false;
    }
    current = parent(current);
  }
  return true;
}

export { inverse as default };
