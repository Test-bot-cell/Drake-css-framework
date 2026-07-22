import { Transition } from '../util/animation.js';
import { toFloat } from '../util/lang.js';
import { css } from '../util/style.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import { maybeDefaultPreventClick } from '../mixin/event.js';
import Togglable from '../mixin/togglable.js';

var alert = defineComponent()({
  mixins: [Class, Togglable],
  args: "animation",
  props: {
    animation: Boolean,
    close: String
  },
  data: {
    animation: true,
    selClose: ".drk-alert-close",
    duration: 150
  },
  events: {
    name: "click",
    delegate: ({ selClose }) => selClose,
    handler(e) {
      maybeDefaultPreventClick(e);
      this.close();
    }
  },
  methods: {
    async close() {
      await this.toggleElement(this.$el, false, animate);
      this.$destroy(true);
    }
  }
});
function animate(el, show, { duration, transition, velocity }) {
  const height = toFloat(css(el, "height"));
  css(el, "height", height);
  return Transition.start(
    el,
    {
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderTop: 0,
      borderBottom: 0,
      opacity: 0
    },
    velocity * height + duration,
    transition
  );
}

export { alert as default };
