import { toggleClass, addClass, hasClass } from '../util/class.js';
import { sumBy, toFloat } from '../util/lang.js';
import { isRtl } from '../util/env.js';
import { css } from '../util/style.js';
import { toPx } from '../util/dimensions.js';
import { scrolledOver } from '../util/viewport.js';
import { scroll } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import Margin from './margin.js';

var grid = defineComponent()({
  extends: Margin,
  mixins: [Class],
  name: "grid",
  props: {
    masonry: Boolean,
    parallax: String,
    parallaxStart: String,
    parallaxEnd: String,
    parallaxJustify: Boolean
  },
  data: {
    margin: "drk-grid-margin",
    clsStack: "drk-grid-stack",
    masonry: false,
    parallax: 0,
    parallaxStart: 0,
    parallaxEnd: 0,
    parallaxJustify: false
  },
  connected() {
    if (this.masonry) {
      addClass(this.$el, "drk-flex-top", "drk-flex-wrap-top");
    }
  },
  observe: scroll({
    filter: ({ parallax, parallaxJustify }) => Boolean(parallax || parallaxJustify)
  }),
  update: [
    {
      write({ rows }) {
        toggleClass(this.$el, this.clsStack, !rows.some((row) => row.length > 1));
      },
      events: ["resize"]
    },
    {
      read(data) {
        var _a, _b;
        const { rows } = data;
        const { masonry, parallaxJustify, margin } = this;
        let parallax = Math.max(0, toPx(this.parallax));
        if (!(masonry || parallax || parallaxJustify) || positionedAbsolute(rows) || ((_b = (_a = rows[0]) == null ? void 0 : _a.some(
          (el, i) => rows.some((row) => row[i] && row[i].offsetWidth !== el.offsetWidth)
        )) != null ? _b : false)) {
          return data.translates = data.scrollColumns = false;
        }
        const gutter = getGutter(rows, margin);
        let columns;
        let translates;
        if (masonry) {
          [columns, translates] = applyMasonry(rows, gutter, masonry === "next");
        } else {
          columns = transpose(rows);
        }
        const columnHeights = columns.map(
          (column) => sumBy(column, "offsetHeight") + gutter * (column.length - 1)
        );
        const height = Math.max(0, ...columnHeights);
        let scrollColumns;
        let parallaxStart;
        let parallaxEnd;
        if (parallax || parallaxJustify) {
          scrollColumns = columnHeights.map(
            (hgt, i) => parallaxJustify ? height - hgt + parallax : parallax / (i % 2 || 8)
          );
          if (!parallaxJustify) {
            parallax = Math.max(
              ...columnHeights.map(
                (hgt, i) => {
                  var _a2;
                  return hgt + ((_a2 = scrollColumns == null ? void 0 : scrollColumns[i]) != null ? _a2 : 0) - height;
                }
              )
            );
          }
          parallaxStart = toPx(this.parallaxStart, "height", this.$el, true);
          parallaxEnd = toPx(this.parallaxEnd, "height", this.$el, true);
        }
        return {
          columns,
          translates,
          scrollColumns,
          parallaxStart,
          parallaxEnd,
          padding: parallax,
          height: translates ? height : ""
        };
      },
      write({ height, padding }) {
        css(this.$el, "paddingBottom", padding || "");
        if (height !== false) {
          css(this.$el, "height", height);
        }
      },
      events: ["resize"]
    },
    {
      read({ rows, scrollColumns, parallaxStart, parallaxEnd }) {
        return {
          scrolled: scrollColumns && !positionedAbsolute(rows) ? scrolledOver(this.$el, parallaxStart, parallaxEnd) : false
        };
      },
      write({ columns, scrolled, scrollColumns, translates }) {
        if (!scrolled && !translates || !columns) {
          return;
        }
        columns.forEach(
          (column, i) => column.forEach((el, j) => {
            var _a, _b;
            const [x, initialY] = translates && ((_a = translates[i]) == null ? void 0 : _a[j]) || [0, 0];
            let y = initialY;
            if (scrolled && scrollColumns) {
              y += scrolled * ((_b = scrollColumns[i]) != null ? _b : 0);
            }
            css(el, "transform", `translate(${x}px, ${y}px)`);
          })
        );
      },
      events: ["scroll", "resize"]
    }
  ]
});
function positionedAbsolute(rows) {
  return rows.flat().some((el) => css(el, "position") === "absolute");
}
function applyMasonry(rows, gutter, next) {
  var _a, _b, _c, _d;
  const columns = [];
  const translates = [];
  const columnHeights = Array((_b = (_a = rows[0]) == null ? void 0 : _a.length) != null ? _b : 0).fill(0);
  let rowHeights = 0;
  for (const row of rows) {
    const cells = isRtl ? row.slice().reverse() : row;
    let height = 0;
    for (const [j, cell] of cells.entries()) {
      const { offsetWidth, offsetHeight } = cell;
      const index = next ? j : columnHeights.indexOf(Math.min(...columnHeights));
      push(columns, index, cell);
      push(translates, index, [
        (index - j) * offsetWidth * (isRtl ? -1 : 1),
        ((_c = columnHeights[index]) != null ? _c : 0) - rowHeights
      ]);
      columnHeights[index] = ((_d = columnHeights[index]) != null ? _d : 0) + offsetHeight + gutter;
      height = Math.max(height, offsetHeight);
    }
    rowHeights += height + gutter;
  }
  return [columns, translates];
}
function getGutter(rows, cls) {
  var _a;
  const node = rows.flat().find((el) => hasClass(el, cls));
  return toFloat(node ? css(node, "marginTop") : css((_a = rows[0]) == null ? void 0 : _a[0], "paddingLeft"));
}
function transpose(rows) {
  const columns = [];
  for (const row of rows) {
    for (const [index, element] of row.entries()) {
      push(columns, index, element);
    }
  }
  return columns;
}
function push(array, index, value) {
  var _a;
  if (!array[index]) {
    array[index] = [];
  }
  (_a = array[index]) == null ? void 0 : _a.push(value);
}

export { grid as default };
