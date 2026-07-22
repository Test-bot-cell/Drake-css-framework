import { css } from '../../util/style.js';

const animations = {
  slide: {
    show(dir) {
      return [{ transform: translate(dir * -100) }, { transform: translate() }];
    },
    percent(current) {
      return translated(current);
    },
    translate(percent, dir) {
      return [
        { transform: translate(dir * -100 * percent) },
        { transform: translate(dir * 100 * (1 - percent)) }
      ];
    }
  }
};
function translated(el) {
  return Math.abs(new DOMMatrix(css(el, "transform")).m41 / el.offsetWidth);
}
function translate(value = 0, unit = "%") {
  return value ? `translate3d(${value + unit}, 0, 0)` : "";
}

export { animations as default, translate, translated };
