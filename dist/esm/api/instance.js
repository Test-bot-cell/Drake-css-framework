import { remove } from '../util/dom.js';
import { attachToElement, detachFromElement, createComponent, getComponent } from './component.js';
import { update } from './global.js';
import { callConnected, callDisconnected, callHook } from './hooks.js';
import { callUpdate } from './update.js';

function instanceApi(App) {
  App.prototype.$mount = function(element) {
    attachToElement(element, this);
    this.$options.el = element;
    if (element.isConnected) {
      callConnected(this);
    }
  };
  App.prototype.$destroy = function(removeElement = false) {
    const element = this.$options.el;
    if (element) {
      callDisconnected(this);
    }
    callHook(this, "destroy");
    if (element) {
      detachFromElement(element, this);
      if (removeElement) {
        remove(element);
      }
    }
  };
  App.prototype.$create = createComponent;
  App.prototype.$emit = function(event) {
    callUpdate(this, event);
  };
  App.prototype.$update = function(element = this.$el, event) {
    update(element, event);
  };
  App.prototype.$reset = function() {
    callDisconnected(this);
    callConnected(this);
  };
  App.prototype.$getComponent = getComponent;
  Object.defineProperties(App.prototype, {
    $el: {
      get() {
        return this.$options.el;
      }
    },
    $container: {
      get() {
        return App.container;
      }
    }
  });
}
let id = 1;
function generateId(instance, element) {
  var _a;
  return (element == null ? void 0 : element.id) || `${(_a = instance.$options.id) != null ? _a : "drk"}-${id++}`;
}

export { instanceApi as default, generateId };
