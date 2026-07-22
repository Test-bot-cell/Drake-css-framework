import { isTouch, on, once } from '../util/event.js';
import { attr, data } from '../util/attr.js';
import { flipPosition, offset } from '../util/dimensions.js';
import { append, remove } from '../util/dom.js';
import { pointerEnter, pointerDown, pointerLeave } from '../util/env.js';
import { matches, isFocusable } from '../util/filter.js';
import { overflowParents } from '../util/viewport.js';
import { generateId } from '../api/instance.js';
import { defineComponent, parseOptions } from '../api/options.js';
import Container from '../mixin/container.js';
import Position from '../mixin/position.js';
import Togglable from '../mixin/togglable.js';
import { keyMap } from '../util/keys.js';

var tooltip = defineComponent()({
  mixins: [Container, Togglable, Position],
  data: {
    pos: "top",
    animation: ["drk-animation-scale-up"],
    duration: 100,
    cls: "drk-active"
  },
  connected() {
    makeFocusable(this.$el);
  },
  disconnected() {
    this.hide();
  },
  methods: {
    show() {
      if (this.isToggled(this.tooltip || null)) {
        return;
      }
      const { delay = 0, title } = parseProps(this.$options);
      if (!title) {
        return;
      }
      const titleAttr = attr(this.$el, "title");
      const off = on(this.$el, ["blur", pointerLeave], (e) => !isTouch(e) && this.hide());
      this.reset = () => {
        attr(this.$el, { title: titleAttr != null ? titleAttr : null, "aria-describedby": null });
        off();
      };
      const id = generateId(this);
      attr(this.$el, { title: null, "aria-describedby": id });
      clearTimeout(this.showTimer);
      this.showTimer = setTimeout(() => this._show(title, id), delay);
    },
    async hide() {
      var _a;
      if (matches(this.$el, "input:focus")) {
        return;
      }
      clearTimeout(this.showTimer);
      const tooltip = this.tooltip;
      if (tooltip && this.isToggled(tooltip)) {
        await this.toggleElement(tooltip, false, false);
      }
      (_a = this.reset) == null ? void 0 : _a.call(this);
      remove(this.tooltip);
      this.tooltip = null;
    },
    async _show(title, id) {
      const tooltip = append(
        this.container,
        `<div id="${id}" class="drk-${this.$options.name}" role="tooltip">  <div class="drk-${this.$options.name}-inner">${title}</div>  </div>`
      );
      if (!(tooltip instanceof HTMLElement)) {
        return;
      }
      this.tooltip = tooltip;
      on(tooltip, "toggled", (_event, toggled) => {
        if (!toggled) {
          return;
        }
        const update = () => this.positionAt(tooltip, this.$el);
        update();
        const [dir, align] = getAlignment(tooltip, this.$el, this.pos);
        this.origin = this.axis === "y" ? `${flipPosition(dir)}-${align}` : `${align}-${flipPosition(dir)}`;
        const handlers = [
          once(document, `keydown ${pointerDown}`, this.hide, false, (e) => {
            const outsidePointer = e.type === pointerDown && (!(e.target instanceof Node) || !this.$el.contains(e.target));
            const escapeKey = e.type === "keydown" && e instanceof KeyboardEvent && e.keyCode === keyMap.ESC;
            return outsidePointer || escapeKey;
          }),
          on([document, ...overflowParents(this.$el)], "scroll", update, {
            passive: true
          })
        ];
        once(tooltip, "hide", () => handlers.forEach((handler) => handler()), {
          self: true
        });
      });
      if (!await this.toggleElement(tooltip, true)) {
        this.hide();
      }
    }
  },
  events: {
    name: `focus ${pointerEnter} ${pointerDown}`,
    // Clicking a button does not give it focus on all browsers and platforms
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#clicking_and_focus
    handler(e) {
      if ((!isTouch(e) || e.type === pointerDown) && document.readyState !== "loading") {
        this.show();
      }
    }
  }
});
function makeFocusable(el) {
  if (!isFocusable(el)) {
    el.tabIndex = 0;
  }
}
function getAlignment(el, target, [dir, align]) {
  const elOffset = offset(el);
  const targetOffset = offset(target);
  const properties = [
    ["left", "right"],
    ["top", "bottom"]
  ];
  for (const props2 of properties) {
    if (elOffset[props2[0]] >= targetOffset[props2[1]]) {
      dir = props2[1];
      break;
    }
    if (elOffset[props2[1]] <= targetOffset[props2[0]]) {
      dir = props2[0];
      break;
    }
  }
  const props = dir === "left" || dir === "right" ? properties[1] : properties[0];
  align = props.find((prop) => elOffset[prop] === targetOffset[prop]) || "center";
  return [dir, align];
}
function parseProps(options) {
  const { el, id, data: data$1 } = options;
  const optionData = typeof data$1 === "object" && data$1 !== null && !Array.isArray(data$1) ? data$1 : {};
  const values = {
    ...parseOptions(data(el, id != null ? id : ""), ["title"]),
    ...optionData
  };
  for (const key of ["delay", "title"]) {
    if (!(key in values)) {
      values[key] = data(el, key);
    }
  }
  return {
    delay: Number(values.delay) || 0,
    title: values.title ? String(values.title) : ""
  };
}

export { tooltip as default };
