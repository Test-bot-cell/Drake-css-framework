import { hasClass, addClass, removeClass } from '../util/class.js';
import { on } from '../util/event.js';
import { noop, assign, isString } from '../util/lang.js';
import { css } from '../util/style.js';
import { height } from '../util/dimensions.js';
import { isTag, $, html } from '../util/dom.js';
import { defineComponent } from '../api/options.js';
import Modal from '../mixin/modal.js';

var modal = defineComponent()({
  install,
  mixins: [Modal],
  data: {
    clsPage: "drk-modal-page",
    selPanel: ".drk-modal-dialog",
    selClose: '[class*="drk-modal-close"]'
  },
  events: [
    {
      name: "fullscreenchange webkitendfullscreen",
      capture: true,
      handler(e) {
        if (isTag(e.target, "video") && this.isToggled() && !document.fullscreenElement) {
          this.hide();
        }
      }
    },
    {
      name: "show",
      self: true,
      handler() {
        if (hasClass(this.panel, "drk-margin-auto-vertical")) {
          addClass(this.$el, "drk-flex");
        } else {
          css(this.$el, "display", "block");
        }
        height(this.$el);
      }
    },
    {
      name: "hidden",
      self: true,
      handler() {
        css(this.$el, "display", "");
        removeClass(this.$el, "drk-flex");
      }
    }
  ]
});
function install({ modal }) {
  modal.dialog = function(content, options) {
    const dialog = modal($(`<div><div class="drk-modal-dialog">${content}</div></div>`), {
      stack: true,
      role: "alertdialog",
      ...options
    });
    dialog.show();
    on(
      dialog.$el,
      "hidden",
      async () => {
        await Promise.resolve();
        dialog.$destroy(true);
      },
      { self: true }
    );
    return dialog;
  };
  modal.alert = function(message, options) {
    return openDialog(
      ({ i18n }) => `<div class="drk-modal-body">${isString(message) ? message : html(message)}</div>  <div class="drk-modal-footer drk-text-right">  <button class="drk-button drk-button-primary drk-modal-close" type="button" autofocus>${i18n.ok}</button>  </div>`,
      options
    );
  };
  modal.confirm = function(message, options) {
    return openDialog(
      ({ i18n }) => `<form>  <div class="drk-modal-body">${isString(message) ? message : html(message)}</div>  <div class="drk-modal-footer drk-text-right">  <button class="drk-button drk-button-default drk-modal-close" type="button">${i18n.cancel}</button>  <button class="drk-button drk-button-primary" autofocus>${i18n.ok}</button>  </div>  </form>`,
      options,
      () => Promise.reject()
    );
  };
  modal.prompt = function(message, value, options) {
    const promise = openDialog(
      ({ i18n }) => `<form class="drk-form-stacked">  <div class="drk-modal-body">  <label>${isString(message) ? message : html(message)}</label>  <input class="drk-input" autofocus>  </div>  <div class="drk-modal-footer drk-text-right">  <button class="drk-button drk-button-default drk-modal-close" type="button">${i18n.cancel}</button>  <button class="drk-button drk-button-primary">${i18n.ok}</button>  </div>  </form>`,
      options,
      () => null,
      (dialog) => {
        const promptInput = $("input", dialog.$el);
        if (!promptInput) {
          throw new Error("Modal prompt input is missing.");
        }
        return promptInput.value;
      }
    );
    const { $el } = promise.dialog;
    const inputElement = $("input", $el);
    if (!inputElement) {
      throw new Error("Modal prompt input is missing.");
    }
    const input = inputElement;
    input.value = value || "";
    on($el, "show", () => input.select());
    return promise;
  };
  modal.i18n = {
    ok: "Ok",
    cancel: "Cancel"
  };
  function openDialog(tmpl, options, hideFn = noop, submitFn = noop) {
    const resolvedOptions = {
      bgClose: false,
      escClose: true,
      ...options,
      i18n: { ...modal.i18n, ...options == null ? void 0 : options.i18n }
    };
    const dialog = modal.dialog(tmpl(resolvedOptions), resolvedOptions);
    return assign(
      new Promise((resolve) => {
        const off = on(dialog.$el, "hide", () => resolve(hideFn()));
        on(dialog.$el, "submit", "form", (e) => {
          e.preventDefault();
          resolve(submitFn(dialog));
          off();
          dialog.hide();
        });
      }),
      { dialog }
    );
  }
}

export { modal as default };
