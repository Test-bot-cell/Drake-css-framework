import { addClass } from '../util/class.js';
import { css } from '../util/style.js';
import { defineComponent } from '../api/options.js';

var responsive = defineComponent()({
  props: ["width", "height"],
  connected() {
    addClass(this.$el, "drk-responsive-width");
    css(this.$el, "aspectRatio", `${this.width}/${this.height}`);
  }
});

export { responsive as default };
