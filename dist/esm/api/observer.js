import { isFunction, hasOwn, isString, toNodes, includes } from '../util/lang.js';
import { registerComputed } from './computed.js';
import { registerWatch } from './watch.js';

function initObservers(instance) {
  for (const observable of normalizeObservables(instance.$options.observe)) {
    registerObservable(instance, observable);
  }
}
function registerObservable(instance, observable) {
  const { observe, target = instance.$el, filter, args } = observable;
  const runtimeFilter = filter;
  if (runtimeFilter && !runtimeFilter.call(instance, instance)) {
    return;
  }
  const disconnect = instance._disconnect;
  if (!disconnect) {
    return;
  }
  const key = `_observe${disconnect.length}`;
  if (isFunction(target) && !hasOwn(instance, key)) {
    registerComputed(instance, key, () => {
      const targets2 = target.call(instance, instance);
      return toNodeInput(targets2);
    });
  }
  const handlerValue = isString(observable.handler) ? instance[observable.handler] : observable.handler;
  if (!isFunction(handlerValue)) {
    return;
  }
  const handler = handlerValue.bind(instance);
  const options = isFunction(observable.options) ? observable.options.call(instance, instance) : observable.options;
  const targets = hasOwn(instance, key) ? toNodeInput(instance[key]) : toNodeInput(target);
  const observer = observe(targets, handler, options, args);
  if (isFunction(target) && Array.isArray(instance[key])) {
    registerWatch(
      instance,
      { handler: updateTargets(observer, options), immediate: false },
      key
    );
  }
  disconnect.push(() => observer.disconnect());
}
function updateTargets(observer, options) {
  return (targets, previous) => {
    var _a;
    const currentNodes = toNodes(toNodeInput(targets));
    const previousNodes = toNodes(toNodeInput(previous));
    for (const target of previousNodes) {
      if (!includes(currentNodes, target)) {
        if (observer.unobserve) {
          observer.unobserve(target);
        } else if (observer.observe) {
          observer.disconnect();
        }
      }
    }
    for (const target of currentNodes) {
      if (!includes(previousNodes, target) || !observer.unobserve) {
        (_a = observer.observe) == null ? void 0 : _a.call(observer, target, options);
      }
    }
  };
}
function normalizeObservables(value) {
  return value ? Array.isArray(value) ? [...value] : [value] : [];
}
function toNodeInput(value) {
  if (value instanceof Node) {
    return value;
  }
  if (value && typeof value === "object" && (Symbol.iterator in value || "length" in value)) {
    return toNodes(value);
  }
  return void 0;
}

export { initObservers };
