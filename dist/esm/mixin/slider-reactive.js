import { defineMixin } from '../api/options.js';

var SliderReactive = defineMixin()({
  update: {
    write() {
      if (this.stack.length || this.dragging || this.parallax) {
        return;
      }
      const index = this.getValidIndex();
      if (!~this.prevIndex || this.index !== index) {
        void this.show(index);
      } else {
        this._translate(1);
      }
    },
    events: ["resize"]
  }
});

export { SliderReactive as default };
