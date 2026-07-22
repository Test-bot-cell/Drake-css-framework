import { hasClass } from '../util/class.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import Switcher from './switcher.js';

var tab = defineComponent()({
  mixins: [Class],
  extends: Switcher,
  props: {
    media: Boolean
  },
  data: {
    media: 960,
    attrItem: "drk-tab-item",
    selVertical: ".drk-tab-left,.drk-tab-right"
  },
  connected() {
    const cls = hasClass(this.$el, "drk-tab-left") ? "drk-tab-left" : hasClass(this.$el, "drk-tab-right") ? "drk-tab-right" : false;
    if (cls) {
      this.$create("toggle", this.$el, { cls, mode: "media", media: this.media });
    }
  }
});

export { tab as default };
