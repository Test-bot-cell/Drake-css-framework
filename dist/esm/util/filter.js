import { inBrowser } from './env.js';
import { toNode, toNodes, toArray } from './lang.js';

const voidElements = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
function isVoidElement(element) {
  return toNodes(element).some((item) => voidElements.has(item.tagName.toLowerCase()));
}
function isVisible(element) {
  return toNodes(element).some((item) => {
    if (inBrowser && typeof item.checkVisibility === "function") {
      return item.checkVisibility();
    }
    return item instanceof HTMLElement && Boolean(item.offsetWidth || item.offsetHeight) || item.getClientRects().length > 0;
  });
}
const selInput = "input,select,textarea,button";
function isInput(element) {
  return toNodes(element).some((item) => matches(item, selInput));
}
const selFocusable = `${selInput},a[href],[tabindex]`;
function isFocusable(element) {
  return matches(element, selFocusable);
}
function parent(element) {
  var _a;
  return (_a = toNode(element)) == null ? void 0 : _a.parentElement;
}
function filter(elements, selector) {
  return toNodes(elements).filter((element) => matches(element, selector));
}
function matches(element, selector) {
  return toNodes(element).some((item) => item.matches(selector));
}
function parents(element, selector) {
  const result = [];
  let current = parent(element);
  while (current) {
    if (!selector || matches(current, selector)) {
      result.push(current);
    }
    current = current.parentElement;
  }
  return result;
}
function children(element, selector) {
  const node = toNode(element);
  const result = node ? toArray(node.children) : [];
  return selector ? filter(result, selector) : result;
}
function index(element, reference) {
  const node = toNode(element);
  if (!node) {
    return -1;
  }
  const referenceNode = toNode(reference);
  return referenceNode ? toNodes(element).indexOf(referenceNode) : children(parent(node)).indexOf(node);
}
function isSameSiteAnchor(element) {
  const node = toNode(element);
  return node instanceof HTMLAnchorElement && ["origin", "pathname", "search"].every(
    (part) => node[part] === location[part]
  );
}
function getTargetedElement(element) {
  var _a;
  const anchor = toNode(element);
  if (!(anchor instanceof HTMLAnchorElement) || !isSameSiteAnchor(anchor)) {
    return;
  }
  const { hash, ownerDocument } = anchor;
  const id = decodeURIComponent(hash).slice(1);
  return id ? (_a = ownerDocument.getElementById(id)) != null ? _a : ownerDocument.getElementsByName(id)[0] : ownerDocument.documentElement;
}

export { children, filter, getTargetedElement, index, isFocusable, isInput, isSameSiteAnchor, isVisible, isVoidElement, matches, parent, parents, selFocusable, selInput };
