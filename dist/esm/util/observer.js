import { inBrowser } from './env.js';
import { on } from './event.js';
import { toNodes } from './lang.js';

function observeIntersection(targets, callback, options = {}, { intersecting = true } = {}) {
  const observer = new IntersectionObserver(
    intersecting ? (entries, currentObserver) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        callback(entries, currentObserver);
      }
    } : callback,
    options
  );
  for (const element of toNodes(targets)) {
    observer.observe(element);
  }
  return observer;
}
function observeResize(targets, callback, options = { box: "border-box" }) {
  if (inBrowser && window.ResizeObserver) {
    const observer = new ResizeObserver(callback);
    for (const element of toNodes(targets)) {
      observer.observe(element, options);
    }
    return observer;
  }
  const notify = () => callback([], emptyResizeObserver);
  const off = [
    on(window, "load resize", notify),
    on(document, "loadedmetadata load", notify, true)
  ];
  return { disconnect: () => off.forEach((teardown) => teardown()) };
}
function observeViewportResize(callback) {
  const targets = window.visualViewport ? [window, window.visualViewport] : [window];
  return { disconnect: on(targets, "resize", () => callback(new Event("resize"))) };
}
const emptyResizeObserver = {
  disconnect() {
  },
  observe() {
  },
  unobserve() {
  }
};
function observeMutation(targets, callback, options = {}) {
  const observer = new MutationObserver(callback);
  for (const node of toNodes(targets)) {
    observer.observe(node, options);
  }
  return observer;
}

export { observeIntersection, observeMutation, observeResize, observeViewportResize };
