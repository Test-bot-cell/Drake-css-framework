import { query } from '../util/selector.js';
import { css } from '../util/style.js';
import { resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';

var heightPlaceholder = defineComponent()({
  args: "target",
  props: {
    target: String
  },
  data: {
    target: ""
  },
  computed: {
    target: {
      get: ({ target }, $el) => query(target, $el),
      observe: ({ target }) => target
    }
  },
  observe: resize({ target: ({ target }) => target }),
  update: {
    read() {
      return this.target ? { height: this.target.offsetHeight } : false;
    },
    write({ height }) {
      css(this.$el, "minHeight", height);
    },
    events: ["resize"]
  }
});

export { heightPlaceholder as default };
