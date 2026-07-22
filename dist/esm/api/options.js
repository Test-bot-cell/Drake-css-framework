import { isObject, isArray, toBoolean, toNumber, isString, startsWith, isNumeric, isFunction } from '../util/lang.js';

const strategies = {};
for (const key of [
  "events",
  "watch",
  "observe",
  "created",
  "beforeConnect",
  "connected",
  "beforeDisconnect",
  "disconnected",
  "destroy"
]) {
  strategies[key] = concatStrategy;
}
strategies.args = (parent, child) => child !== false && concatStrategy(child || parent, void 0);
strategies.update = (parent, child) => concatStrategy(parent, isFunction(child) ? { read: child } : child);
strategies.props = (parent, child) => {
  const normalized = isArray(child) ? Object.fromEntries(child.filter(isString).map((key) => [key, String])) : child;
  return mergeRecordStrategy(parent, normalized);
};
strategies.computed = mergeRecordStrategy;
strategies.methods = mergeRecordStrategy;
strategies.i18n = dataStrategy;
strategies.data = dataStrategy;
function dataStrategy(parent, child, instance) {
  if (!instance) {
    if (!child) {
      return parent;
    }
    if (!parent) {
      return child;
    }
    return function(current) {
      return mergeFunctionData(parent, child, current);
    };
  }
  return mergeFunctionData(parent, child, instance);
}
function mergeFunctionData(parent, child, instance) {
  return mergeRecords(
    isFunction(parent) ? parent.call(instance, instance) : parent,
    isFunction(child) ? child.call(instance, instance) : child
  );
}
function concatStrategy(parent, child) {
  const parentValues = parent === void 0 ? void 0 : isArray(parent) ? parent : [parent];
  if (child === void 0) {
    return parentValues;
  }
  const childValues = isArray(child) ? child : [child];
  return parentValues ? [...parentValues, ...childValues] : childValues;
}
function mergeRecordStrategy(parent, child) {
  return mergeRecords(parent, child);
}
function mergeRecords(parent, child) {
  if (!isObject(child)) {
    return isObject(parent) ? { ...parent } : void 0;
  }
  return isObject(parent) ? { ...parent, ...child } : { ...child };
}
function defaultStrategy(parent, child) {
  return child === void 0 ? parent : child;
}
function mergeOptions(parent = {}, child = {}, instance) {
  var _a;
  const source = isComponentConstructor(child) ? child.options : child;
  let base = parent;
  if (source.extends && isObject(source.extends)) {
    base = mergeOptions(base, source.extends, instance);
  }
  const mixins = toArray(source.mixins);
  for (const mixin of mixins) {
    if (isObject(mixin)) {
      base = mergeOptions(base, mixin, instance);
    }
  }
  const options = {};
  for (const key of /* @__PURE__ */ new Set([...Object.keys(base), ...Object.keys(source)])) {
    options[key] = ((_a = strategies[key]) != null ? _a : defaultStrategy)(base[key], source[key], instance);
  }
  return options;
}
function isComponentConstructor(value) {
  return typeof value === "function" && "options" in value;
}
function toArray(value) {
  if (value === void 0) {
    return [];
  }
  return isArray(value) ? value : [value];
}
function parseOptions(value, args = []) {
  if (!isString(value) || !value) {
    return {};
  }
  try {
    if (startsWith(value, "{")) {
      const parsed = JSON.parse(value);
      return isObject(parsed) ? { ...parsed } : {};
    }
    if (args.length && !value.includes(":")) {
      const first = args[0];
      return first ? { [first]: value } : {};
    }
    return value.split(";").reduce((options, option) => {
      const [rawKey, rawValue] = option.split(/:(.*)/);
      const key = rawKey == null ? void 0 : rawKey.trim();
      if (key && rawValue !== void 0) {
        options[key] = rawValue.trim();
      }
      return options;
    }, {});
  } catch {
    return {};
  }
}
function coerce(type, value) {
  if (type === Boolean) {
    return toBoolean(value);
  }
  if (type === Number) {
    return toNumber(value);
  }
  if (type === "list") {
    return toList(value);
  }
  if (type === Object && isString(value)) {
    return parseOptions(value);
  }
  return typeof type === "function" ? type(value) : value;
}
const listRe = /,(?![^(]*\))/;
function toList(value) {
  if (isArray(value)) {
    return value;
  }
  return isString(value) ? value.split(listRe).map((item) => isNumeric(item) ? toNumber(item) : toBoolean(item.trim())) : [value];
}
function defineComponent(options) {
  return ((component) => component);
}
function defineMixin(options) {
  return ((mixin) => mixin);
}

export { coerce, defineComponent, defineMixin, mergeOptions, parseOptions };
