import { uniqueBy, isElement, findIndex, assign } from '../util/lang.js';
import { on } from '../util/event.js';
import { isTag, $$, $ } from '../util/dom.js';
import { matches, parents } from '../util/filter.js';
import { defineComponent, parseOptions } from '../api/options.js';
import LightboxPanel from './lightbox-panel.js';

const selDisabled = ".drk-disabled *, .drk-disabled, [disabled]";
var lightbox = defineComponent()({
  install,
  props: { toggle: String },
  data: { toggle: "a" },
  computed: {
    toggles: ({ toggle }, $el) => $$(toggle, $el)
  },
  watch: {
    toggles(value) {
      const toggles = toHtmlElements(value);
      this.hide();
      for (const toggle of toggles) {
        if (isTag(toggle, "a")) {
          toggle.role = "button";
        }
      }
    }
  },
  disconnected() {
    this.hide();
  },
  events: {
    name: "click",
    delegate: ({ toggle }) => toggle,
    handler(e) {
      if (!e.defaultPrevented) {
        e.preventDefault();
        if (e.current instanceof HTMLElement && !matches(e.current, selDisabled)) {
          this.show(e.current);
        }
      }
    }
  },
  methods: {
    show(index = 0) {
      let items = this.toggles.map(toItem);
      if (this.nav === "thumbnav") {
        ensureThumb.call(this, this.toggles, items);
      }
      items = uniqueBy(items, "source");
      if (isElement(index)) {
        const { source } = toItem(index);
        index = findIndex(items, ({ source: src }) => source === src);
      }
      if (!this.panel) {
        const panel = this.$create("lightboxPanel", { ...this.$props, items });
        if (!isLightboxPanel(panel)) {
          return;
        }
        this.panel = panel;
      }
      on(this.panel.$el, "hidden", () => this.panel = null);
      return this.panel.show(index);
    },
    hide() {
      var _a;
      return (_a = this.panel) == null ? void 0 : _a.hide();
    }
  }
});
function install(Drake, Lightbox) {
  if (!Drake.lightboxPanel) {
    Drake.component("lightboxPanel", LightboxPanel);
  }
  const panelDefinition = Drake.component("lightboxPanel");
  const panelProps = typeof panelDefinition === "function" ? panelDefinition.options.props : panelDefinition.props;
  if (panelProps && !Array.isArray(panelProps)) {
    assign(Lightbox.props, panelProps);
  }
}
function ensureThumb(toggles, items) {
  for (const [i, toggle] of toggles.entries()) {
    const item = items[i];
    if (!item || item.thumb) {
      continue;
    }
    const parent = parents(toggle).reverse().concat(toggle).find(
      (parent2) => this.$el.contains(parent2) && (parent2 === toggle || $$(this.toggle, parent2).length === 1)
    );
    if (!parent) {
      continue;
    }
    const media = $("img,video", parent);
    if (media) {
      const isImage = media instanceof HTMLImageElement;
      item.thumb = media.currentSrc || (isImage ? "" : media.poster) || media.src;
      item.thumbRatio = (isImage ? media.naturalWidth : media.videoWidth) / (isImage ? media.naturalHeight : media.videoHeight);
    }
  }
}
function toItem(el) {
  const item = {};
  for (const attribute of el.getAttributeNames()) {
    const key = attribute.replace(/^data-/, "");
    item[key === "href" ? "source" : key] = el.getAttribute(attribute);
  }
  item.attrs = parseOptions(item.attrs);
  return item;
}
function isLightboxPanel(value) {
  return typeof value === "object" && value !== null && "$el" in value && value.$el instanceof HTMLElement && "show" in value && typeof value.show === "function" && "hide" in value && typeof value.hide === "function";
}
function toHtmlElements(value) {
  return Array.isArray(value) ? value.filter((item) => item instanceof HTMLElement) : [];
}

export { lightbox as default };
