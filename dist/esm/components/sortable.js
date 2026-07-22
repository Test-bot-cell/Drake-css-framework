import { Transition } from '../util/animation.js';
import { attr } from '../util/attr.js';
import { addClass, removeClass, toggleClass } from '../util/class.js';
import { dimensions, height } from '../util/dimensions.js';
import { remove, before, append, $$, isTag } from '../util/dom.js';
import { pointerDown, pointerMove, pointerUp } from '../util/env.js';
import { off, trigger, getEventPos, on } from '../util/event.js';
import { parent, index, isInput, children } from '../util/filter.js';
import { assign, findIndex, pointInRect } from '../util/lang.js';
import { css, resetProps } from '../util/style.js';
import { scrollParents, offsetViewport } from '../util/viewport.js';
import { defineComponent } from '../api/options.js';
import Animate from '../mixin/animate.js';
import Class from '../mixin/class.js';

var sortable = defineComponent()({
  mixins: [Class, Animate],
  props: {
    group: String,
    threshold: Number,
    clsItem: String,
    clsPlaceholder: String,
    clsDrag: String,
    clsDragState: String,
    clsBase: String,
    clsNoDrag: String,
    clsEmpty: String,
    clsCustom: String,
    handle: String
  },
  data: {
    group: false,
    threshold: 5,
    clsItem: "drk-sortable-item",
    clsPlaceholder: "drk-sortable-placeholder",
    clsDrag: "drk-sortable-drag",
    clsDragState: "drk-drag",
    clsBase: "drk-sortable",
    clsNoDrag: "drk-sortable-nodrag",
    clsEmpty: "drk-sortable-empty",
    clsCustom: "",
    handle: false,
    pos: {}
  },
  events: {
    name: pointerDown,
    passive: false,
    handler(e) {
      this.init(e);
    }
  },
  computed: {
    target: (_props, $el) => {
      var _a;
      return $el instanceof HTMLTableElement ? (_a = $el.tBodies[0]) != null ? _a : $el : $el;
    },
    items() {
      return children(this.target).filter(
        (item) => item instanceof HTMLElement
      );
    },
    isEmpty() {
      return !this.items.length;
    },
    handles({ handle }, $el) {
      return handle ? $$(handle, $el) : this.items;
    }
  },
  watch: {
    isEmpty(empty) {
      toggleClass(this.target, this.clsEmpty, Boolean(empty));
    },
    handles(handles, prev) {
      const props = { touchAction: "none", userSelect: "none" };
      resetProps(toHtmlElements(prev), props);
      css(toHtmlElements(handles), props);
    }
  },
  update: {
    write(data) {
      var _a;
      if (!this.drag || !parent(this.placeholder)) {
        return;
      }
      const {
        pos: { x, y },
        origin: { offsetTop, offsetLeft },
        placeholder
      } = this;
      if (offsetTop === void 0 || offsetLeft === void 0) {
        return;
      }
      css(this.drag, {
        top: y - offsetTop,
        left: x - offsetLeft
      });
      const sortable = this.getSortable(document.elementFromPoint(x, y));
      if (!sortable) {
        return;
      }
      const { items } = sortable;
      if (items.some(Transition.inProgress)) {
        return;
      }
      const target = findTarget(items, { x, y });
      if (items.length && (!target || target === placeholder)) {
        return;
      }
      const previous = this.getSortable(placeholder);
      if (!previous) {
        return;
      }
      const insertTarget = findInsertTarget(
        sortable.target,
        target,
        placeholder,
        { x, y },
        sortable === previous && data.moved !== target
      );
      if (insertTarget === false) {
        return;
      }
      if (insertTarget && placeholder === insertTarget) {
        return;
      }
      if (sortable !== previous) {
        previous.remove(placeholder);
        data.moved = target;
      } else {
        delete data.moved;
      }
      sortable.insert(placeholder, insertTarget);
      (_a = this.touched) == null ? void 0 : _a.add(sortable);
    },
    events: ["move"]
  },
  methods: {
    init(e) {
      const { target, defaultPrevented } = e;
      if (!(target instanceof Node)) {
        return;
      }
      const targetElement = target instanceof Element ? target : target.parentElement;
      if (!targetElement) {
        return;
      }
      const button = e instanceof MouseEvent ? e.button : 0;
      const [placeholder] = this.items.filter((el) => el.contains(target));
      if (!placeholder || defaultPrevented || button > 0 || target instanceof Element && isInput(target) || targetElement.closest(`.${this.clsNoDrag}`) || this.handle && !targetElement.closest(this.handle)) {
        return;
      }
      e.preventDefault();
      this.pos = getEventPos(e);
      this.touched = /* @__PURE__ */ new Set([this]);
      this.placeholder = placeholder;
      this.origin = { target, index: index(placeholder), ...this.pos };
      on(document, pointerMove, this.move);
      on(document, pointerUp, this.end);
      if (!this.threshold) {
        this.start(e);
      }
    },
    start(e) {
      this.drag = appendDrag(this.$container, this.placeholder);
      const { left, top } = dimensions(this.placeholder);
      assign(this.origin, { offsetLeft: this.pos.x - left, offsetTop: this.pos.y - top });
      addClass(this.drag, this.clsDrag, this.clsCustom);
      addClass(this.placeholder, this.clsPlaceholder);
      addClass(this.items, this.clsItem);
      addClass(document.documentElement, this.clsDragState);
      trigger(this.$el, "start", [this, this.placeholder]);
      trackScroll(this.pos);
      this.move(e);
    },
    move: throttle(function(e) {
      assign(this.pos, getEventPos(e));
      if (!this.drag && (Math.abs(this.pos.x - this.origin.x) > this.threshold || Math.abs(this.pos.y - this.origin.y) > this.threshold)) {
        this.start(e);
      }
      this.$emit("move");
    }),
    end() {
      off(document, pointerMove, this.move);
      off(document, pointerUp, this.end);
      if (!this.drag) {
        return;
      }
      untrackScroll();
      const sortable = this.getSortable(this.placeholder);
      if (!sortable) {
        return;
      }
      if (this === sortable) {
        if (this.origin.index !== index(this.placeholder)) {
          trigger(this.$el, "moved", [this, this.placeholder]);
        }
      } else {
        trigger(sortable.$el, "added", [sortable, this.placeholder]);
        trigger(this.$el, "removed", [this, this.placeholder]);
      }
      trigger(this.$el, "stop", [this, this.placeholder]);
      remove(this.drag);
      this.drag = null;
      const touched = this.touched;
      for (const { clsPlaceholder, clsItem } of touched != null ? touched : []) {
        for (const sortable2 of touched != null ? touched : []) {
          removeClass(sortable2.items, clsPlaceholder, clsItem);
        }
      }
      this.touched = null;
      removeClass(document.documentElement, this.clsDragState);
    },
    insert(element, target) {
      addClass(this.items, this.clsItem);
      if (target && target.previousElementSibling !== element) {
        this.animate(() => before(target, element));
      } else if (!target && this.target.lastElementChild !== element) {
        this.animate(() => append(this.target, element));
      }
    },
    remove(element) {
      if (this.target.contains(element)) {
        this.animate(() => remove(element));
      }
    },
    getSortable(element) {
      var _a;
      let current = element;
      while (current) {
        const sortable = this.$getComponent(current, "sortable");
        if (isSortable(sortable) && (sortable === this || this.group !== false && sortable.group === this.group)) {
          return sortable;
        }
        current = (_a = parent(current)) != null ? _a : null;
      }
    }
  }
});
let trackTimer;
function trackScroll(pos) {
  let last = Date.now();
  trackTimer = setInterval(() => {
    var _a, _b;
    const { x } = pos;
    let { y } = pos;
    y += (_b = (_a = document.scrollingElement) == null ? void 0 : _a.scrollTop) != null ? _b : 0;
    const dist = (Date.now() - last) * 0.3;
    last = Date.now();
    scrollParents(document.elementFromPoint(x, pos.y)).reverse().some((scrollEl) => {
      let { scrollTop: scroll } = scrollEl;
      const { scrollHeight } = scrollEl;
      const { top, bottom, height: height2 } = offsetViewport(scrollEl);
      if (top < y && top + 35 > y) {
        scroll -= dist;
      } else if (bottom > y && bottom - 35 < y) {
        scroll += dist;
      } else {
        return false;
      }
      if (scroll > 0 && scroll < scrollHeight - height2) {
        scrollEl.scrollTop = scroll;
        return true;
      }
      return false;
    });
  }, 15);
}
function untrackScroll() {
  clearInterval(trackTimer);
}
function appendDrag(container, element) {
  let clone;
  if (isTag(element, "li", "tr")) {
    clone = document.createElement("div");
    const clonedElement = element.cloneNode(true);
    if (!(clonedElement instanceof Element)) {
      throw new TypeError("Sortable drag source clone must be an element");
    }
    append(clone, clonedElement.children);
    for (const attribute of element.getAttributeNames()) {
      attr(clone, attribute, element.getAttribute(attribute));
    }
  } else {
    const clonedNode = element.cloneNode(true);
    if (!(clonedNode instanceof HTMLElement)) {
      throw new TypeError("Sortable drag clone must be an HTML element");
    }
    clone = clonedNode;
  }
  append(container, clone);
  css(clone, "margin", "0", "important");
  css(clone, {
    boxSizing: "border-box",
    width: element.offsetWidth,
    height: element.offsetHeight,
    padding: css(element, "padding")
  });
  height(clone.firstElementChild, height(element.firstElementChild));
  return clone;
}
function findTarget(items, point) {
  return items[findIndex(items, (item) => pointInRect(point, dimensions(item)))];
}
function findInsertTarget(list, target, placeholder, point, sameList) {
  if (!children(list).length) {
    return;
  }
  if (!target) {
    return;
  }
  const rect = dimensions(target);
  if (!sameList) {
    if (!isHorizontal(list, placeholder)) {
      return point.y < rect.top + rect.height / 2 ? target : target.nextElementSibling;
    }
    return target;
  }
  const placeholderRect = dimensions(placeholder);
  const sameRow = linesIntersect(
    [rect.top, rect.bottom],
    [placeholderRect.top, placeholderRect.bottom]
  );
  const [pointerPos, lengthProp, startProp, endProp] = sameRow ? [point.x, "width", "left", "right"] : [point.y, "height", "top", "bottom"];
  const diff = placeholderRect[lengthProp] < rect[lengthProp] ? rect[lengthProp] - placeholderRect[lengthProp] : 0;
  if (placeholderRect[startProp] < rect[startProp]) {
    if (diff && pointerPos < rect[startProp] + diff) {
      return false;
    }
    return target.nextElementSibling;
  }
  if (diff && pointerPos > rect[endProp] - diff) {
    return false;
  }
  return target;
}
function isHorizontal(list, placeholder) {
  const single = children(list).length === 1;
  if (single) {
    append(list, placeholder);
  }
  const items = children(list);
  const isHorizontal2 = items.some((el, i) => {
    const rectA = dimensions(el);
    return items.slice(i + 1).some((el2) => {
      const rectB = dimensions(el2);
      return !linesIntersect([rectA.left, rectA.right], [rectB.left, rectB.right]);
    });
  });
  if (single) {
    remove(placeholder);
  }
  return isHorizontal2;
}
function linesIntersect(lineA, lineB) {
  return lineA[1] > lineB[0] && lineB[1] > lineA[0];
}
function throttle(fn) {
  let throttled = false;
  return function(...args) {
    if (!throttled) {
      throttled = true;
      fn.call(this, ...args);
      requestAnimationFrame(() => throttled = false);
    }
  };
}
function toHtmlElements(value) {
  return Array.isArray(value) ? value.filter((item) => item instanceof HTMLElement) : [];
}
function isSortable(instance) {
  return Boolean(instance) && typeof (instance == null ? void 0 : instance.group) !== "undefined" && typeof instance.insert === "function" && typeof instance.remove === "function";
}

export { sortable as default };
