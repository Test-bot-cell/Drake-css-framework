const { hasOwnProperty, toString } = Object.prototype;
function hasOwn(object, key) {
  return hasOwnProperty.call(object, key);
}
const hyphenateRe = /\B([A-Z])/g;
const hyphenate = memoize(
  (value) => value.replace(hyphenateRe, "-$1").toLowerCase()
);
const camelizeRe = /-(\w)/g;
const camelize = memoize(
  (value) => (value.charAt(0).toLowerCase() + value.slice(1)).replace(
    camelizeRe,
    (_, character) => character.toUpperCase()
  )
);
const ucfirst = memoize((value) => value.charAt(0).toUpperCase() + value.slice(1));
function startsWith(value, search) {
  return typeof value === "string" && value.startsWith(search);
}
function endsWith(value, search) {
  return typeof value === "string" && value.endsWith(search);
}
function includes(value, search) {
  if (typeof value === "string") {
    return typeof search === "string" && value.includes(search);
  }
  return Array.isArray(value) && value.includes(search);
}
function findIndex(array, predicate) {
  var _a;
  return (_a = array == null ? void 0 : array.findIndex(predicate)) != null ? _a : -1;
}
const isArray = Array.isArray;
function toArray(value) {
  return Array.from(value);
}
const assign = Object.assign;
function isFunction(value) {
  return typeof value === "function";
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isPlainObject(value) {
  return toString.call(value) === "[object Object]";
}
function isWindow(value) {
  return isObject(value) && value === value.window;
}
function isDocument(value) {
  return nodeType(value) === 9;
}
function isNode(value) {
  return nodeType(value) >= 1;
}
function isElement(value) {
  return nodeType(value) === 1;
}
function nodeType(value) {
  return !isWindow(value) && isObject(value) && typeof value.nodeType === "number" ? value.nodeType : 0;
}
function isBoolean(value) {
  return typeof value === "boolean";
}
function isString(value) {
  return typeof value === "string";
}
function isNumber(value) {
  return typeof value === "number";
}
function isNumeric(value) {
  return isNumber(value) || isString(value) && value.trim() !== "" && !Number.isNaN(Number(value));
}
function isEmpty(value) {
  return !(isArray(value) ? value.length : isObject(value) ? Object.keys(value).length : false);
}
function isUndefined(value) {
  return value === void 0;
}
function toBoolean(value) {
  return isBoolean(value) ? value : value === "true" || value === "1" || value === "" ? true : value === "false" || value === "0" ? false : value;
}
function toNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? false : number;
}
function toFloat(value) {
  return Number.parseFloat(String(value)) || 0;
}
function toNode(value) {
  return toNodes(value)[0];
}
function toNodes(value) {
  if (isNode(value)) {
    return [value];
  }
  if (!isCollection(value)) {
    return [];
  }
  return Array.from(value).filter(isNode);
}
function isCollection(value) {
  if (!isObject(value)) {
    return false;
  }
  return typeof value.length === "number" || Symbol.iterator in value && typeof value[Symbol.iterator] === "function";
}
function toWindow(value) {
  var _a;
  if (isWindow(value)) {
    return value;
  }
  const node = toNode(value);
  const document = isDocument(node) ? node : node == null ? void 0 : node.ownerDocument;
  return (_a = document == null ? void 0 : document.defaultView) != null ? _a : window;
}
function isEqual(value, other) {
  return value === other || isObject(value) && isObject(other) && Object.keys(value).length === Object.keys(other).length && each(value, (item, key) => item === other[key]);
}
function swap(value, first, second) {
  return value.replace(
    new RegExp(`${first}|${second}`, "g"),
    (match) => match === first ? second : first
  );
}
function last(array) {
  return array[array.length - 1];
}
function each(object, callback) {
  const record = object;
  for (const key in record) {
    if (callback(record[key], key) === false) {
      return false;
    }
  }
  return true;
}
function sortBy(array, property) {
  return array.slice().sort((first, second) => {
    const firstValue = toComparable(first[property]);
    const secondValue = toComparable(second[property]);
    return firstValue > secondValue ? 1 : secondValue > firstValue ? -1 : 0;
  });
}
function toComparable(value) {
  return typeof value === "number" || typeof value === "string" ? value : 0;
}
function sumBy(array, iteratee) {
  return array.reduce((sum, item) => {
    const value = isFunction(iteratee) ? iteratee(item) : isObject(item) ? item[iteratee] : item;
    return sum + toFloat(value);
  }, 0);
}
function uniqueBy(array, property) {
  const seen = /* @__PURE__ */ new Set();
  return array.filter((item) => {
    const value = item[property];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
function pick(object, properties) {
  const result = {};
  for (const property of properties) {
    result[property] = object[property];
  }
  return result;
}
function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(toNumber(value) || 0, min), max);
}
function noop() {
}
function intersectRect(...rects) {
  return Math.min(...rects.map(({ bottom }) => bottom)) - Math.max(...rects.map(({ top }) => top)) > 0 && Math.min(...rects.map(({ right }) => right)) - Math.max(...rects.map(({ left }) => left)) > 0;
}
function pointInRect(point, rect) {
  return point.x <= rect.right && point.x >= rect.left && point.y <= rect.bottom && point.y >= rect.top;
}
function ratio(dimensions, property, value) {
  const otherProperty = property === "width" ? "height" : "width";
  return {
    ...dimensions,
    [otherProperty]: dimensions[property] ? Math.round(value * dimensions[otherProperty] / dimensions[property]) : dimensions[otherProperty],
    [property]: value
  };
}
function contain(dimensions, maximum) {
  let result = { ...dimensions };
  for (const property of ["width", "height"]) {
    if (result[property] > maximum[property]) {
      result = ratio(result, property, maximum[property]);
    }
  }
  return result;
}
function cover(dimensions, maximum) {
  let result = contain(dimensions, maximum);
  for (const property of ["width", "height"]) {
    if (result[property] < maximum[property]) {
      result = ratio(result, property, maximum[property]);
    }
  }
  return result;
}
const Dimensions = { ratio, contain, cover };
function getIndex(index, elements, current = 0, finite = false) {
  const nodes = toNodes(elements);
  const { length } = nodes;
  if (!length) {
    return -1;
  }
  let resolved = isNumeric(index) ? toNumber(index) || 0 : index === "next" ? current + 1 : index === "previous" ? current - 1 : index === "last" ? length - 1 : nodes.indexOf(index);
  if (finite) {
    return clamp(resolved, 0, length - 1);
  }
  resolved %= length;
  return resolved < 0 ? resolved + length : resolved;
}
function memoize(callback) {
  const cache = /* @__PURE__ */ new Map();
  return (key, ...args) => {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
    const value = callback(key, ...args);
    cache.set(key, value);
    return value;
  };
}

export { Dimensions, assign, camelize, clamp, each, endsWith, findIndex, getIndex, hasOwn, hyphenate, includes, intersectRect, isArray, isBoolean, isDocument, isElement, isEmpty, isEqual, isFunction, isNode, isNumber, isNumeric, isObject, isPlainObject, isString, isUndefined, isWindow, last, memoize, noop, pick, pointInRect, sortBy, startsWith, sumBy, swap, toArray, toBoolean, toFloat, toNode, toNodes, toNumber, toWindow, ucfirst, uniqueBy };
