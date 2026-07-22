import { toFloat, includes, toNodes, isElement, memoize } from '../util/lang.js';
import { attr } from '../util/attr.js';
import { isVoidElement } from '../util/filter.js';
import { remove, isTag, after, append, fragment } from '../util/dom.js';
import { defineMixin } from '../api/options.js';

var Svg = defineMixin()({
  args: "src",
  props: {
    width: Number,
    height: Number,
    ratio: Number
  },
  data: {
    ratio: 1
  },
  connected() {
    this.svg = this.getSvg().then(
      (el) => {
        if (!this._connected || !el) {
          return;
        }
        const svg = insertSVG(el, this.$el);
        if (this.svgEl && svg !== this.svgEl) {
          remove(this.svgEl);
        }
        applyWidthAndHeight.call(this, svg, el);
        return this.svgEl = svg;
      },
      () => void 0
    );
  },
  disconnected() {
    var _a;
    (_a = this.svg) == null ? void 0 : _a.then((svg) => {
      if (this._connected) {
        return;
      }
      if (isVoidElement(this.$el)) {
        this.$el.hidden = false;
      }
      remove(svg);
      this.svgEl = null;
    });
    this.svg = null;
  },
  methods: {
    async getSvg() {
      return void 0;
    }
  }
});
function insertSVG(el, root) {
  if (isVoidElement(root) || isTag(root, "canvas")) {
    root.hidden = true;
    const next = root.nextElementSibling;
    if (equals(el, next) && next) {
      return next;
    }
    after(root, el);
    return el;
  }
  const last = root.lastElementChild;
  if (equals(el, last) && last) {
    return last;
  }
  append(root, el);
  return el;
}
function equals(el, other) {
  return isTag(el, "svg") && isTag(other, "svg") && el.innerHTML === (other == null ? void 0 : other.innerHTML);
}
function applyWidthAndHeight(el, ref) {
  const props = ["width", "height"];
  let dimensions = [this.width, this.height];
  if (!dimensions.some((val) => val)) {
    dimensions = props.map((prop) => attr(ref, prop));
  }
  const viewBox = attr(ref, "viewBox");
  if (viewBox && !dimensions.some((val) => val)) {
    dimensions = viewBox.split(" ").slice(2);
  }
  dimensions.forEach((val, i) => {
    const prop = props[i];
    if (prop) {
      attr(el, prop, toFloat(val) * this.ratio || null);
    }
  });
}
function parseSVG(svg, icon) {
  if (icon && includes(svg, "<symbol")) {
    svg = parseSymbols(svg)[icon] || svg;
  }
  return toNodes(fragment(svg)).filter(isElement)[0];
}
const symbolRe = /<symbol([^]*?id=(['"])(.+?)\2[^]*?<\/)symbol>/g;
const parseSymbols = memoize(function(svg) {
  const symbols = {};
  let match;
  while (match = symbolRe.exec(svg)) {
    const id = match[3];
    const content = match[1];
    if (id && content) {
      symbols[id] = `<svg ${content}svg>`;
    }
  }
  return symbols;
});

export { Svg as default, parseSVG };
