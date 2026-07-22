import { removeClass, hasClass, addClass } from '../util/class.js';
import { defineMixin } from '../api/options.js';

var Class = defineMixin()({
  connected() {
    this._cmpCls = hasClass(this.$el, this.$options.id);
    addClass(this.$el, this.$options.id);
  },
  disconnected() {
    if (!this._cmpCls) {
      removeClass(this.$el, this.$options.id);
    }
  }
});

export { Class as default };
