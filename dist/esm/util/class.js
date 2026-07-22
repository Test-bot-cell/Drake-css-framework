import { toNodes, isArray, isUndefined, includes } from './lang.js';

function addClass(element, ...classes) {
  for (const node of toNodes(element)) {
    const additions = toClasses(classes).filter((className) => !hasClass(node, className));
    if (additions.length) {
      node.classList.add(...additions);
    }
  }
}
function removeClass(element, ...classes) {
  for (const node of toNodes(element)) {
    const removals = toClasses(classes).filter((className) => hasClass(node, className));
    if (removals.length) {
      node.classList.remove(...removals);
    }
  }
}
function replaceClass(element, oldClass, newClass) {
  const newClasses = toClasses(newClass);
  const oldClasses = toClasses(oldClass).filter((className) => !includes(newClasses, className));
  removeClass(element, oldClasses);
  addClass(element, newClasses);
}
function hasClass(element, value) {
  const [className] = toClasses(value);
  return Boolean(
    className && toNodes(element).some((node) => node.classList.contains(className))
  );
}
function toggleClass(element, value, force) {
  const classes = toClasses(value);
  const toggle = isUndefined(force) ? void 0 : Boolean(force);
  for (const node of toNodes(element)) {
    for (const className of classes) {
      node.classList.toggle(className, toggle);
    }
  }
}
function toClasses(value) {
  if (!value) {
    return [];
  }
  return isArray(value) ? value.flatMap((item) => toClasses(item)) : String(value).split(" ").filter(Boolean);
}

export { addClass, hasClass, removeClass, replaceClass, toggleClass };
