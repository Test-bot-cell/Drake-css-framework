import { addClass, removeClass, hasClass } from '../util/class.js';
import { hyphenate } from '../util/lang.js';
import { attr, hasAttr } from '../util/attr.js';
import { css } from '../util/style.js';
import { isTag } from '../util/dom.js';
import I18n from '../mixin/i18n.js';

const iconNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const Icon = {
  args: "icon",
  props: {
    icon: String,
    width: Number,
    height: Number,
    ratio: Number
  },
  data: {
    ratio: 1
  },
  isIcon: true,
  beforeConnect() {
    addClass(this.$el, "drk-icon", "drk-ti");
  },
  connected() {
    const icon = normalizeIconName(this.icon);
    if (!icon) {
      return;
    }
    this._iconClasses = [`drk-ti-${icon}`, `drk-icon-alias-${icon}`];
    addClass(this.$el, this._iconClasses);
    setDimensions(this);
    hideDecorativeIcon(this);
  },
  disconnected() {
    removeClass(this.$el, this._iconClasses);
    css(this.$el, {
      "--drk-icon-ratio": "",
      "--drk-icon-width": "",
      "--drk-icon-height": ""
    });
    if (this._iconAddedAriaHidden) {
      attr(this.$el, "aria-hidden", null);
    }
    this._iconAddedAriaHidden = void 0;
    this._iconClasses = void 0;
  }
};
const IconComponent = {
  args: false,
  extends: Icon,
  data: (instance) => ({
    icon: hyphenate(instance.constructor.options.name || "")
  }),
  beforeConnect() {
    addClass(this.$el, String(this.$options.id || ""));
  }
};
const NavParentIcon = {
  extends: IconComponent,
  beforeConnect() {
    const icon = readIconProp(this);
    this.icon = this.$el.closest(".drk-nav-primary") ? `${icon}-large` : icon;
  }
};
const Search = {
  extends: IconComponent,
  mixins: [I18n],
  i18n: { toggle: "Open Search", submit: "Submit Search" },
  beforeConnect() {
    const isToggle = hasClass(this.$el, "drk-search-toggle") || hasClass(this.$el, "drk-navbar-toggle");
    this.icon = isToggle ? "search-toggle-icon" : hasClass(this.$el, "drk-search-icon") && this.$el.closest(".drk-search-large") ? "search-large" : this.$el.closest(".drk-search-medium") ? "search-medium" : readIconProp(this);
    if (hasAttr(this.$el, "aria-label")) {
      return;
    }
    if (isToggle) {
      attr(this.$el, "aria-label", this.t("toggle"));
      return;
    }
    const button = this.$el.closest("a,button");
    if (button && !hasAttr(button, "aria-label")) {
      attr(button, "aria-label", this.t("submit"));
    }
  }
};
const Spinner = {
  extends: IconComponent,
  mixins: [I18n],
  i18n: { label: "Loading" },
  beforeConnect() {
    attr(this.$el, "role", "status");
    if (!hasAttr(this.$el, "aria-label")) {
      attr(this.$el, "aria-label", this.t("label"));
    }
  }
};
const ButtonComponent = {
  extends: IconComponent,
  mixins: [I18n],
  beforeConnect() {
    const button = this.$el.closest("a,button");
    if (!button) {
      return;
    }
    attr(
      button,
      "role",
      this.role !== null && isTag(button, "a") ? "button" : this.role || null
    );
    const label = this.t("label");
    if (label && !hasAttr(button, "aria-label")) {
      attr(button, "aria-label", label);
    }
  }
};
const Slidenav = {
  extends: ButtonComponent,
  beforeConnect() {
    addClass(this.$el, "drk-slidenav");
    const icon = readIconProp(this);
    this.icon = hasClass(this.$el, "drk-slidenav-large") ? `${icon}-large` : icon;
  }
};
const NavbarToggleIcon = {
  extends: ButtonComponent,
  i18n: { label: "Open menu" },
  beforeConnect() {
    const button = this.$el.closest("a,button");
    if (button && !hasAttr(button, "aria-expanded")) {
      attr(button, "aria-expanded", "false");
    }
  }
};
const Close = {
  extends: ButtonComponent,
  i18n: { label: "Close" },
  beforeConnect() {
    this.icon = `close-${hasClass(this.$el, "drk-close-large") ? "large" : "icon"}`;
  }
};
const Marker = {
  extends: ButtonComponent,
  i18n: { label: "Open" }
};
const Totop = {
  extends: ButtonComponent,
  i18n: { label: "Back to top" }
};
const PaginationNext = {
  extends: ButtonComponent,
  i18n: { label: "Next page" },
  data: { role: null }
};
const PaginationPrevious = {
  extends: ButtonComponent,
  i18n: { label: "Previous page" },
  data: { role: null }
};
function normalizeIconName(icon) {
  const name = icon == null ? void 0 : icon.trim();
  return name && iconNamePattern.test(name) ? name : void 0;
}
function readIconProp(instance) {
  const icon = instance.$props.icon;
  return typeof icon === "string" ? icon : "";
}
function setDimensions(instance) {
  const ratio = positiveNumber(instance.ratio) || 1;
  css(instance.$el, "--drk-icon-ratio", ratio);
  const width = positiveNumber(instance.width);
  if (width) {
    css(instance.$el, "--drk-icon-width", `${width}px`);
  }
  const height = positiveNumber(instance.height);
  if (height) {
    css(instance.$el, "--drk-icon-height", `${height}px`);
  }
}
function hideDecorativeIcon(instance) {
  var _a;
  const role = (_a = attr(instance.$el, "role")) == null ? void 0 : _a.toLowerCase();
  const hasAccessibleName = hasAttr(instance.$el, "aria-label") || hasAttr(instance.$el, "aria-labelledby");
  if (!hasAccessibleName && role !== "status" && role !== "img" && !hasAttr(instance.$el, "aria-hidden")) {
    attr(instance.$el, "aria-hidden", "true");
    instance._iconAddedAriaHidden = true;
  }
}
function positiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}

export { Close, IconComponent, Marker, NavParentIcon, NavbarToggleIcon, PaginationNext, PaginationPrevious, Search, Slidenav, Spinner, Totop, Icon as default };
