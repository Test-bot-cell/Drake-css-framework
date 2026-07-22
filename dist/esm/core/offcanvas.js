import { hasClass, addClass, removeClass } from '../util/class.js';
import { endsWith } from '../util/lang.js';
import { parent, isVisible } from '../util/filter.js';
import { css } from '../util/style.js';
import { height } from '../util/dimensions.js';
import { wrapAll, unwrap, $ } from '../util/dom.js';
import { swipe } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Modal from '../mixin/modal.js';

var offcanvas = defineComponent()({
  mixins: [Modal],
  args: "mode",
  props: {
    mode: String,
    flip: Boolean,
    overlay: Boolean,
    swiping: Boolean
  },
  data: {
    mode: "slide",
    flip: false,
    overlay: false,
    clsPage: "drk-offcanvas-page",
    clsContainer: "drk-offcanvas-container",
    selPanel: ".drk-offcanvas-bar",
    clsFlip: "drk-offcanvas-flip",
    clsContainerAnimation: "drk-offcanvas-container-animation",
    clsSidebarAnimation: "drk-offcanvas-bar-animation",
    clsMode: "drk-offcanvas",
    clsOverlay: "drk-offcanvas-overlay",
    selClose: ".drk-offcanvas-close",
    container: false,
    swiping: true
  },
  computed: {
    clsFlip: ({ flip, clsFlip }) => flip ? clsFlip : "",
    clsOverlay: ({ overlay, clsOverlay }) => overlay ? clsOverlay : "",
    clsMode: ({ mode, clsMode }) => `${clsMode}-${mode}`,
    clsSidebarAnimation: ({ mode, clsSidebarAnimation }) => mode === "none" || mode === "reveal" ? "" : clsSidebarAnimation,
    clsContainerAnimation: ({ mode, clsContainerAnimation }) => mode !== "push" && mode !== "reveal" ? "" : clsContainerAnimation,
    transitionElement({ mode }) {
      return mode === "reveal" ? parent(this.panel) : this.panel;
    }
  },
  observe: swipe({ filter: ({ swiping }) => swiping }),
  update: {
    read() {
      if (this.isToggled() && !isVisible(this.$el)) {
        this.hide();
      }
    },
    events: ["resize"]
  },
  events: [
    {
      name: "touchmove",
      self: true,
      passive: false,
      filter: ({ overlay }) => overlay,
      handler(e) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    },
    {
      name: "show",
      self: true,
      handler() {
        if (this.mode === "reveal" && !hasClass(parent(this.panel), this.clsMode)) {
          addClass(wrapAll(this.panel, "<div>"), this.clsMode);
        }
        const { body, scrollingElement } = document;
        addClass(body, this.clsContainer, this.clsFlip);
        css(body, "touchAction", "pan-y pinch-zoom");
        css(this.$el, "display", "block");
        css(
          this.panel,
          "maxWidth",
          (scrollingElement != null ? scrollingElement : document.documentElement).clientWidth
        );
        addClass(this.$el, this.clsOverlay);
        addClass(
          this.panel,
          this.clsSidebarAnimation,
          this.mode === "reveal" ? "" : this.clsMode
        );
        height(body);
        addClass(body, this.clsContainerAnimation);
        if (this.clsContainerAnimation) {
          suppressUserScale();
        }
      }
    },
    {
      name: "hide",
      self: true,
      handler() {
        removeClass(document.body, this.clsContainerAnimation);
        css(document.body, "touchAction", "");
      }
    },
    {
      name: "hidden",
      self: true,
      handler() {
        if (this.clsContainerAnimation) {
          resumeUserScale();
        }
        if (this.mode === "reveal" && hasClass(parent(this.panel), this.clsMode)) {
          unwrap(this.panel);
        }
        removeClass(this.panel, this.clsSidebarAnimation, this.clsMode);
        removeClass(this.$el, this.clsOverlay);
        css(this.$el, "display", "");
        css(this.panel, "maxWidth", "");
        removeClass(document.body, this.clsContainer, this.clsFlip);
      }
    },
    {
      name: "swipeLeft swipeRight",
      handler(e) {
        if (this.isToggled() && endsWith(e.type, "Left") !== this.flip) {
          this.hide();
        }
      }
    }
  ]
});
function suppressUserScale() {
  getViewport().content += ",user-scalable=0";
}
function resumeUserScale() {
  const viewport = getViewport();
  viewport.content = viewport.content.replace(/,user-scalable=0$/, "");
}
function getViewport() {
  const existing = $('meta[name="viewport"]', document.head);
  if (existing) {
    return existing;
  }
  const viewport = document.createElement("meta");
  viewport.name = "viewport";
  document.head.append(viewport);
  return viewport;
}

export { offcanvas as default };
