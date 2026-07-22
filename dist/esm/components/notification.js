import { Transition } from '../util/animation.js';
import { toFloat } from '../util/lang.js';
import { $, append, remove, apply } from '../util/dom.js';
import { trigger } from '../util/event.js';
import { css } from '../util/style.js';
import { pointerEnter, pointerLeave } from '../util/env.js';
import { parent } from '../util/filter.js';
import { defineComponent } from '../api/options.js';
import Container from '../mixin/container.js';
import { maybeDefaultPreventClick } from '../mixin/event.js';

var notification = defineComponent()({
  mixins: [Container],
  functional: true,
  args: ["message", "status"],
  data: {
    message: "",
    status: "",
    timeout: 5e3,
    group: "",
    pos: "top-center",
    clsContainer: "drk-notification",
    clsClose: "drk-notification-close",
    clsMsg: "drk-notification-message"
  },
  install,
  computed: {
    marginProp: ({ pos }) => {
      var _a, _b;
      return `margin-${(_b = (_a = pos.match(/[a-z]+(?=-)/)) == null ? void 0 : _a[0]) != null ? _b : "top"}`;
    },
    startProps() {
      return { opacity: 0, [this.marginProp]: -this.$el.offsetHeight };
    }
  },
  created() {
    const posClass = `${this.clsContainer}-${this.pos}`;
    const containerAttr = `data-${this.clsContainer}-container`;
    let container = $(`.${posClass}[${containerAttr}]`, this.container);
    if (!container) {
      const appendedContainer = append(
        this.container,
        `<div class="${this.clsContainer} ${posClass}" ${containerAttr}></div>`
      );
      container = appendedContainer instanceof HTMLElement ? appendedContainer : void 0;
    }
    if (!container) {
      return;
    }
    const message = append(
      container,
      `<div class="${this.clsMsg}${this.status ? ` ${this.clsMsg}-${this.status}` : ""}" role="alert">  <a href class="${this.clsClose}" data-drk-close></a>  <div>${this.message}</div>  </div>`
    );
    if (message instanceof Element) {
      this.$mount(message);
    }
  },
  async connected() {
    const margin = toFloat(css(this.$el, this.marginProp));
    css(this.$el, this.startProps);
    await Transition.start(this.$el, {
      opacity: 1,
      [this.marginProp]: margin
    });
    if (this.timeout) {
      this.timer = setTimeout(this.close, this.timeout);
    }
  },
  events: [
    {
      name: "click",
      handler(e) {
        if (hasElementTarget(e)) {
          maybeDefaultPreventClick(e);
        }
        this.close();
      }
    },
    {
      name: pointerEnter,
      handler() {
        if (this.timer) {
          clearTimeout(this.timer);
        }
      }
    },
    {
      name: pointerLeave,
      handler() {
        if (this.timeout) {
          this.timer = setTimeout(this.close, this.timeout);
        }
      }
    }
  ],
  methods: {
    async close(immediate = false) {
      const removeFn = (el) => {
        const container = parent(el);
        trigger(el, "close", [this]);
        remove(el);
        if (!(container == null ? void 0 : container.hasChildNodes())) {
          remove(container);
        }
      };
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (!immediate) {
        await Transition.start(this.$el, this.startProps);
      }
      removeFn(this.$el);
    }
  }
});
function install(Drake) {
  Drake.notification.closeAll = function(group, immediate) {
    apply(document.body, (el) => {
      const notification = Drake.getComponent(el, "notification");
      if (isNotificationInstance(notification) && (!group || group === notification.group)) {
        notification.close(immediate);
      }
    });
  };
}
function isNotificationInstance(instance) {
  return Boolean(instance) && typeof (instance == null ? void 0 : instance.group) === "string" && typeof instance.close === "function";
}
function hasElementTarget(event) {
  return event.target instanceof Element;
}

export { notification as default };
