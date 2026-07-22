/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

import { removeClass, hasClass, addClass, trigger, $, html, toFloat } from './../drake-util.esm.js';

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
}
function defineComponent(options) {
  return ((component) => component);
}
function defineMixin(options) {
  return ((mixin) => mixin);
}

var Class = defineMixin()({
  connected() {
    this._cmpCls = hasClass(this.$el, this.$options.id);
    addClass(this.$el, this.$options.id);
  },
  disconnected() {
    if (!this._cmpCls) {
      removeClass(this.$el, this.$options.id);
    }
  }
});

const units = ["days", "hours", "minutes", "seconds"];
var Component = defineComponent()({
  mixins: [Class],
  props: {
    date: String,
    clsWrapper: String,
    role: String,
    reload: Boolean
  },
  data: {
    date: "",
    clsWrapper: ".drk-countdown-%unit%",
    role: "timer",
    reload: false
  },
  connected() {
    this.$el.role = this.role;
    this.date = toFloat(Date.parse(this.$props.date));
    this.started = this.end = false;
    this.start();
  },
  disconnected() {
    this.stop();
  },
  events: {
    name: "visibilitychange",
    el: () => document,
    handler() {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    }
  },
  methods: {
    start() {
      this.stop();
      this.update();
    },
    stop() {
      if (this.timer) {
        clearInterval(this.timer);
        trigger(this.$el, "countdownstop");
        this.timer = null;
      }
    },
    update() {
      const timespan = getTimeSpan(this.date);
      if (!timespan.total) {
        this.stop();
        if (!this.end) {
          trigger(this.$el, "countdownend");
          this.end = true;
          if (this.reload && this.started) {
            window.location.reload();
          }
        }
      } else if (!this.timer) {
        this.started = true;
        this.timer = setInterval(this.update, 1e3);
        trigger(this.$el, "countdownstart");
      }
      for (const unit of units) {
        const el = $(this.clsWrapper.replace("%unit%", unit), this.$el);
        if (!el) {
          continue;
        }
        const digits = Math.trunc(timespan[unit]).toString().padStart(2, "0");
        if (el.textContent !== digits) {
          const digitValues = digits.split("");
          if (digitValues.length !== el.children.length) {
            html(el, digitValues.map(() => "<span></span>").join(""));
          }
          digitValues.forEach((digit, i) => {
            const digitElement = el.children[i];
            if (digitElement) {
              digitElement.textContent = digit;
            }
          });
        }
      }
    }
  }
});
function getTimeSpan(date) {
  const total = Math.max(0, date - Date.now()) / 1e3;
  return {
    total,
    seconds: total % 60,
    minutes: total / 60 % 60,
    hours: total / 60 / 60 % 24,
    days: total / 60 / 60 / 24
  };
}

var name = 'countdown';

if (typeof window !== "undefined" && window.Drake) {
  window.Drake.component(name, Component);
}

export { Component as default };
