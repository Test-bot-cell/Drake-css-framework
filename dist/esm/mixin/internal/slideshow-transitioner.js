import { Transition } from '../../util/animation.js';
import { noop, clamp } from '../../util/lang.js';
import { trigger, createEvent } from '../../util/event.js';
import { css, resetProps } from '../../util/style.js';

function Transitioner(prev, next, dir, { animation, easing }) {
  const { percent, translate, show } = animation;
  const props = show(dir);
  const { promise, resolve } = withResolvers();
  return {
    dir,
    show(duration, initialPercent = 0, linear = false) {
      const timing = linear ? "linear" : easing;
      duration -= Math.round(duration * clamp(initialPercent, -1, 1));
      this.translate(initialPercent);
      triggerUpdate(next, "itemin", { percent: initialPercent, duration, timing, dir });
      triggerUpdate(prev, "itemout", {
        percent: 1 - initialPercent,
        duration,
        timing,
        dir
      });
      Promise.all([
        Transition.start(next, props[1], duration, timing),
        Transition.start(prev, props[0], duration, timing)
      ]).then(() => {
        this.reset();
        resolve(void 0);
      }, noop);
      return promise;
    },
    cancel() {
      return Transition.cancel([next, prev].filter(isHtmlElement));
    },
    reset() {
      resetProps([next, prev].filter(isHtmlElement), props[0]);
    },
    async forward(duration, initialPercent = this.percent()) {
      await this.cancel();
      return this.show(duration, initialPercent, true);
    },
    translate(initialPercent) {
      this.reset();
      const translatedProps = translate(initialPercent, dir);
      css(next, translatedProps[1]);
      css(prev, translatedProps[0]);
      triggerUpdate(next, "itemtranslatein", { percent: initialPercent, dir });
      triggerUpdate(prev, "itemtranslateout", { percent: 1 - initialPercent, dir });
    },
    percent() {
      const current = prev || next;
      return current ? percent(current, next, dir) : 0;
    },
    getDistance() {
      return prev == null ? void 0 : prev.offsetWidth;
    }
  };
}
function triggerUpdate(el, type, data) {
  trigger(el, createEvent(type, false, false, data));
}
function withResolvers() {
  let resolve;
  const promise = new Promise((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}
function isHtmlElement(value) {
  return value instanceof HTMLElement;
}

export { Transitioner as default, triggerUpdate, withResolvers };
