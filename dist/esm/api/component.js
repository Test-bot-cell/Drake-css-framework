import { hyphenate, camelize, isEmpty, isPlainObject } from '../util/lang.js';
import { $$ } from '../util/dom.js';
import App from './app.js';

const PREFIX = "drk-";
const components = {};
function component(name, options) {
  const id = PREFIX + hyphenate(name);
  if (!options) {
    const current = components[id];
    if (!current) {
      throw new Error(`Component not registered: ${name}`);
    }
    if (!isComponentConstructor(current)) {
      components[id] = App.extend(current);
    }
    return components[id];
  }
  const normalizedName = camelize(name);
  App[normalizedName] = (element, data) => createComponent(normalizedName, element, data);
  const option = isComponentConstructor(options) ? options.options : { ...options };
  option.id = id;
  option.name = normalizedName;
  const install = option.install;
  install == null ? void 0 : install(App, option, normalizedName);
  if (App._initialized && !option.functional) {
    requestAnimationFrame(() => {
      createComponent(normalizedName, `[${id}],[data-${id}]`);
    });
  }
  components[id] = option;
  return option;
}
function createComponent(name, element, data, ...args) {
  const Component = component(name);
  if (Component.options.functional) {
    const componentData = isPlainObject(element) ? element : [element, data, ...args];
    return new Component({ data: componentData });
  }
  if (!element) {
    return new Component();
  }
  const elements = selectElements(element);
  return elements.map((item) => initialize(Component, name, item, data))[0];
}
function initialize(Component, name, element, data) {
  const instance = getComponent(element, name);
  if (instance) {
    if (data) {
      instance.$destroy();
    } else {
      return instance;
    }
  }
  const componentData = isPlainObject(data) ? data : {};
  return new Component({ el: element, data: componentData });
}
function selectElements(value) {
  if (typeof value === "string") {
    return $$(value);
  }
  if (value instanceof Element) {
    return [value];
  }
  if (value && typeof value === "object" && (Symbol.iterator in value || "length" in value)) {
    return Array.from(value).filter(
      (item) => item instanceof Element
    );
  }
  return [];
}
function getComponents(element) {
  var _a;
  return element ? (_a = element.__drake__) != null ? _a : {} : {};
}
function getComponent(element, name) {
  return getComponents(element)[name];
}
function attachToElement(element, instance) {
  var _a;
  const mounted = element;
  (_a = mounted.__drake__) != null ? _a : mounted.__drake__ = {};
  const name = instance.$options.name;
  if (name) {
    mounted.__drake__[name] = instance;
  }
}
function detachFromElement(element, instance) {
  var _a;
  const mounted = element;
  const name = instance.$options.name;
  if (name) {
    (_a = mounted.__drake__) == null ? true : delete _a[name];
  }
  if (isEmpty(mounted.__drake__)) {
    delete mounted.__drake__;
  }
}
function isComponentConstructor(value) {
  return typeof value === "function" && "options" in value;
}

export { attachToElement, component, components, createComponent, detachFromElement, getComponent, getComponents };
