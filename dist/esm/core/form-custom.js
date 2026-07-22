import { isInput, matches, parent, selInput } from '../util/filter.js';
import { $$, $ } from '../util/dom.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';

var formCustom = defineComponent()({
  mixins: [Class],
  args: "target",
  props: {
    target: Boolean
  },
  data: {
    target: false
  },
  computed: {
    input: (_props, $el) => $(selInput, $el),
    state() {
      return this.input.nextElementSibling;
    },
    target({ target }, $el) {
      return target && (target === true && parent(this.input) === $el && this.input.nextElementSibling || (typeof target === "string" ? $(target, $el) : void 0));
    }
  },
  update() {
    var _a;
    const { target, input } = this;
    if (!target) {
      return;
    }
    const inputTarget = isInput(target) && "value" in target;
    const prev = inputTarget ? String(target.value) : target.textContent;
    const selectedOption = input instanceof HTMLSelectElement ? $$("option", input).find((el) => el.selected) : void 0;
    const value = input instanceof HTMLInputElement && ((_a = input.files) == null ? void 0 : _a[0]) ? input.files[0].name : matches(input, "select") && selectedOption ? selectedOption.textContent : input.value;
    if (prev !== value) {
      if (inputTarget) {
        target.value = value != null ? value : "";
      } else {
        target.textContent = value;
      }
    }
  },
  events: [
    {
      name: "change",
      handler() {
        this.$emit();
      }
    },
    {
      name: "reset",
      el: ({ $el }) => $el.closest("form"),
      handler() {
        this.$emit();
      }
    }
  ]
});

export { formCustom as default };
