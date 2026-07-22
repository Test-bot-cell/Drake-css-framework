import { assign, hasOwn, camelize, hyphenate, startsWith, isString, memoize } from '../util/lang.js';
import { data } from '../util/attr.js';
import { coerce, parseOptions } from './options.js';

function initProps(instance) {
  const props = getProps(instance.$options);
  assign(instance.$props, props);
  const { computed, methods } = instance.$options;
  for (const key of Object.keys(instance.$props)) {
    if (key in props && (!computed || !hasOwn(computed, key)) && (!methods || !hasOwn(methods, key))) {
      instance[key] = instance.$props[key];
    }
  }
}
function getProps(options) {
  var _a;
  const data$1 = {};
  const props = normalizeProps(options.props);
  const element = options.el;
  if (!element) {
    return data$1;
  }
  for (const key of Object.keys(props)) {
    const property = hyphenate(key);
    const rawValue = data(element, property);
    if (rawValue === void 0) {
      continue;
    }
    const value = props[key] === Boolean && rawValue === "" ? true : coerce(props[key], rawValue);
    if (property === "target" && startsWith(value, "_")) {
      continue;
    }
    data$1[key] = value;
  }
  const parsed = parseOptions(data(element, (_a = options.id) != null ? _a : ""), normalizeArgs(options.args));
  for (const [key, value] of Object.entries(parsed)) {
    const property = camelize(key);
    if (props[property] !== void 0) {
      data$1[property] = coerce(props[property], value);
    }
  }
  return data$1;
}
const getAttributes = memoize((id, props) => {
  const attributes = Object.keys(props);
  const filter = attributes.concat(id).filter(Boolean).flatMap((key) => [hyphenate(key), `data-${hyphenate(key)}`]);
  return { attributes, filter };
});
function initPropsObserver(instance) {
  var _a, _b;
  const { $options, $props } = instance;
  const props = normalizeProps($options.props);
  const element = $options.el;
  if (!element || !Object.keys(props).length) {
    return;
  }
  const id = (_a = $options.id) != null ? _a : "";
  const { attributes, filter } = getAttributes(id, props);
  const observer = new MutationObserver((records) => {
    const data = getProps($options);
    const changed = records.some(({ attributeName }) => {
      if (!attributeName) {
        return false;
      }
      const property = attributeName.replace("data-", "");
      const keys = property === id ? attributes : [camelize(property), camelize(attributeName)];
      return keys.some((key) => data[key] !== void 0 && data[key] !== $props[key]);
    });
    if (changed) {
      instance.$reset();
    }
  });
  observer.observe(element, { attributes: true, attributeFilter: filter });
  (_b = instance._disconnect) == null ? void 0 : _b.push(() => observer.disconnect());
}
function normalizeProps(props) {
  if (!props) {
    return {};
  }
  return Array.isArray(props) ? Object.fromEntries(props.filter(isString).map((key) => [key, String])) : { ...props };
}
function normalizeArgs(args) {
  return typeof args === "boolean" || !args ? [] : isString(args) ? [args] : [...args];
}

export { initProps, initPropsObserver };
