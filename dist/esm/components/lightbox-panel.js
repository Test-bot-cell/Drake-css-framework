import { Transition } from '../util/animation.js';
import { attr } from '../util/attr.js';
import { removeClass, addClass, toggleClass } from '../util/class.js';
import { html, $$, $, isTag, fragment, remove, append, wrapAll } from '../util/dom.js';
import { trigger, on } from '../util/event.js';
import { getIndex } from '../util/lang.js';
import { pointerMove, pointerDown } from '../util/env.js';
import { parent, matches } from '../util/filter.js';
import { defineComponent } from '../api/options.js';
import { wrapInPicture } from '../core/img.js';
import Modal from '../mixin/modal.js';
import Slideshow from '../mixin/slideshow.js';
import { keyMap } from '../util/keys.js';
import Animations from './internal/lightbox-animations.js';

var LightboxPanel = defineComponent()({
  i18n: {
    counter: "%s / %s"
  },
  mixins: [Modal, Slideshow],
  functional: true,
  props: {
    counter: Boolean,
    preload: Number,
    nav: Boolean,
    slidenav: Boolean,
    delayControls: Number,
    videoAutoplay: Boolean,
    template: String
  },
  data: () => ({
    counter: false,
    preload: 1,
    nav: false,
    slidenav: true,
    delayControls: 3e3,
    videoAutoplay: false,
    items: [],
    cls: "drk-open",
    clsPage: "drk-lightbox-page",
    clsFit: "drk-lightbox-items-fit",
    clsZoom: "drk-lightbox-zoom",
    attrItem: "drk-lightbox-item",
    selList: ".drk-lightbox-items",
    selClose: ".drk-close-large",
    selNav: ".drk-lightbox-thumbnav, .drk-lightbox-dotnav",
    selCaption: ".drk-lightbox-caption",
    selCounter: ".drk-lightbox-counter",
    pauseOnHover: false,
    velocity: 2,
    Animations,
    template: `<div class="drk-lightbox drk-overflow-hidden">  <div class="drk-lightbox-items"></div>  <div class="drk-position-top-right drk-position-small drk-transition-fade" drk-inverse>  <button class="drk-lightbox-close drk-close-large" type="button" drk-close></button>  </div>  <div class="drk-lightbox-slidenav drk-position-center-left drk-position-medium drk-transition-fade" drk-inverse>  <a href drk-slidenav-previous drk-lightbox-item="previous"></a>  </div>  <div class="drk-lightbox-slidenav drk-position-center-right drk-position-medium drk-transition-fade" drk-inverse>  <a href drk-slidenav-next drk-lightbox-item="next"></a>  </div>  <div class="drk-position-center-right drk-position-medium drk-transition-fade" drk-inverse style="max-height: 90vh; overflow: auto;">  <ul class="drk-lightbox-thumbnav drk-lightbox-thumbnav-vertical drk-thumbnav drk-thumbnav-vertical"></ul>  <ul class="drk-lightbox-dotnav drk-dotnav drk-dotnav-vertical"></ul>  </div>  <div class="drk-lightbox-counter drk-text-large drk-position-top-left drk-position-small drk-transition-fade" drk-inverse></div>  <div class="drk-lightbox-caption drk-position-bottom drk-text-center drk-transition-slide-bottom drk-transition-opaque"></div>  </div>`
  }),
  created() {
    var _a;
    let $el = $(this.template);
    if (!$el) {
      return;
    }
    if (isTag($el, "template")) {
      $el = firstHtmlElement(fragment((_a = html($el)) != null ? _a : ""));
    }
    if (!$el) {
      return;
    }
    const list = $(this.selList, $el);
    if (!list) {
      return;
    }
    const navType = this.$props.nav;
    remove($$(this.selNav, $el).filter((el) => !matches(el, `.drk-${navType}`)));
    for (const [i, item] of this.items.entries()) {
      append(list, "<div>");
      if (navType === "thumbnav") {
        const nav = $(this.selNav, $el);
        const navItem = nav ? append(nav, `<li drk-lightbox-item="${i}"><a href></a></li>`) : void 0;
        if (navItem instanceof Element) {
          wrapAll(toThumbnavItem(item, this.videoAutoplay), navItem);
        }
      }
    }
    if (!this.slidenav) {
      remove($$(".drk-lightbox-slidenav", $el));
    }
    if (!this.counter) {
      remove($(this.selCounter, $el));
    }
    addClass(list, this.clsFit);
    const close = $("[drk-close]", $el);
    const closeLabel = this.t("close");
    if (close && closeLabel) {
      close.dataset.i18n = JSON.stringify({ label: closeLabel });
    }
    append(this.container, $el);
    this.$mount($el);
  },
  events: [
    {
      name: "click",
      self: true,
      filter: ({ bgClose }) => bgClose,
      delegate: ({ selList }) => `${selList} > *`,
      handler(e) {
        if (!e.defaultPrevented) {
          this.hide();
        }
      }
    },
    {
      name: "click",
      self: true,
      delegate: ({ clsZoom }) => `.${clsZoom}`,
      handler(e) {
        if (!e.defaultPrevented) {
          toggleClass(this.list, this.clsFit);
        }
      }
    },
    {
      name: `${pointerMove} ${pointerDown} keydown`,
      filter: ({ delayControls }) => Boolean(delayControls),
      handler() {
        this.showControls();
      }
    },
    {
      name: "shown",
      self: true,
      handler() {
        this.showControls();
      }
    },
    {
      name: "hide",
      self: true,
      handler() {
        this.hideControls();
        removeClass(this.slides, this.clsActive);
        Transition.stop(this.slides);
      }
    },
    {
      name: "hidden",
      self: true,
      handler() {
        this.$destroy(true);
      }
    },
    {
      name: "keyup",
      el: () => document,
      handler(event) {
        if (!this.isToggled() || !this.draggable) {
          return;
        }
        if (!(event instanceof KeyboardEvent)) {
          return;
        }
        const { keyCode } = event;
        let index;
        if (keyCode === keyMap.LEFT) {
          index = "previous";
        } else if (keyCode === keyMap.RIGHT) {
          index = "next";
        } else if (keyCode === keyMap.HOME) {
          index = 0;
        } else if (keyCode === keyMap.END) {
          index = "last";
        }
        if (index !== void 0) {
          void this.show(index);
        }
      }
    },
    {
      name: "beforeitemshow",
      handler(e) {
        html($(this.selCaption, this.$el), this.getItem().caption || "");
        html(
          $(this.selCounter, this.$el),
          this.t("counter", this.index + 1, this.slides.length)
        );
        for (let j = -this.preload; j <= this.preload; j++) {
          this.loadItem(this.index + j);
        }
        if (this.isToggled()) {
          return;
        }
        this.draggable = false;
        e.preventDefault();
        this.toggleElement(this.$el, true, false);
        this.animation = Animations.scale;
        if (e.target instanceof Element) {
          removeClass(e.target, this.clsActive);
        }
        this.stack.splice(1, 0, this.index);
      }
    },
    {
      name: "itemshown",
      handler() {
        this.draggable = this.$props.draggable;
      }
    },
    {
      name: "itemload",
      async handler(_event, value) {
        var _a, _b, _c;
        if (!isLightboxItem(value)) {
          return;
        }
        const item = value;
        const { source: src, type } = item;
        const attrs = toAttributes(item.attrs);
        this.setItem(item, "<span drk-spinner drk-inverse></span>");
        if (!src) {
          return;
        }
        let matches2;
        const iframeAttrs = {
          allowfullscreen: "",
          style: "max-width: 100%; box-sizing: border-box;",
          "drk-responsive": "",
          "drk-video": Boolean(this.videoAutoplay)
        };
        if (type === "image" || isImage(src)) {
          const img = createEl("img");
          wrapInPicture(img, (_a = item.sources) != null ? _a : false);
          attr(img, {
            src,
            ...getImageAttributes(item),
            ...attrs
          });
          on(img, "load", () => this.setItem(item, parent(img) || img));
          on(img, "error", () => this.setError(item));
        } else if (type === "video" || isVideo(src)) {
          const inline = this.videoAutoplay === "inline";
          const video = createEl("video", {
            src,
            playsinline: "",
            controls: inline ? null : "",
            loop: inline ? "" : null,
            muted: inline ? "" : null,
            poster: this.videoAutoplay ? null : (_b = item.poster) != null ? _b : null,
            "drk-video": Boolean(this.videoAutoplay),
            ...attrs
          });
          on(video, "loadedmetadata", () => this.setItem(item, video));
          on(video, "error", () => this.setError(item));
        } else if (type === "iframe" || src.match(/\.(html|php)($|\?)/i)) {
          this.setItem(
            item,
            createEl("iframe", {
              src,
              allowfullscreen: "",
              class: "drk-lightbox-iframe",
              ...attrs
            })
          );
        } else if (matches2 = src.match(
          /\/\/(?:.*?youtube(-nocookie)?\..*?(?:[?&]v=|\/shorts\/)|youtu\.be\/)([\w-]{11})[&?]?(.*)?/
        )) {
          this.setItem(
            item,
            createEl("iframe", {
              src: `https://www.youtube${matches2[1] || ""}.com/embed/${(_c = matches2[2]) != null ? _c : ""}${matches2[3] ? `?${matches2[3]}` : ""}`,
              width: 1920,
              height: 1080,
              ...iframeAttrs,
              ...attrs
            })
          );
        } else if (matches2 = src.match(/\/\/.*?vimeo\.[a-z]+\/(\d+)[&?]?(.*)?/)) {
          try {
            const response = await fetch(
              `https://vimeo.com/api/oembed.json?maxwidth=1920&url=${encodeURI(src)}`,
              { credentials: "omit" }
            );
            const metadata = await response.json();
            if (!isMediaDimensions(metadata)) {
              throw new TypeError("Invalid Vimeo oEmbed dimensions");
            }
            const { height, width } = metadata;
            this.setItem(
              item,
              createEl("iframe", {
                src: `https://player.vimeo.com/video/${matches2[1]}${matches2[2] ? `?${matches2[2]}` : ""}`,
                width,
                height,
                ...iframeAttrs,
                ...attrs
              })
            );
          } catch {
            this.setError(item);
          }
        }
      }
    },
    {
      name: "itemloaded",
      handler() {
        this.$emit("resize");
      }
    }
  ],
  update: {
    read() {
      for (const media of $$(
        `${this.selList} :not([controls]):is(img,video)`,
        this.$el
      )) {
        const isImage2 = media instanceof HTMLImageElement;
        toggleClass(
          media,
          this.clsZoom,
          (isImage2 ? media.naturalHeight : media.videoHeight) - this.$el.offsetHeight > Math.max(
            0,
            (isImage2 ? media.naturalWidth : media.videoWidth) - this.$el.offsetWidth
          )
        );
      }
    },
    events: ["resize"]
  },
  methods: {
    loadItem(index = this.index) {
      const item = this.getItem(index);
      if (!this.getSlide(item).childElementCount) {
        trigger(this.$el, "itemload", [item]);
      }
    },
    getItem(index = this.index) {
      const item = this.items[getIndex(index, this.slides)];
      if (!item) {
        throw new RangeError("Lightbox item index is out of range");
      }
      return item;
    },
    setItem(item, content) {
      trigger(this.$el, "itemloaded", [this, html(this.getSlide(item), content)]);
    },
    getSlide(item) {
      const slide = this.slides[this.items.indexOf(item)];
      if (!slide) {
        throw new RangeError("Lightbox slide is missing");
      }
      return slide;
    },
    setError(item) {
      this.setItem(item, '<span drk-icon="icon: bolt; ratio: 2" drk-inverse></span>');
    },
    showControls() {
      clearTimeout(this.controlsTimer);
      this.controlsTimer = this.delayControls ? setTimeout(this.hideControls, this.delayControls) : void 0;
      addClass(this.$el, "drk-active", "drk-transition-active");
    },
    hideControls() {
      removeClass(this.$el, "drk-active", "drk-transition-active");
    }
  }
});
function createEl(tag, attrs = {}) {
  const el = document.createElement(tag);
  attr(el, attrs);
  return el;
}
function toThumbnavItem(item, videoAutoplay) {
  const el = item.poster || item.thumb && (item.type === "image" || isImage(item.thumb)) ? createEl("img", { src: item.poster || item.thumb || "", alt: "" }) : item.thumb && (item.type === "video" || isVideo(item.thumb)) ? createEl("video", {
    src: item.thumb,
    loop: "",
    playsinline: "",
    muted: "",
    "drk-video": videoAutoplay === "inline"
  }) : createEl("canvas");
  if (item.thumbRatio) {
    el.style.aspectRatio = String(item.thumbRatio);
  }
  return el;
}
function isImage(src) {
  return Boolean(src == null ? void 0 : src.match(/\.(avif|jpe?g|jfif|a?png|gif|svg|webp)($|\?)/i));
}
function isVideo(src) {
  return Boolean(src == null ? void 0 : src.match(/\.(mp4|webm|ogv)($|\?)/i));
}
function firstHtmlElement(value) {
  if (value instanceof HTMLElement) {
    return value;
  }
  return Array.isArray(value) ? value.find((node) => node instanceof HTMLElement) : void 0;
}
function isLightboxItem(value) {
  if (!isRecord(value)) {
    return false;
  }
  return (value.source === void 0 || typeof value.source === "string") && (value.type === void 0 || typeof value.type === "string") && (value.attrs === void 0 || isAttributes(value.attrs));
}
function toAttributes(value) {
  if (!isRecord(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry) => isAttributeValue(entry[1])
    )
  );
}
function isAttributes(value) {
  return isRecord(value) && Object.values(value).every(isAttributeValue);
}
function isAttributeValue(value) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}
function getImageAttributes(item) {
  return toAttributes({ alt: item.alt, srcset: item.srcset, sizes: item.sizes });
}
function isMediaDimensions(value) {
  return isRecord(value) && typeof value.width === "number" && typeof value.height === "number";
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}

export { LightboxPanel as default };
