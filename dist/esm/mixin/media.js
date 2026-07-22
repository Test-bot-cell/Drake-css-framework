import { isString, startsWith, toFloat, isNumeric } from '../util/lang.js';
import { on, trigger, createEvent } from '../util/event.js';
import { css } from '../util/style.js';
import { defineMixin } from '../api/options.js';

var Media = defineMixin()({
  props: {
    media: Boolean
  },
  data: {
    media: false
  },
  connected() {
    const media = toMedia(this.media, this.$el);
    this.matchMedia = true;
    if (media) {
      this.mediaObj = window.matchMedia(media);
      const handler = () => {
        this.matchMedia = this.mediaObj.matches;
        trigger(this.$el, createEvent("mediachange", false, true, [this.mediaObj]));
      };
      this.offMediaObj = on(this.mediaObj, "change", () => {
        handler();
        this.$emit("resize");
      });
      handler();
    }
  },
  disconnected() {
    var _a;
    (_a = this.offMediaObj) == null ? void 0 : _a.call(this);
  }
});
function toMedia(value, element) {
  if (isString(value)) {
    if (startsWith(value, "@")) {
      value = toFloat(css(element, `--drk-breakpoint-${value.slice(1)}`));
    } else if (Number.isNaN(Number(value))) {
      return value;
    }
  }
  return value && isNumeric(value) ? `(min-width: ${value}px)` : "";
}

export { Media as default };
