import { Dimensions } from '../util/lang.js';
import { parent } from '../util/filter.js';
import { css } from '../util/style.js';
import { isTag } from '../util/dom.js';
import { resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Video from './video.js';

var cover = defineComponent()({
  mixins: [Video],
  props: {
    width: Number,
    height: Number
  },
  data: {
    automute: true
  },
  created() {
    this.useObjectFit = isTag(this.$el, "img", "video");
  },
  observe: resize({
    target: ({ $el }) => getPositionedParent($el) || parent($el),
    filter: ({ useObjectFit }) => !useObjectFit
  }),
  update: {
    read() {
      if (this.useObjectFit) {
        return false;
      }
      const { $el, width = $el.clientWidth, height = $el.clientHeight } = this;
      const el = getPositionedParent($el) || parent($el);
      if (!el) {
        return false;
      }
      const dim = Dimensions.cover(
        { width, height },
        { width: el.offsetWidth, height: el.offsetHeight }
      );
      return dim.width && dim.height ? dim : false;
    },
    write({ height, width }) {
      css(this.$el, { height, width });
    },
    events: ["resize"]
  }
});
function getPositionedParent(el) {
  let current = el;
  while (current = parent(current)) {
    if (css(current, "position") !== "static") {
      return current;
    }
  }
}

export { cover as default };
