import { css } from '../../util/style.js';
import animations from '../../mixin/internal/slideshow-animations.js';
import { scale3d } from './slideshow-animations.js';

var Animations = {
  ...animations,
  fade: {
    show() {
      return [{ opacity: 0 }, { opacity: 1 }];
    },
    percent(current) {
      return 1 - Number(css(current, "opacity"));
    },
    translate(percent) {
      return [{ opacity: 1 - percent }, { opacity: percent }];
    }
  },
  scale: {
    show() {
      return [
        { opacity: 0, transform: scale3d(1 - 0.2) },
        { opacity: 1, transform: scale3d(1) }
      ];
    },
    percent(current) {
      return 1 - Number(css(current, "opacity"));
    },
    translate(percent) {
      return [
        { opacity: 1 - percent, transform: scale3d(1 - 0.2 * percent) },
        { opacity: percent, transform: scale3d(1 - 0.2 + 0.2 * percent) }
      ];
    }
  }
};

export { Animations as default };
