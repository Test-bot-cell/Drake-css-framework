import { isPlainObject, assign, isFunction } from '../util/lang.js';
import { fastdom } from '../util/fastdom.js';

function initUpdates(instance) {
  var _a;
  instance._data = {};
  instance._updates = normalizeUpdates(instance.$options.update);
  (_a = instance._disconnect) == null ? void 0 : _a.push(() => {
    instance._updates = null;
    instance._data = null;
  });
}
function prependUpdate(instance, update) {
  var _a;
  (_a = instance._updates) == null ? void 0 : _a.unshift(update);
}
function callUpdate(instance, event = "update") {
  const updates = instance._updates;
  if (!instance._connected || !(updates == null ? void 0 : updates.length)) {
    return;
  }
  if (!instance._updateCount) {
    instance._updateCount = 0;
    requestAnimationFrame(() => {
      instance._updateCount = 0;
    });
  }
  if (!instance._queued) {
    instance._queued = /* @__PURE__ */ new Set();
    fastdom.read(() => {
      const queued = instance._queued;
      const data = instance._data;
      if (instance._connected && queued && data) {
        runUpdates(instance, queued, updates, data);
      }
      instance._queued = null;
    });
  }
  if (instance._updateCount++ < 20) {
    instance._queued.add(typeof event === "string" ? event : event.type);
  }
}
function runUpdates(instance, types, updates, data) {
  for (const { read, write, events = [] } of updates) {
    if (!types.has("update") && !events.some((type) => types.has(type))) {
      continue;
    }
    const runtimeRead = read;
    const result = runtimeRead == null ? void 0 : runtimeRead.call(instance, data, types);
    if (result && isPlainObject(result)) {
      assign(data, result);
    }
    if (write && result !== false) {
      fastdom.write(() => {
        if (instance._connected) {
          write.call(instance, data, types);
        }
      });
    }
  }
}
function normalizeUpdates(update) {
  if (!update) {
    return [];
  }
  if (isFunction(update)) {
    return [{ read: update }];
  }
  return Array.isArray(update) ? [...update] : [update];
}

export { callUpdate, initUpdates, prependUpdate };
