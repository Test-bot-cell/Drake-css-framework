import { hasClass, addClass, removeClass } from './class.js';
import { trigger, once } from './event.js';
import { toNodes } from './lang.js';
import { propName, css, resetProps } from './style.js';

const clsTransition = "drk-transition";
const transitionEnd = "transitionend";
const transitionCanceled = "transitioncanceled";
function transition(input, properties, duration = 400, timing = "linear", skipReflow = false) {
  const roundedDuration = Math.round(duration);
  return Promise.all(
    toNodes(input).map(
      (element) => new Promise((resolve, reject) => {
        if (!skipReflow) {
          void element.offsetHeight;
        }
        const timer = setTimeout(
          () => trigger(element, transitionEnd),
          roundedDuration
        );
        const transitionProperties = {
          transitionProperty: Object.keys(properties).map(propName).join(","),
          transitionDuration: `${roundedDuration}ms`,
          transitionTimingFunction: timing
        };
        once(
          element,
          [transitionEnd, transitionCanceled],
          ({ type }) => {
            clearTimeout(timer);
            removeClass(element, clsTransition);
            resetProps(element, transitionProperties);
            if (type === transitionCanceled) {
              reject(new Error(transitionCanceled));
            } else {
              resolve(element);
            }
          },
          { self: true }
        );
        addClass(element, clsTransition);
        css(element, { ...transitionProperties, ...properties });
      })
    )
  );
}
const Transition = {
  start: transition,
  async stop(element) {
    trigger(element, transitionEnd);
    await Promise.resolve();
  },
  async cancel(element) {
    trigger(element, transitionCanceled);
    await Promise.resolve();
  },
  inProgress(element) {
    return hasClass(element, clsTransition);
  }
};
const clsAnimation = "drk-animation";
const animationEnd = "animationend";
const animationCanceled = "animationcanceled";
function animate(input, animation, duration = 200, origin, out = false) {
  return Promise.all(
    toNodes(input).map(
      (element) => new Promise((resolve, reject) => {
        if (hasClass(element, clsAnimation)) {
          trigger(element, animationCanceled);
        }
        const classes = [
          animation,
          clsAnimation,
          `${clsAnimation}-${out ? "leave" : "enter"}`,
          origin && `drk-transform-origin-${origin}`,
          out && `${clsAnimation}-reverse`
        ];
        const timer = setTimeout(() => trigger(element, animationEnd), duration);
        once(
          element,
          [animationEnd, animationCanceled],
          ({ type }) => {
            clearTimeout(timer);
            if (type === animationCanceled) {
              reject(new Error(animationCanceled));
            } else {
              resolve(element);
            }
            css(element, "animationDuration", "");
            removeClass(element, classes);
          },
          { self: true }
        );
        css(element, "animationDuration", `${duration}ms`);
        addClass(element, classes);
      })
    )
  );
}
const Animation = {
  in: animate,
  out(element, animation, duration, origin) {
    return animate(element, animation, duration, origin, true);
  },
  inProgress(element) {
    return hasClass(element, clsAnimation);
  },
  cancel(element) {
    trigger(element, animationCanceled);
  }
};

export { Animation, Transition };
