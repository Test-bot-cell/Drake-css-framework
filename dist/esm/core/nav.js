import { defineComponent } from '../api/options.js';
import Accordion from './accordion.js';

var nav = defineComponent()({
  extends: Accordion,
  data: {
    targets: "> .drk-parent",
    toggle: "> a",
    content: "> ul"
  }
});

export { nav as default };
