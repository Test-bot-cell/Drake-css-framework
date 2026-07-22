import { isObject, isUndefined, toNode, toNodes } from './lang.js';

function attr(element, name, value) {
  var _a;
  if (isObject(name)) {
    for (const key in name) {
      const attributeValue = name[key];
      if (isAttributeValue(attributeValue)) {
        attr(element, key, attributeValue);
      }
    }
    return;
  }
  if (isUndefined(value)) {
    return (_a = toNode(element)) == null ? void 0 : _a.getAttribute(name);
  }
  for (const item of toNodes(element)) {
    if (value === null) {
      removeAttr(item, name);
    } else {
      item.setAttribute(name, String(value));
    }
  }
}
function isAttributeValue(value) {
  return ["string", "number", "boolean"].includes(typeof value) || value === null;
}
function hasAttr(element, name) {
  return toNodes(element).some((item) => item.hasAttribute(name));
}
function removeAttr(element, name) {
  toNodes(element).forEach((item) => item.removeAttribute(name));
}
function data(element, attribute) {
  for (const name of [attribute, `data-${attribute}`]) {
    if (hasAttr(element, name)) {
      return attr(element, name);
    }
  }
}

export { attr, data, hasAttr, removeAttr };
