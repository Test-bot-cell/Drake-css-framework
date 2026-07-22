import { hasClass, removeClass, addClass } from '../util/class.js';
import { css } from '../util/style.js';
import { offset } from '../util/dimensions.js';
import { $$ } from '../util/dom.js';
import { defineComponent } from '../api/options.js';
import { awaitTimeout } from '../util/await.js';
import { active } from './drop.js';
import Dropnav from './dropnav.js';

const clsNavbarTransparent = "drk-navbar-transparent";
var navbar = defineComponent()({
  extends: Dropnav,
  props: {
    dropbarTransparentMode: Boolean
  },
  data: {
    flip: false,
    autoUpdate: false,
    delayShow: 200,
    clsDrop: "drk-navbar-dropdown",
    selNavItem: ".drk-navbar-nav > li > a,a.drk-navbar-item,button.drk-navbar-item,.drk-navbar-item a,.drk-navbar-item button,.drk-navbar-toggle",
    // Simplify with :where() selector once browser target is Safari 14+
    dropbarTransparentMode: false
  },
  computed: {
    navbarContainer: (_props, $el) => $el.closest(".drk-navbar-container")
  },
  watch: {
    items() {
      const justify = hasClass(this.$el, "drk-navbar-justify");
      const containers = $$(".drk-navbar-nav, .drk-navbar-left, .drk-navbar-right", this.$el);
      for (const container of containers) {
        const items = justify ? $$(
          ".drk-navbar-nav > li > a, .drk-navbar-item, .drk-navbar-toggle",
          container
        ).length : "";
        css(container, "flexGrow", items);
      }
    }
  },
  events: [
    {
      name: "show",
      el: ({ dropContainer }) => dropContainer,
      handler({ target }) {
        if (target && this.getTransparentMode(target) === "remove" && hasClass(this.navbarContainer, clsNavbarTransparent)) {
          removeClass(this.navbarContainer, clsNavbarTransparent);
          this._transparent = true;
        }
      }
    },
    {
      name: "hide",
      el: ({ dropContainer }) => dropContainer,
      async handler() {
        await awaitTimeout(0);
        if (this._transparent && (!active || !this.dropContainer.contains(active.$el))) {
          addClass(this.navbarContainer, clsNavbarTransparent);
          this._transparent = null;
        }
      }
    }
  ],
  methods: {
    getTransparentMode(el) {
      if (!this.navbarContainer) {
        return;
      }
      if (this.dropbar && this.isDropbarDrop(el)) {
        return this.dropbarTransparentMode;
      }
      const drop = this.getDropdown(el);
      if (drop && hasClass(el, "drk-dropbar")) {
        return drop.inset ? "behind" : "remove";
      }
    },
    getDropbarOffset(offsetTop) {
      const { top, height } = offset(this.navbarContainer);
      return top + (this.dropbarTransparentMode === "behind" ? 0 : height + offsetTop);
    }
  }
});

export { navbar as default };
