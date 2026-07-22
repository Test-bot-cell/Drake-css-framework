import { hasOwn, isString } from '../util/lang.js';
import { observeMutation } from '../util/observer.js';
import { prependUpdate, callUpdate } from './update.js';
import { runWatches } from './watch.js';

function initComputed(instance) {
  var _a;
  instance._computed = {};
  for (const [key, definition] of Object.entries((_a = instance.$options.computed) != null ? _a : {})) {
    registerComputed(instance, key, definition);
  }
}
const mutationOptions = { subtree: true, childList: true };
function registerComputed(instance, key, definition) {
  instance._hasComputed = true;
  Object.defineProperty(instance, key, {
    enumerable: true,
    get() {
      var _a;
      const { _computed, $props, $el } = instance;
      if (!hasOwn(_computed, key)) {
        _computed[key] = getComputedValue(definition, instance, $props, $el);
        const observerDefinition = typeof definition === "function" ? void 0 : definition.observe;
        if (observerDefinition && instance._computedObserver) {
          const runtimeObserve = observerDefinition;
          const selector = runtimeObserve.call(instance, $props);
          if (isString(selector) && selector) {
            const root = ["~", "+", "-"].includes((_a = selector[0]) != null ? _a : "") ? $el.parentElement : $el.getRootNode();
            if (root) {
              instance._computedObserver.observe(root, mutationOptions);
            }
          }
        }
      }
      return _computed[key];
    },
    set(value) {
      const objectDefinition = typeof definition === "function" ? void 0 : definition;
      instance._computed[key] = (objectDefinition == null ? void 0 : objectDefinition.set) ? objectDefinition.set.call(instance, value) : value;
      if (instance._computed[key] === void 0) {
        delete instance._computed[key];
      }
    }
  });
}
function getComputedValue(definition, instance, props, element) {
  if (typeof definition === "function") {
    const runtimeDefinition = definition;
    return runtimeDefinition.call(instance, props, element);
  }
  const getter = definition.get;
  return getter == null ? void 0 : getter.call(instance, props, element);
}
function initComputedUpdates(instance) {
  var _a;
  if (!instance._hasComputed) {
    return;
  }
  prependUpdate(instance, {
    read: () => runWatches(instance, resetComputed(instance)),
    events: ["resize", "computed"]
  });
  instance._computedObserver = observeMutation(
    instance.$el,
    () => callUpdate(instance, "computed"),
    mutationOptions
  );
  (_a = instance._disconnect) == null ? void 0 : _a.push(() => {
    var _a2;
    (_a2 = instance._computedObserver) == null ? void 0 : _a2.disconnect();
    instance._computedObserver = null;
    resetComputed(instance);
  });
}
function resetComputed(instance) {
  const values = { ...instance._computed };
  instance._computed = {};
  return values;
}

export { initComputed, initComputedUpdates, registerComputed };
