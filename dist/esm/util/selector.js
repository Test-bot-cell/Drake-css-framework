import { attr } from './attr.js';
import { matches, index } from './filter.js';
import { isString, toNode, isDocument, memoize, toNodes } from './lang.js';

function query(selector, context) {
  return find(selector, getContext(selector, context));
}
function queryAll(selector, context) {
  return findAll(selector, getContext(selector, context));
}
function find(selector, context) {
  var _a;
  if (!isString(selector)) {
    return toNode(selector);
  }
  return (_a = _query(selector, context != null ? context : document, "querySelector")) != null ? _a : void 0;
}
function findAll(selector, context) {
  if (!isString(selector)) {
    return toNodes(selector);
  }
  return toNodes(_query(selector, context != null ? context : document, "querySelectorAll"));
}
function getContext(selector, context = document) {
  return isDocument(context) || isString(selector) && parseSelector(selector).isContextSelector ? context : context.ownerDocument;
}
const addStarRe = /([!>+~-])(?=\s+[!>+~-]|\s*$)/g;
const splitSelectorRe = /(\([^)]*\)|[^,])+/g;
const parseSelector = memoize((selector) => {
  var _a, _b;
  const selectors = [];
  let isContextSelector = false;
  for (let item of (_a = selector.match(splitSelectorRe)) != null ? _a : []) {
    item = item.trim().replace(addStarRe, "$1 *");
    isContextSelector || (isContextSelector = ["!", "+", "~", "-", ">"].includes((_b = item[0]) != null ? _b : ""));
    selectors.push(item);
  }
  return { selector: selectors.join(","), selectors, isContextSelector };
});
const positionRe = /(\([^)]*\)|\S)*/;
function parsePositionSelector(selector) {
  var _a, _b;
  const value = selector.slice(1).trim();
  const position = (_b = (_a = value.match(positionRe)) == null ? void 0 : _a[0]) != null ? _b : "";
  return [position, value.slice(position.length + 1)];
}
function _query(selector, context, queryFunction) {
  var _a, _b;
  const parsed = parseSelector(selector);
  if (!parsed.isContextSelector) {
    return parsed.selector ? doQuery(context, queryFunction, parsed.selector) : null;
  }
  let combined = "";
  const isSingle = parsed.selectors.length === 1;
  for (let item of parsed.selectors) {
    let current = context;
    if (item[0] === "!") {
      const [positionSelector, remainingSelector] = parsePositionSelector(item);
      item = remainingSelector;
      current = context instanceof Element ? (_b = (_a = context.parentElement) == null ? void 0 : _a.closest(positionSelector)) != null ? _b : null : null;
      if (!item && isSingle) {
        return current;
      }
    }
    if (current instanceof Element && item[0] === "-") {
      const [positionSelector, remainingSelector] = parsePositionSelector(item);
      item = remainingSelector;
      const previous = current.previousElementSibling;
      current = previous && matches(previous, positionSelector) ? previous : null;
      if (!item && isSingle) {
        return current;
      }
    }
    if (!current) {
      continue;
    }
    if (isSingle) {
      if (current instanceof Element && (item[0] === "~" || item[0] === "+")) {
        item = `:scope > :nth-child(${index(current) + 1}) ${item}`;
        current = current.parentElement;
      } else if (item[0] === ">") {
        item = `:scope ${item}`;
      }
      return current ? doQuery(current, queryFunction, item) : null;
    }
    if (current instanceof Element) {
      combined += `${combined ? "," : ""}${domPath(current)} ${item}`;
    }
  }
  const root = isDocument(context) ? context : context.ownerDocument;
  return doQuery(root, queryFunction, combined);
}
function doQuery(context, queryFunction, selector) {
  try {
    return queryFunction === "querySelector" ? context.querySelector(selector) : context.querySelectorAll(selector);
  } catch {
    return null;
  }
}
function domPath(element) {
  const names = [];
  let current = element;
  while (current) {
    const id = attr(current, "id");
    if (id) {
      names.unshift(`#${escape(id)}`);
      break;
    }
    let tagName = current.tagName;
    if (tagName !== "HTML") {
      tagName += `:nth-child(${index(current) + 1})`;
    }
    names.unshift(tagName);
    current = current.parentElement;
  }
  return names.join(" > ");
}
function escape(value) {
  return isString(value) ? CSS.escape(value) : "";
}

export { escape, find, findAll, query, queryAll };
