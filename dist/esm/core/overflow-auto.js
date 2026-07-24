import { isVisible } from '../util/filter.js';
import { css } from '../util/style.js';
import { height, dimensions } from '../util/dimensions.js';
import { resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';

var overflowAuto = defineComponent()({
  mixins: [Class],
  props: {
    selContainer: String,
    selContent: String,
    minHeight: Number
  },
  data: {
    selContainer: ".drk-modal",
    selContent: ".drk-modal-dialog",
    minHeight: 150
  },
  computed: {
    container: ({ selContainer }, $el) => {
      var _a;
      return (_a = $el.closest(selContainer)) != null ? _a : void 0;
    },
    content: ({ selContent }, $el) => {
      var _a;
      return (_a = $el.closest(selContent)) != null ? _a : void 0;
    }
  },
  observe: resize({
    target: ({ container, content }) => [container, content].filter((element) => Boolean(element))
  }),
  update: {
    read() {
      if (!this.content || !this.container || !isVisible(this.$el)) {
        return false;
      }
      return {
        max: Math.max(
          this.minHeight,
          height(this.container) - (dimensions(this.content).height - height(this.$el))
        )
      };
    },
    write({ max }) {
      css(this.$el, { minHeight: this.minHeight, maxHeight: max });
      this.$el.tabIndex = 0;
    },
    events: ["resize"]
  }
});

export { overflowAuto as default };
