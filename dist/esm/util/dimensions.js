import { $, append, remove } from './dom.js';
import { on } from './event.js';
import { isElement, isWindow, isDocument, toFloat, toNode, sumBy, toWindow, isString, memoize } from './lang.js';
import { css } from './style.js';

const dirs = {
  width: ["left", "right"],
  height: ["top", "bottom"]
};
function dimensions(element) {
  const rect = isElement(element) ? element.getBoundingClientRect() : { height: height(element), width: width(element), top: 0, left: 0 };
  return {
    height: rect.height,
    width: rect.width,
    top: rect.top,
    left: rect.left,
    x: rect.left,
    y: rect.top,
    bottom: rect.top + rect.height,
    right: rect.left + rect.width
  };
}
function offset(element, coordinates) {
  if (coordinates) {
    css(toElementInput(element), { left: 0, top: 0 });
  }
  const currentOffset = dimensions(element);
  if (element) {
    const { scrollY, scrollX } = toWindow(element);
    currentOffset.top += scrollY;
    currentOffset.bottom += scrollY;
    currentOffset.left += scrollX;
    currentOffset.right += scrollX;
  }
  if (!coordinates) {
    return currentOffset;
  }
  css(toElementInput(element), "left", coordinates.left - currentOffset.left);
  css(toElementInput(element), "top", coordinates.top - currentOffset.top);
}
function position(element) {
  var _a;
  const node = toHtmlElement(element);
  if (!node) {
    return { top: 0, left: 0 };
  }
  let { top, left } = offset(node);
  const { body, documentElement } = node.ownerDocument;
  let offsetParent = (_a = node.offsetParent) != null ? _a : documentElement;
  while (offsetParent && (offsetParent === body || offsetParent === documentElement) && css(offsetParent, "position") === "static") {
    offsetParent = offsetParent.parentElement;
  }
  if (offsetParent) {
    const parentOffset = offset(offsetParent);
    top -= parentOffset.top + toFloat(css(offsetParent, "borderTopWidth"));
    left -= parentOffset.left + toFloat(css(offsetParent, "borderLeftWidth"));
  }
  return {
    top: top - toFloat(css(node, "marginTop")),
    left: left - toFloat(css(node, "marginLeft"))
  };
}
function offsetPosition(element) {
  let node = toHtmlElement(element);
  if (!node) {
    return [0, 0];
  }
  const result = [node.offsetTop, node.offsetLeft];
  while (node = node.offsetParent instanceof HTMLElement ? node.offsetParent : void 0) {
    result[0] += node.offsetTop + toFloat(css(node, "borderTopWidth"));
    result[1] += node.offsetLeft + toFloat(css(node, "borderLeftWidth"));
    if (css(node, "position") === "fixed") {
      const win = toWindow(node);
      result[0] += win.scrollY;
      result[1] += win.scrollX;
      return result;
    }
  }
  return result;
}
const height = dimension("height");
const width = dimension("width");
function dimension(property) {
  return ((element, value) => {
    if (value === void 0) {
      if (isWindow(element)) {
        return property === "height" ? element.innerHeight : element.innerWidth;
      }
      if (isDocument(element)) {
        const documentElement = element.documentElement;
        return property === "height" ? Math.max(documentElement.offsetHeight, documentElement.scrollHeight) : Math.max(documentElement.offsetWidth, documentElement.scrollWidth);
      }
      const node = toHtmlElement(element);
      if (!node) {
        return 0;
      }
      const computed = css(node, property);
      const measured = computed === "auto" ? property === "height" ? node.offsetHeight : node.offsetWidth : toFloat(computed) || 0;
      return measured - boxModelAdjust(node, property);
    }
    const nodeInput = toElementInput(element);
    const adjusted = !value && value !== 0 ? "" : `${Number(value) + boxModelAdjust(nodeInput, property)}px`;
    return css(nodeInput, property, adjusted);
  });
}
function boxModelAdjust(element, property, sizing = "border-box") {
  return css(element, "boxSizing") === sizing ? sumBy(
    dirs[property],
    (side) => toFloat(css(element, `padding-${side}`)) + toFloat(css(element, `border-${side}-width`))
  ) : 0;
}
function flipPosition(position2) {
  var _a;
  for (const sides of Object.values(dirs)) {
    const index = sides.indexOf(position2);
    if (index >= 0) {
      return (_a = sides[1 - index]) != null ? _a : position2;
    }
  }
  return position2;
}
function toPx(value, property = "width", element = window, offsetDimension = false) {
  if (!isString(value)) {
    return toFloat(value);
  }
  return sumBy(parseCalc(value), (part) => {
    const unit = parseUnit(part);
    if (!unit) {
      return part;
    }
    const base = unit === "vh" ? getViewportHeight() : unit === "vw" ? width(toWindow(element)) : offsetDimension && element instanceof HTMLElement ? property === "height" ? element.offsetHeight : element.offsetWidth : dimensions(element)[property];
    return percent(base, part);
  });
}
const calcRe = /-?\d+(?:\.\d+)?(?:v[wh]|%|px)?/g;
const parseCalc = memoize(
  (calculation) => {
    var _a;
    return (_a = calculation.replace(/\s/g, "").match(calcRe)) != null ? _a : [];
  }
);
const unitRe = /(?:v[hw]|%)$/;
const parseUnit = memoize((value) => {
  var _a;
  return (_a = value.match(unitRe)) == null ? void 0 : _a[0];
});
function percent(base, value) {
  return base * toFloat(value) / 100;
}
let viewportHeight;
let viewportElement;
function getViewportHeight() {
  if (viewportHeight) {
    return viewportHeight;
  }
  if (!viewportElement) {
    viewportElement = $("<div>");
    if (!viewportElement) {
      return window.innerHeight;
    }
    css(viewportElement, { height: "100vh", position: "fixed" });
    on(window, "resize", () => {
      viewportHeight = void 0;
    });
  }
  append(document.body, viewportElement);
  viewportHeight = viewportElement.clientHeight;
  remove(viewportElement);
  return viewportHeight;
}
function toHtmlElement(value) {
  const node = toNode(value);
  return node instanceof HTMLElement ? node : void 0;
}
function toElementInput(value) {
  return isElement(value) ? value : void 0;
}

export { boxModelAdjust, dimensions, flipPosition, height, offset, offsetPosition, position, toPx, width };
