import { hasOwn, isEqual } from '../util/lang.js';

function initWatches(instance) {
  instance._watches = [];
  for (const watches of normalizeWatchMaps(instance.$options.watch)) {
    for (const [name, watch] of Object.entries(watches)) {
      registerWatch(instance, watch, name);
    }
  }
  instance._initial = true;
}
function registerWatch(instance, watch, name) {
  const definition = typeof watch === "function" ? { handler: watch } : watch;
  instance._watches.push({ name, ...definition });
}
function runWatches(instance, values) {
  for (const { name, handler, immediate = true } of instance._watches) {
    if (instance._initial && immediate || hasOwn(values, name) && !isEqual(values[name], instance[name])) {
      handler.call(instance, instance[name], values[name]);
    }
  }
  instance._initial = false;
}
function normalizeWatchMaps(value) {
  return value ? Array.isArray(value) ? [...value] : [value] : [];
}

export { initWatches, registerWatch, runWatches };
