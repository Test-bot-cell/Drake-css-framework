import { includes, isString, startsWith, isEmpty, isArray, isObject } from '../util/lang.js';
import { trigger, createEvent } from '../util/event.js';
import { css } from '../util/style.js';
import { removeAttr, data, attr } from '../util/attr.js';
import { isTag, append } from '../util/dom.js';
import { parent, children } from '../util/filter.js';
import { escape, queryAll } from '../util/selector.js';
import { intersection } from '../api/observables.js';
import { defineComponent, parseOptions } from '../api/options.js';

var img = defineComponent()({
  args: "dataSrc",
  props: {
    dataSrc: String,
    sources: String,
    margin: String,
    target: String,
    loading: String
  },
  data: {
    dataSrc: "",
    sources: false,
    margin: "50%",
    target: false,
    loading: "lazy"
  },
  connected() {
    if (this.loading !== "lazy") {
      this.load();
    } else if (isImg(this.$el)) {
      this.$el.loading = "lazy";
      setSrcAttrs(this.$el);
    }
  },
  disconnected() {
    if (this.img) {
      this.img.onload = null;
    }
    delete this.img;
  },
  observe: intersection({
    handler(_entries, observer) {
      this.load();
      observer.disconnect();
    },
    options: ({ margin }) => ({ rootMargin: margin }),
    filter: ({ loading }) => loading === "lazy",
    target: ({ $el, $props }) => $props.target ? [$el, ...queryAll($props.target, $el)] : $el
  }),
  methods: {
    load() {
      if (this.img) {
        return this.img;
      }
      const image = isImg(this.$el) ? this.$el : getImageFromElement(this.$el, this.dataSrc, this.sources);
      removeAttr(image, "loading");
      setSrcAttrs(this.$el, image.currentSrc);
      return this.img = image;
    }
  }
});
function setSrcAttrs(el, src) {
  if (isImg(el)) {
    const parentNode = parent(el);
    const elements = isTag(parentNode, "picture") ? children(parentNode) : [el];
    elements.forEach((element) => setSourceProps(element, element));
  } else if (src) {
    const change = !includes(el.style.backgroundImage, src);
    if (change) {
      css(el, "backgroundImage", `url(${escape(src)})`);
      trigger(el, createEvent("load", false));
    }
  }
}
const srcProps = ["data-src", "data-srcset", "sizes"];
function setSourceProps(sourceEl, targetEl) {
  for (const prop of srcProps) {
    const value = data(sourceEl, prop);
    if (value) {
      attr(targetEl, prop.replace(/data-/g, ""), value);
    }
  }
}
function getImageFromElement(el, src, sources) {
  const img = new Image();
  wrapInPicture(img, sources);
  setSourceProps(el, img);
  img.onload = () => setSrcAttrs(el, img.currentSrc);
  img.src = src;
  return img;
}
function wrapInPicture(img, sources) {
  const parsedSources = parseSources(sources);
  if (parsedSources.length) {
    const picture = document.createElement("picture");
    for (const attrs of parsedSources) {
      const source = document.createElement("source");
      attr(source, attrs);
      append(picture, source);
    }
    append(picture, img);
  }
}
function parseSources(sources) {
  if (!sources) {
    return [];
  }
  let parsedSources = sources;
  if (isString(sources)) {
    if (startsWith(sources, "[")) {
      try {
        const parsed = JSON.parse(sources);
        parsedSources = isSourceInput(parsed) ? parsed : [];
      } catch {
        parsedSources = [];
      }
    } else {
      parsedSources = parseOptions(sources);
    }
  }
  const sourceList = isArray(parsedSources) ? parsedSources : [parsedSources];
  return sourceList.filter(isSourceAttributes).filter((source) => !isEmpty(source));
}
function isSourceInput(value) {
  return isSourceAttributes(value) || isArray(value) && value.every(isSourceAttributes);
}
function isSourceAttributes(value) {
  return isObject(value) && Object.values(value).every(
    (attribute) => attribute === null || ["string", "number", "boolean"].includes(typeof attribute)
  );
}
function isImg(el) {
  return isTag(el, "img");
}

export { img as default, wrapInPicture };
