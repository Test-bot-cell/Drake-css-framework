import { Animation } from '../util/animation.js';
import { noop, clamp, intersectRect, isNumeric, isString, toFloat } from '../util/lang.js';
import { replaceClass, toggleClass, addClass, removeClass, hasClass } from '../util/class.js';
import { height, dimensions, toPx, offset, offsetPosition } from '../util/dimensions.js';
import { before, after, $, remove } from '../util/dom.js';
import { trigger } from '../util/event.js';
import { parent, index, isVisible } from '../util/filter.js';
import { css } from '../util/style.js';
import { query } from '../util/selector.js';
import { viewport, scroll, resize } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import Media from '../mixin/media.js';
import { awaitTimeout, awaitFrame } from '../util/await.js';

var sticky = defineComponent()({
  mixins: [Class, Media],
  props: {
    position: String,
    top: null,
    bottom: null,
    start: null,
    end: null,
    offset: String,
    offsetEnd: String,
    overflowFlip: Boolean,
    animation: String,
    clsActive: String,
    clsInactive: String,
    clsFixed: String,
    clsBelow: String,
    selTarget: String,
    showOnUp: Boolean,
    targetOffset: Number
  },
  data: {
    position: "top",
    top: false,
    bottom: false,
    start: false,
    end: false,
    offset: 0,
    offsetEnd: 0,
    overflowFlip: false,
    animation: "",
    clsActive: "drk-active",
    clsInactive: "",
    clsFixed: "drk-sticky-fixed",
    clsBelow: "drk-sticky-below",
    selTarget: "",
    showOnUp: false,
    targetOffset: false
  },
  computed: {
    target: ({ selTarget }, $el) => selTarget && $(selTarget, $el) || $el
  },
  connected() {
    this.start = coerce(this.start || this.top);
    this.end = coerce(this.end || this.bottom);
    this.placeholder = $("+ .drk-sticky-placeholder", this.$el) || createPlaceholder();
    this.isFixed = false;
    this.setActive(false);
  },
  beforeDisconnect() {
    if (this.isFixed) {
      this.hide();
      removeClass(this.target, this.clsInactive);
    }
    reset(this.$el);
    remove(this.placeholder);
    this.placeholder = null;
  },
  observe: [
    viewport(),
    scroll({ target: () => getScrollingElement() }),
    resize({
      target: ({ $el }) => {
        const visibleParent = getVisibleParent($el);
        return visibleParent ? [$el, visibleParent, getScrollingElement()] : [$el, getScrollingElement()];
      },
      handler(entries) {
        this.$emit(
          this._data.resized && entries.some(({ target }) => target === getVisibleParent(this.$el)) ? "update" : "resize"
        );
        this._data.resized = true;
      }
    })
  ],
  events: [
    {
      name: "load hashchange popstate",
      el: () => window,
      filter: ({ targetOffset }) => targetOffset !== false,
      async handler() {
        var _a;
        const scrollingElement = getScrollingElement();
        if (!location.hash || scrollingElement.scrollTop === 0) {
          return;
        }
        await awaitTimeout();
        const targetOffset = offset($(location.hash));
        const elOffset = offset(this.$el);
        if (this.isFixed && intersectRect(targetOffset, elOffset)) {
          const referenceElement = (_a = this.placeholder) != null ? _a : this.$el;
          scrollingElement.scrollTop = Math.ceil(
            targetOffset.top - elOffset.height - toPx(this.targetOffset, "height", referenceElement) - toPx(this.offset, "height", referenceElement)
          );
        }
      }
    }
  ],
  update: [
    {
      read({ height: height$1, width, margin, sticky }, types) {
        this.inactive = !this.matchMedia || !isVisible(this.$el) || !this.$el.offsetHeight;
        if (this.inactive) {
          return;
        }
        const dynamicViewport = height(window);
        const maxScrollHeight = Math.max(
          0,
          getScrollingElement().scrollHeight - dynamicViewport
        );
        if (!maxScrollHeight) {
          this.inactive = true;
          return;
        }
        const hide = this.isFixed && types.has("update");
        if (hide) {
          preventTransition(this.target);
          this.hide();
        }
        if (!this.active) {
          ({ height: height$1, width } = dimensions(this.$el));
          margin = css(this.$el, "margin");
        }
        if (hide) {
          this.show();
        }
        const viewport2 = toPx("100vh", "height");
        let position = this.position;
        if (this.overflowFlip && height$1 > viewport2) {
          position = position === "top" ? "bottom" : "top";
        }
        const referenceElement = (this.isFixed ? this.placeholder : this.$el) || this.$el;
        const [initialOffset = 0, offsetEnd = 0] = [this.offset, this.offsetEnd].map(
          (value) => toPx(value, "height", sticky ? this.$el : referenceElement)
        );
        let offset$1 = initialOffset;
        if (position === "bottom" && (height$1 < dynamicViewport || this.overflowFlip)) {
          offset$1 += dynamicViewport - height$1;
        }
        const elementBox = height$1 + offset$1 + offsetEnd;
        const overflow = this.overflowFlip ? 0 : Math.max(0, elementBox - viewport2);
        const topOffset = offset(referenceElement).top - // offset possible `transform: translateY` animation 'drk-animation-slide-top' while hiding
        new DOMMatrix(css(referenceElement, "transform")).m42;
        const elHeight = dimensions(this.$el).height;
        const start = (this.start === false ? topOffset : parseProp(this.start, this.$el, topOffset)) - offset$1;
        const end = this.end === false ? maxScrollHeight : Math.min(
          maxScrollHeight,
          parseProp(this.end, this.$el, topOffset + height$1, true) - elHeight - offset$1 + overflow
        );
        sticky = !this.showOnUp && start + offset$1 === topOffset && end === Math.min(
          maxScrollHeight,
          parseProp(true, this.$el, 0, true) - elHeight - offset$1 + overflow
        ) && css(getVisibleParent(this.$el), "overflowY") !== "hidden";
        return {
          start,
          end,
          offset: offset$1,
          overflow,
          height: height$1,
          elHeight,
          width,
          margin,
          top: offsetPosition(referenceElement)[0],
          sticky,
          viewport: viewport2,
          maxScrollHeight
        };
      },
      write({ height, width, margin, offset, sticky }) {
        if (this.inactive || sticky || !this.isFixed) {
          reset(this.$el);
        }
        if (this.inactive) {
          return;
        }
        if (sticky) {
          height = width = margin = 0;
          css(this.$el, { position: "sticky", top: offset });
        }
        const { placeholder } = this;
        if (!placeholder) {
          return;
        }
        css(placeholder, { height, width, margin });
        if (parent(placeholder) !== parent(this.$el) || sticky !== index(placeholder) < index(this.$el)) {
          (sticky ? before : after)(this.$el, placeholder);
          placeholder.hidden = true;
        }
      },
      events: ["resize"]
    },
    {
      read({
        scroll: prevScroll = 0,
        dir: prevDir = "down",
        overflow,
        overflowScroll = 0,
        start,
        end,
        elHeight,
        height,
        sticky,
        maxScrollHeight
      }) {
        const scroll2 = Math.min(getScrollingElement().scrollTop, maxScrollHeight);
        const dir = prevScroll <= scroll2 ? "down" : "up";
        const referenceElement = (this.isFixed ? this.placeholder : this.$el) || this.$el;
        return {
          dir,
          prevDir,
          scroll: scroll2,
          prevScroll,
          below: scroll2 > offset(referenceElement).top + (sticky ? Math.min(height, elHeight) : height),
          offsetParentTop: offset(referenceElement.offsetParent).top,
          overflowScroll: clamp(
            overflowScroll + clamp(scroll2, start, end) - clamp(prevScroll, start, end),
            0,
            overflow
          )
        };
      },
      write(data, types) {
        const isScrollUpdate = types.has("scroll");
        const {
          initTimestamp = 0,
          dir,
          prevDir,
          scroll: scroll2,
          prevScroll = 0,
          top,
          start,
          below
        } = data;
        if (scroll2 < 0 || scroll2 === prevScroll && isScrollUpdate || this.showOnUp && !isScrollUpdate && !this.isFixed) {
          return;
        }
        const now = Date.now();
        if (now - initTimestamp > 300 || dir !== prevDir) {
          data.initScroll = scroll2;
          data.initTimestamp = now;
        }
        if (this.showOnUp && !this.isFixed && Math.abs(data.initScroll - scroll2) <= 30 && Math.abs(prevScroll - scroll2) <= 10) {
          return;
        }
        if (this.inactive || scroll2 < start || this.showOnUp && (scroll2 <= start || dir === "down" && isScrollUpdate || dir === "up" && !this.isFixed && !below)) {
          if (!this.isFixed) {
            if (Animation.inProgress(this.$el) && top > scroll2) {
              Animation.cancel(this.$el);
              this.hide();
            }
            return;
          }
          if (this.animation && below) {
            if (hasClass(this.$el, "drk-animation-leave")) {
              return;
            }
            Animation.out(this.$el, this.animation).then(() => this.hide(), noop);
          } else {
            this.hide();
          }
        } else if (this.isFixed) {
          this.update();
        } else if (this.animation && below) {
          this.show();
          Animation.in(this.$el, this.animation).catch(noop);
        } else {
          preventTransition(this.target);
          this.show();
        }
      },
      events: ["resize", "resizeViewport", "scroll"]
    }
  ],
  methods: {
    show() {
      this.isFixed = true;
      this.update();
      if (this.placeholder) {
        this.placeholder.hidden = false;
      }
    },
    hide() {
      const { offset, sticky } = this._data;
      this.setActive(false);
      removeClass(this.$el, this.clsFixed, this.clsBelow);
      if (sticky) {
        css(this.$el, "top", offset);
      } else {
        reset(this.$el);
      }
      if (this.placeholder) {
        this.placeholder.hidden = true;
      }
      this.isFixed = false;
    },
    update() {
      const {
        width,
        scroll: scroll2 = 0,
        overflow,
        overflowScroll = 0,
        start,
        end,
        offset: initialOffset,
        offsetParentTop,
        sticky,
        below
      } = this._data;
      let offset = initialOffset;
      const active = start !== 0 || scroll2 > start;
      if (!sticky) {
        let position = "fixed";
        if (scroll2 > end) {
          offset += end - offsetParentTop + overflowScroll - overflow;
          position = "absolute";
        }
        css(this.$el, { position, width, marginTop: 0 }, "important");
      }
      css(this.$el, "top", offset - overflowScroll);
      this.setActive(active);
      toggleClass(this.$el, this.clsBelow, below);
      addClass(this.$el, this.clsFixed);
    },
    setActive(active) {
      const prev = this.active;
      this.active = active;
      if (active) {
        replaceClass(this.target, this.clsInactive, this.clsActive);
        if (prev !== active) {
          trigger(this.$el, "active");
        }
      } else {
        replaceClass(this.target, this.clsActive, this.clsInactive);
        if (prev !== active) {
          preventTransition(this.target);
          trigger(this.$el, "inactive");
        }
      }
    }
  }
});
function parseProp(value, el, propOffset, padding = false) {
  if (!value) {
    return 0;
  }
  if (isNumeric(value) || isString(value) && value.match(/^-?\d/)) {
    return propOffset + toPx(value, "height", el, true);
  } else {
    const refElement = value === true ? getVisibleParent(el) : query(value, el);
    return offset(refElement).bottom - (padding && (refElement == null ? void 0 : refElement.contains(el)) ? toFloat(css(refElement, "paddingBottom")) + toFloat(css(refElement, "borderBottomWidth")) : 0);
  }
}
function coerce(value) {
  if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  }
  return value;
}
function reset(el) {
  css(el, { position: "", top: "", marginTop: "", width: "" });
}
const clsTransitionDisable = "drk-transition-disable";
async function preventTransition(element) {
  if (!hasClass(element, clsTransitionDisable)) {
    addClass(element, clsTransitionDisable);
    await awaitFrame();
    removeClass(element, clsTransitionDisable);
  }
}
function getVisibleParent(element) {
  let current = parent(element);
  while (current) {
    if (isVisible(current)) {
      return current;
    }
    current = parent(current);
  }
}
function getScrollingElement() {
  return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : document.documentElement;
}
function createPlaceholder() {
  const placeholder = document.createElement("div");
  placeholder.className = "drk-sticky-placeholder";
  return placeholder;
}

export { sticky as default };
