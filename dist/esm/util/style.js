import { isString, isObject, isNumeric, isNumber, memoize, hyphenate } from './lang.js';

const cssNumber = /* @__PURE__ */ new Set([
  "animation-iteration-count",
  "column-count",
  "fill-opacity",
  "flex-grow",
  "flex-shrink",
  "font-weight",
  "line-height",
  "opacity",
  "order",
  "orphans",
  "stroke-dasharray",
  "stroke-dashoffset",
  "widows",
  "z-index",
  "zoom"
]);
function css(element, property, value, priority) {
  const elements = Array.from(element instanceof Node ? [element] : element != null ? element : []).filter(
    (item) => item instanceof HTMLElement || item instanceof SVGElement
  );
  const first = elements[0];
  if (isString(property) && value === void 0) {
    return first ? getComputedStyle(first).getPropertyValue(propName(property)) : "";
  }
  if (Array.isArray(property)) {
    const result = {};
    for (const name2 of property) {
      result[name2] = css(first, String(name2));
    }
    return result;
  }
  if (isObject(property)) {
    const objectPriority = isString(value) ? value : void 0;
    for (const name2 in property) {
      const propertyValue = property[name2];
      if (isCssValue(propertyValue)) {
        css(elements, name2, propertyValue, objectPriority);
      }
    }
    return first;
  }
  const name = propName(property);
  for (const item of elements) {
    const propertyValue = isNumeric(value) && !cssNumber.has(name) && !isCustomProperty(name) ? `${value}px` : value || isNumber(value) ? String(value) : "";
    item.style.setProperty(name, propertyValue, priority);
  }
  return first;
}
function isCssValue(value) {
  return value === null || value === void 0 || ["string", "number"].includes(typeof value);
}
function resetProps(element, properties) {
  for (const property in properties) {
    css(element, property, "");
  }
}
const propName = memoize((value) => {
  if (isCustomProperty(value)) {
    return value;
  }
  const name = hyphenate(value);
  const { style } = document.documentElement;
  if (name in style) {
    return name;
  }
  for (const prefix of ["webkit", "moz"]) {
    const prefixedName = `-${prefix}-${name}`;
    if (prefixedName in style) {
      return prefixedName;
    }
  }
  return name;
});
function isCustomProperty(name) {
  return name.startsWith("--");
}

export { css, propName, resetProps };
