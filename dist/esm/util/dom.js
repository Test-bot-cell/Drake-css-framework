import { once } from './event.js';
import { parent } from './filter.js';
import { toNode, toNodes, isElement, toArray, isString, startsWith } from './lang.js';
import { find, findAll } from './selector.js';

function ready(callback) {
  if (document.readyState !== "loading") {
    callback();
    return;
  }
  once(document, "DOMContentLoaded", callback);
}
function isTag(element, ...tagNames) {
  return element instanceof Element && tagNames.some((tagName) => element.tagName.toLowerCase() === tagName.toLowerCase());
}
function empty(element) {
  const node = $(element);
  if (node) {
    node.innerHTML = "";
  }
  return node;
}
function html(element, value) {
  const node = $(element);
  return value === void 0 ? node == null ? void 0 : node.innerHTML : append(empty(element), value);
}
const prepend = applyInsert("prepend");
const append = applyInsert("append");
const before = applyInsert("before");
const after = applyInsert("after");
function applyInsert(method) {
  return (reference, value) => {
    const nodes = toNodes(isString(value) ? fragment(value) : value);
    const node = $(reference);
    if (node) {
      node[method](...nodes);
    }
    return unwrapSingle(nodes);
  };
}
function remove(element) {
  toNodes(element).forEach((node) => {
    var _a;
    return (_a = node.parentNode) == null ? void 0 : _a.removeChild(node);
  });
}
function wrapAll(element, structure) {
  let wrapper = toNode(before(element, structure));
  while (wrapper instanceof Element && wrapper.firstElementChild) {
    wrapper = wrapper.firstElementChild;
  }
  if (wrapper instanceof Element) {
    append(wrapper, element);
    return wrapper;
  }
}
function wrapInner(element, structure) {
  return toNodes(
    toNodes(element).map(
      (node) => node.hasChildNodes() ? wrapAll(toArray(node.childNodes), structure) : append(node, structure)
    )
  );
}
function unwrap(element) {
  const uniqueParents = toNodes(element).map((node) => parent(node)).filter((value) => Boolean(value)).filter((value, index, values) => values.indexOf(value) === index);
  uniqueParents.forEach((node) => node.replaceWith(...node.childNodes));
}
const singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
function fragment(value) {
  const matches = singleTagRe.exec(value);
  if (matches == null ? void 0 : matches[1]) {
    return document.createElement(matches[1]);
  }
  const container = document.createElement("template");
  container.innerHTML = value.trim();
  return unwrapSingle(toArray(container.content.childNodes));
}
function unwrapSingle(nodes) {
  return nodes.length > 1 ? [...nodes] : nodes[0];
}
function apply(node, callback) {
  if (!isElement(node)) {
    return;
  }
  callback(node);
  for (const child of toArray(node.children)) {
    apply(child, callback);
  }
}
function $(selector, context) {
  return isHtml(selector) ? toNode(fragment(selector)) : find(selector, context);
}
function $$(selector, context) {
  return isHtml(selector) ? toNodes(fragment(selector)) : findAll(selector, context);
}
function isHtml(value) {
  return isString(value) && startsWith(value.trim(), "<");
}

export { $, $$, after, append, apply, before, empty, fragment, html, isTag, prepend, ready, remove, unwrap, wrapAll, wrapInner };
