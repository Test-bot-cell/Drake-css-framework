import { attr } from '../util/attr.js';
import { isVisible, matches } from '../util/filter.js';
import { defineMixin } from '../api/options.js';

var SliderAutoplay = defineMixin()({
  props: {
    autoplay: Boolean,
    autoplayInterval: Number,
    pauseOnHover: Boolean
  },
  data: {
    autoplay: false,
    autoplayInterval: 7e3,
    pauseOnHover: true
  },
  connected() {
    attr(this.list, "aria-live", this.autoplay ? "off" : "polite");
    if (this.autoplay) {
      this.startAutoplay();
    }
  },
  disconnected() {
    this.stopAutoplay();
  },
  update() {
    attr(this.slides, "tabindex", "-1");
  },
  events: [
    {
      name: "visibilitychange",
      el: () => document,
      filter: ({ autoplay }) => autoplay,
      handler() {
        if (document.hidden) {
          this.stopAutoplay();
        } else {
          this.startAutoplay();
        }
      }
    }
  ],
  methods: {
    startAutoplay() {
      this.stopAutoplay();
      this.interval = setInterval(() => {
        if (!(this.stack.length || !isVisible(this.$el) || this.draggable && matches(this.$el, ":focus-within") && !matches(this.$el, ":focus") || this.pauseOnHover && matches(this.$el, ":hover"))) {
          void this.show("next");
        }
      }, this.autoplayInterval);
    },
    stopAutoplay() {
      clearInterval(this.interval);
    }
  }
});

export { SliderAutoplay as default };
