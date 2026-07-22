import { $ } from '../util/dom.js';
import { defineMixin } from '../api/options.js';

var Container = defineMixin()({
  props: {
    container: Boolean
  },
  data: {
    container: true
  },
  computed: {
    container({ container }) {
      if (container === true) {
        return this.$container;
      }
      if (typeof container === "string") {
        return container ? $(container) : "";
      }
      return container ? $(container) : false;
    }
  }
});

export { Container as default };
