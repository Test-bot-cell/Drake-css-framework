import { Animation, Transition } from '../util/animation.js';
import { includes, toNode, toNodes, isBoolean, startsWith, toFloat } from '../util/lang.js';
import { hasClass, toggleClass, addClass, removeClass } from '../util/class.js';
import { dimensions } from '../util/dimensions.js';
import { $$, wrapInner } from '../util/dom.js';
import { trigger } from '../util/event.js';
import { isVisible } from '../util/filter.js';
import { propName, css } from '../util/style.js';
import { defineMixin } from '../api/options.js';

var Togglable = defineMixin()({
  props: {
    cls: Boolean,
    animation: "list",
    duration: Number,
    velocity: Number,
    origin: String,
    transition: String
  },
  data: {
    cls: false,
    animation: [false],
    duration: 200,
    velocity: 0.2,
    origin: false,
    transition: "ease",
    clsEnter: "drk-togglable-enter",
    clsLeave: "drk-togglable-leave"
  },
  computed: {
    hasAnimation: ({ animation }) => !!animation[0],
    hasTransition: ({ animation }) => ["slide", "reveal"].some((transition) => startsWith(animation[0], transition))
  },
  methods: {
    async toggleElement(targets, toggle, animate) {
      const CANCELLED = {};
      return (await Promise.all(
        toNodes(targets).map((el) => {
          if (!(el instanceof HTMLElement)) {
            return CANCELLED;
          }
          const show = isBoolean(toggle) ? toggle : !this.isToggled(el);
          if (!trigger(el, `before${show ? "show" : "hide"}`, [this])) {
            return CANCELLED;
          }
          const handler = typeof animate === "function" ? animate : animate === false || !this.hasAnimation ? toggleInstant : this.hasTransition ? toggleTransition : toggleAnimation;
          const promise = handler(el, show, this);
          const cls = show ? this.clsEnter : this.clsLeave;
          addClass(el, cls);
          trigger(el, show ? "show" : "hide", [this]);
          const done = () => {
            var _a;
            removeClass(el, cls);
            trigger(el, show ? "shown" : "hidden", [this]);
            if (show) {
              (_a = $$("[autofocus]", el).find(isVisible)) == null ? void 0 : _a.focus({ preventScroll: true });
            }
          };
          return promise ? promise.then(done, () => {
            removeClass(el, cls);
            return CANCELLED;
          }) : done();
        })
      )).every((r) => r !== CANCELLED);
    },
    isToggled(element = this.$el) {
      const el = toNode(element);
      return hasClass(el, this.clsEnter) ? true : hasClass(el, this.clsLeave) ? false : this.cls ? hasClass(el, this.cls.split(" ")[0]) : isVisible(el);
    },
    _toggle(el, toggled) {
      if (!el) {
        return;
      }
      toggled = Boolean(toggled);
      let changed;
      if (this.cls) {
        changed = includes(this.cls, " ") || toggled !== hasClass(el, this.cls);
        if (changed) {
          toggleClass(el, this.cls, includes(this.cls, " ") ? void 0 : toggled);
        }
      } else {
        changed = toggled === el.hidden;
        if (changed) {
          el.hidden = !toggled;
        }
      }
      if (changed) {
        trigger(el, "toggled", [toggled, this]);
      }
    }
  }
});
function toggleInstant(el, show, { _toggle }) {
  Animation.cancel(el);
  Transition.cancel(el);
  return _toggle(el, show);
}
async function toggleTransition(el, show, { animation, duration, velocity, transition, _toggle }) {
  const [mode = "reveal", startProp = "top"] = typeof animation[0] === "string" ? animation[0].split("-") : [];
  const dirs = [
    ["left", "right"],
    ["top", "bottom"]
  ];
  const dir = dirs[includes(dirs[0], startProp) ? 0 : 1];
  const end = dir[1] === startProp;
  const dimProp = dir === dirs[0] ? "width" : "height";
  const marginProp = `margin-${dir[0]}`;
  const marginStartProp = `margin-${startProp}`;
  let currentDim = dimensions(el)[dimProp];
  const inProgress = Transition.inProgress(el);
  await Transition.cancel(el);
  if (show) {
    _toggle(el, true);
  }
  const previousPropertyNames = [
    "padding",
    "border",
    "width",
    "height",
    "minWidth",
    "minHeight",
    "overflowY",
    "overflowX",
    marginProp,
    marginStartProp
  ];
  const prevProps = Object.fromEntries(
    previousPropertyNames.map((key) => [key, el.style.getPropertyValue(propName(key))])
  );
  const dim = dimensions(el);
  const currentMargin = toFloat(css(el, marginProp));
  const marginStart = toFloat(css(el, marginStartProp));
  const endDim = dim[dimProp] + marginStart;
  if (!inProgress && !show) {
    currentDim += marginStart;
  }
  const [wrapper] = wrapInner(el, "<div>");
  if (!(wrapper instanceof HTMLElement)) {
    return;
  }
  css(wrapper, {
    boxSizing: "border-box",
    height: dim.height,
    width: dim.width,
    ...css(el, [
      "overflow",
      "padding",
      "borderTop",
      "borderRight",
      "borderBottom",
      "borderLeft",
      "borderImage",
      marginStartProp
    ])
  });
  css(el, {
    padding: 0,
    border: 0,
    minWidth: 0,
    minHeight: 0,
    [marginStartProp]: 0,
    width: dim.width,
    height: dim.height,
    overflow: "hidden",
    [dimProp]: currentDim
  });
  const percent = currentDim / endDim;
  duration = (velocity * endDim + duration) * (show ? 1 - percent : percent);
  const endProps = { [dimProp]: show ? endDim : 0 };
  if (end) {
    css(el, marginProp, endDim - currentDim + currentMargin);
    endProps[marginProp] = show ? currentMargin : endDim + currentMargin;
  }
  if (!end !== (mode === "reveal")) {
    css(wrapper, marginProp, -endDim + currentDim);
    Transition.start(wrapper, { [marginProp]: show ? 0 : -endDim }, duration, transition);
  }
  try {
    await Transition.start(el, endProps, duration, transition);
  } finally {
    css(el, prevProps);
    if (wrapper.firstChild) {
      wrapper.replaceWith(...wrapper.childNodes);
    }
    if (!show) {
      _toggle(el, false);
    }
  }
}
function toggleAnimation(el, show, cmp) {
  const { animation, duration, _toggle } = cmp;
  if (show) {
    _toggle(el, true);
    return Animation.in(el, toAnimationName(animation[0]), duration, cmp.origin || void 0);
  }
  return Animation.out(
    el,
    toAnimationName(animation[1] || animation[0]),
    duration,
    cmp.origin || void 0
  ).then(() => _toggle(el, false));
}
function toAnimationName(value) {
  return typeof value === "string" ? value : "";
}

export { Togglable as default };
