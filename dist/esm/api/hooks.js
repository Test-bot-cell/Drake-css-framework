import { initComputedUpdates } from './computed.js';
import { initEvents } from './events.js';
import { initObservers } from './observer.js';
import { initProps, initPropsObserver } from './props.js';
import { initUpdates, callUpdate } from './update.js';
import { initWatches } from './watch.js';

function callHook(instance, hook) {
  for (const handler of normalizeHooks(instance.$options[hook])) {
    handler.call(instance);
  }
}
function callConnected(instance) {
  if (instance._connected) {
    return;
  }
  initProps(instance);
  callHook(instance, "beforeConnect");
  instance._connected = true;
  instance._disconnect = [];
  initEvents(instance);
  initUpdates(instance);
  initWatches(instance);
  initObservers(instance);
  initPropsObserver(instance);
  initComputedUpdates(instance);
  callHook(instance, "connected");
  callUpdate(instance);
}
function callDisconnected(instance) {
  var _a;
  if (!instance._connected) {
    return;
  }
  callHook(instance, "beforeDisconnect");
  (_a = instance._disconnect) == null ? void 0 : _a.forEach((off) => off());
  instance._disconnect = null;
  callHook(instance, "disconnected");
  instance._connected = false;
}
function normalizeHooks(value) {
  return value ? Array.isArray(value) ? value : [value] : [];
}

export { callConnected, callDisconnected, callHook };
