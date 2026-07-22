import { toggleClass } from '../util/class.js';
import { attr } from '../util/attr.js';
import { css } from '../util/style.js';
import { wrapInner } from '../util/dom.js';
import { resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import Media from '../mixin/media.js';

var leader = defineComponent()({
  mixins: [Class, Media],
  props: {
    fill: String
  },
  data: {
    fill: "",
    clsWrapper: "drk-leader-fill",
    clsHide: "drk-leader-hide",
    attrFill: "data-fill"
  },
  computed: {
    fill: ({ fill }, $el) => fill || css($el, "--drk-leader-fill-content")
  },
  connected() {
    const wrapper = wrapInner(this.$el, `<span class="${this.clsWrapper}">`)[0];
    if (wrapper instanceof HTMLElement) {
      this.wrapper = wrapper;
    }
  },
  disconnected() {
    if (this.wrapper) {
      this.wrapper.replaceWith(...this.wrapper.childNodes);
    }
  },
  observe: resize(),
  update: {
    read() {
      const width = Math.trunc(this.$el.offsetWidth / 2);
      return {
        width,
        fill: this.fill,
        hide: !this.matchMedia
      };
    },
    write({ width, fill, hide }) {
      if (!this.wrapper) {
        return;
      }
      toggleClass(this.wrapper, this.clsHide, hide);
      attr(this.wrapper, this.attrFill, new Array(width).join(fill));
    },
    events: ["resize"]
  }
});

export { leader as default };
