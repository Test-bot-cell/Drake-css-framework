import { startsWith } from '../util/lang.js';
import { trigger } from '../util/event.js';
import { hasAttr } from '../util/attr.js';
import { apply } from '../util/dom.js';
import { inBrowser } from '../util/env.js';
import { getComponents, createComponent, getComponent, components } from './component.js';
import { callConnected, callDisconnected } from './hooks.js';

function boot(App) {
  if (!inBrowser || !window.MutationObserver) {
    return;
  }
  if (document.body) {
    requestAnimationFrame(() => initialize(App));
  } else {
    new MutationObserver((_records, observer) => {
      if (document.body) {
        initialize(App);
        observer.disconnect();
      }
    }).observe(document.documentElement, { childList: true });
  }
}
function initialize(App) {
  trigger(document, "drake:init", App);
  if (document.body) {
    apply(document.body, connect);
  }
  new MutationObserver(handleMutation).observe(document, {
    subtree: true,
    childList: true,
    attributes: true
  });
  App._initialized = true;
}
function handleMutation(records) {
  var _a;
  for (const { addedNodes, removedNodes, target, attributeName } of records) {
    for (const node of addedNodes) {
      apply(node, connect);
    }
    for (const node of removedNodes) {
      apply(node, disconnect);
    }
    if (!(target instanceof Element) || !attributeName) {
      continue;
    }
    const name = getComponentName(attributeName);
    if (name) {
      if (hasAttr(target, attributeName)) {
        createComponent(name, target);
      } else {
        (_a = getComponent(target, name)) == null ? void 0 : _a.$destroy();
      }
    }
  }
}
function connect(node) {
  for (const instance of Object.values(getComponents(node))) {
    callConnected(instance);
  }
  for (const attributeName of node.getAttributeNames()) {
    const name = getComponentName(attributeName);
    if (name) {
      createComponent(name, node);
    }
  }
}
function disconnect(node) {
  for (const instance of Object.values(getComponents(node))) {
    callDisconnected(instance);
  }
}
function getComponentName(attribute) {
  const normalized = startsWith(attribute, "data-") ? attribute.slice(5) : attribute;
  const component = components[normalized];
  return typeof component === "function" ? component.options.name : component == null ? void 0 : component.name;
}

export { boot as default };
