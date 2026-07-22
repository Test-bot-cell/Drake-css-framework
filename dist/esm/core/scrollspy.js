import { toggleClass, removeClass } from '../util/class.js';
import { once, trigger } from '../util/event.js';
import { css } from '../util/style.js';
import { data } from '../util/attr.js';
import { $$ } from '../util/dom.js';
import { filter } from '../util/filter.js';
import { intersection } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import { awaitTimeout } from '../util/await.js';

const clsInView = "drk-scrollspy-inview";
var scrollspy = defineComponent()({
  args: "cls",
  props: {
    cls: String,
    target: String,
    hidden: Boolean,
    margin: String,
    repeat: Boolean,
    delay: Number
  },
  data: () => ({
    cls: "",
    target: false,
    hidden: true,
    margin: "-1px",
    repeat: false,
    delay: 0
  }),
  computed: {
    elements: ({ target }, $el) => target ? $$(target, $el) : [$el]
  },
  watch: {
    elements(elements) {
      if (this.hidden) {
        css(filter(elements, `:not(.${clsInView})`), "opacity", 0);
      }
    }
  },
  connected() {
    this.elementData = /* @__PURE__ */ new Map();
  },
  disconnected() {
    var _a, _b;
    for (const [el, state] of (_b = (_a = this.elementData) == null ? void 0 : _a.entries()) != null ? _b : []) {
      removeClass(el, clsInView, state.cls || "");
    }
    delete this.elementData;
  },
  observe: intersection({
    target: ({ elements }) => elements,
    handler(records) {
      const elements = this.elementData;
      if (!elements) {
        return;
      }
      for (const { target: el, isIntersecting } of records) {
        if (!elements.has(el)) {
          elements.set(el, {
            cls: data(el, "drk-scrollspy-class") || this.cls
          });
        }
        const state = elements.get(el);
        if (!state || !this.repeat && state.show) {
          continue;
        }
        state.show = isIntersecting;
      }
      this.$emit();
    },
    options: ({ margin }) => ({ rootMargin: margin }),
    args: { intersecting: false }
  }),
  update: [
    {
      write(data) {
        var _a, _b;
        for (const [el, state] of (_b = (_a = this.elementData) == null ? void 0 : _a.entries()) != null ? _b : []) {
          if (state.show && !state.inview && !state.queued) {
            state.queued = true;
            data.promise = (data.promise || Promise.resolve()).then(async () => {
              await awaitTimeout(state.show ? this.delay : 0);
              this.toggle(el, true);
              setTimeout(() => {
                state.queued = false;
                this.$emit();
              }, 300);
            });
          } else if (!state.show && state.inview && !state.queued && this.repeat) {
            this.toggle(el, false);
          }
        }
      }
    }
  ],
  methods: {
    toggle(el, inview) {
      var _a, _b;
      const state = (_a = this.elementData) == null ? void 0 : _a.get(el);
      if (!state) {
        return;
      }
      (_b = state.off) == null ? void 0 : _b.call(state);
      css(el, "opacity", !inview && this.hidden ? 0 : "");
      toggleClass(el, clsInView, inview);
      toggleClass(el, state.cls);
      const animationClasses = state.cls.match(/\bdrk-animation-[\w-]+/g);
      if (animationClasses) {
        const removeAnimationClasses = () => removeClass(el, animationClasses);
        if (inview) {
          state.off = once(el, "animationcancel animationend", removeAnimationClasses, {
            self: true
          });
        } else {
          removeAnimationClasses();
        }
      }
      trigger(el, inview ? "inview" : "outview");
      state.inview = inview;
    }
  }
});

export { scrollspy as default };
