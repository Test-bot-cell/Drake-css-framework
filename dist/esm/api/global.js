import { isString, toNode } from '../util/lang.js';
import { parents } from '../util/filter.js';
import { $, apply } from '../util/dom.js';
import { component, getComponents, getComponent } from './component.js';
import { mergeOptions } from './options.js';
import { init } from './state.js';
import { callUpdate } from './update.js';

function globalApi(App) {
  App.component = component;
  App.getComponents = getComponents;
  App.getComponent = getComponent;
  App.update = update;
  App.use = function(plugin) {
    if (!plugin.installed) {
      plugin.call(null, this);
      plugin.installed = true;
    }
    return this;
  };
  App.mixin = function(mixin, target) {
    var _a;
    const Component = (_a = isString(target) ? this.component(target) : target) != null ? _a : this;
    if (isComponentConstructor(Component)) {
      Component.options = mergeOptions(Component.options, mixin);
    }
  };
  App.extend = function(options = {}) {
    return extendComponent(this, options);
  };
  let container;
  Object.defineProperty(App, "container", {
    get: () => container != null ? container : document.body,
    set: (element) => {
      container = $(
        element instanceof Element || typeof element === "string" ? element : document.body
      );
    }
  });
}
function extendComponent(Super, options) {
  const Sub = function(componentOptions = {}) {
    init(this, componentOptions);
  };
  Sub.prototype = Object.create(Super.prototype);
  Sub.prototype.constructor = Sub;
  Sub.options = mergeOptions(Super.options, options);
  Sub.super = Super;
  Sub.extend = Super.extend;
  return Sub;
}
function update(element, event) {
  var _a;
  const node = (_a = toNode(element)) != null ? _a : document.body;
  if (!(node instanceof Element)) {
    return;
  }
  for (const parentElement of parents(node).reverse()) {
    updateElement(parentElement, event);
  }
  apply(node, (current) => updateElement(current, event));
}
function updateElement(element, event) {
  for (const instance of Object.values(getComponents(element))) {
    callUpdate(instance, event);
  }
}
function isComponentConstructor(value) {
  return typeof value === "function" && "options" in value;
}

export { globalApi as default, update };
