import { hasOwn } from '../util/lang.js';
import { on } from '../util/event.js';

function initEvents(instance) {
  for (const event of normalizeEvents(instance.$options.events)) {
    if (hasOwn(event, "handler")) {
      registerEvent(instance, event);
    } else {
      for (const [name, handler] of Object.entries(event)) {
        registerEvent(instance, { name, handler });
      }
    }
  }
}
function registerEvent(instance, definition) {
  var _a;
  const { name, el, handler, capture, passive, delegate, filter, self } = definition;
  const runtimeFilter = filter;
  if (runtimeFilter && !runtimeFilter.call(instance, instance)) {
    return;
  }
  const runtimeElement = el;
  const runtimeDelegate = delegate;
  const target = runtimeElement ? runtimeElement.call(instance, instance) : instance.$el;
  const delegateValue = runtimeDelegate == null ? void 0 : runtimeDelegate.call(instance, instance);
  const selector = typeof delegateValue === "string" ? delegateValue : false;
  const runtimeHandler = handler;
  const listener = (event, ...detail) => runtimeHandler.call(instance, event, ...detail);
  (_a = instance._disconnect) == null ? void 0 : _a.push(on(target, name, selector, listener, { passive, capture, self }));
}
function normalizeEvents(value) {
  return value ? Array.isArray(value) ? [...value] : [value] : [];
}

export { initEvents };
