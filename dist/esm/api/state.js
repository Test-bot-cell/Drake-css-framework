import { isArray, isPlainObject, assign, isFunction, isString } from '../util/lang.js';
import { initComputed } from './computed.js';
import { callHook } from './hooks.js';
import { mergeOptions, coerce } from './options.js';

let uid = 0;
function init(instance, options = {}) {
  options.data = normalizeData(options, instance.constructor.options);
  instance.$options = mergeOptions(instance.constructor.options, options, instance);
  instance.$props = {};
  instance._uid = uid++;
  instance._connected = false;
  instance._disconnect = null;
  instance._updates = null;
  instance._data = null;
  instance._updateCount = 0;
  instance._queued = null;
  instance._watches = [];
  instance._initial = false;
  initData(instance);
  initMethods(instance);
  initComputed(instance);
  callHook(instance, "created");
  if (options.el) {
    instance.$mount(options.el);
  }
}
function initData(instance) {
  const option = instance.$options.data;
  const data = isFunction(option) ? option.call(instance, instance) : option;
  if (!isPlainObject(data)) {
    return;
  }
  for (const key in data) {
    instance.$props[key] = data[key];
    instance[key] = data[key];
  }
}
function initMethods(instance) {
  var _a;
  for (const [key, method] of Object.entries((_a = instance.$options.methods) != null ? _a : {})) {
    instance[key] = method.bind(instance);
  }
}
function normalizeData({ data: source = {} }, componentOptions) {
  const args = normalizeArgs(componentOptions.args);
  const props = normalizeProps(componentOptions.props);
  let data;
  if (isArray(source)) {
    data = source.slice(0, args.length).reduce((result, value, index) => {
      if (isPlainObject(value)) {
        assign(result, value);
      } else {
        const key = args[index];
        if (key) {
          result[key] = value;
        }
      }
      return result;
    }, {});
  } else {
    data = isPlainObject(source) ? { ...source } : {};
  }
  for (const key of Object.keys(data)) {
    if (data[key] === void 0) {
      delete data[key];
    } else if (props[key]) {
      data[key] = coerce(props[key], data[key]);
    }
  }
  return data;
}
function normalizeArgs(args) {
  return typeof args === "boolean" || !args ? [] : isString(args) ? [args] : [...args];
}
function normalizeProps(props) {
  if (!props) {
    return {};
  }
  return Array.isArray(props) ? Object.fromEntries(props.filter(isString).map((key) => [key, String])) : { ...props };
}

export { init };
