import { toggleClass, hasClass } from '../util/class.js';
import { trigger } from '../util/event.js';
import { includes, isUndefined, isEmpty, isEqual, isNumeric } from '../util/lang.js';
import { css } from '../util/style.js';
import { data } from '../util/attr.js';
import { $$, isTag, $, append } from '../util/dom.js';
import { fastdom } from '../util/fastdom.js';
import { children, matches } from '../util/filter.js';
import { defineComponent, parseOptions } from '../api/options.js';
import Animate from '../mixin/animate.js';
import { maybeDefaultPreventClick } from '../mixin/event.js';
import { keyMap } from '../util/keys.js';

var filter = defineComponent()({
  mixins: [Animate],
  args: "target",
  props: {
    target: String,
    selActive: Boolean
  },
  data: {
    target: "",
    selActive: false,
    attrItem: "drk-filter-control",
    cls: "drk-active",
    duration: 250
  },
  computed: {
    children: ({ target }, $el) => $$(`${target} > *`, $el),
    toggles: ({ attrItem }, $el) => $$(`[${attrItem}],[data-${attrItem}]`, $el)
  },
  watch: {
    toggles(value) {
      const toggles = toHtmlElements(value);
      this.updateState();
      const actives = this.selActive === false ? [] : $$(this.selActive, this.$el);
      for (const toggle of toggles) {
        if (this.selActive !== false) {
          toggleClass(toggle, this.cls, includes(actives, toggle));
        }
        const button = findButton(toggle);
        if (isTag(button, "a")) {
          button.role = "button";
        }
      }
    },
    children(_list, previous) {
      if (previous) {
        this.updateState();
      }
    }
  },
  events: {
    name: "click keydown",
    delegate: ({ attrItem }) => `[${attrItem}],[data-${attrItem}]`,
    handler(e) {
      var _a;
      if (e.type === "keydown" && (!(e instanceof KeyboardEvent) || e.keyCode !== keyMap.SPACE)) {
        return;
      }
      if (hasElementTarget(e) && ((_a = e.target) == null ? void 0 : _a.closest("a,button"))) {
        maybeDefaultPreventClick(e);
        if (e.current instanceof HTMLElement) {
          this.apply(e.current);
        }
      }
    }
  },
  methods: {
    apply(el) {
      const prevState = this.getState();
      const newState = mergeState(el, this.attrItem, this.getState());
      if (!isEqualState(prevState, newState)) {
        this.setState(newState);
      }
    },
    getState() {
      return this.toggles.filter((item) => hasClass(item, this.cls)).reduce((state, el) => mergeState(el, this.attrItem, state), {
        filter: { "": "" },
        sort: []
      });
    },
    async setState(state, animate = true) {
      var _a, _b;
      const nextState = {
        filter: (_a = state.filter) != null ? _a : { "": "" },
        sort: (_b = state.sort) != null ? _b : []
      };
      trigger(this.$el, "beforeFilter", [this, nextState]);
      for (const toggle of this.toggles) {
        toggleClass(toggle, this.cls, matchFilter(toggle, this.attrItem, nextState));
      }
      await Promise.all(
        $$(this.target, this.$el).map((target) => {
          const filterFn = () => applyState(nextState, target, children(target));
          return animate ? this.animate(filterFn, target) : filterFn();
        })
      );
      trigger(this.$el, "afterFilter", [this]);
    },
    updateState() {
      fastdom.write(() => this.setState(this.getState(), false));
    }
  }
});
function getFilter(el, attr) {
  const options = parseOptions(data(el, attr), ["filter"]);
  return {
    filter: stringOption(options.filter),
    group: stringOption(options.group),
    sort: stringOption(options.sort),
    order: stringOption(options.order)
  };
}
function isEqualState(stateA, stateB) {
  return isEqual(stateA.filter, stateB.filter) && isEqual(stateA.sort, stateB.sort);
}
function applyState(state, target, children) {
  for (const el of children) {
    css(
      el,
      "display",
      Object.values(state.filter).every((selector) => !selector || matches(el, selector)) ? "" : "none"
    );
  }
  const [sort, order] = state.sort;
  if (sort) {
    const sorted = sortItems(children, sort, order);
    if (!isEqual(sorted, children)) {
      append(target, sorted);
    }
  }
}
function mergeState(el, attr, state) {
  const { filter, group, sort, order = "asc" } = getFilter(el, attr);
  if (filter || isUndefined(sort)) {
    if (group) {
      if (filter) {
        delete state.filter[""];
        state.filter[group] = filter;
      } else {
        delete state.filter[group];
        if (isEmpty(state.filter) || "" in state.filter) {
          state.filter = { "": filter || "" };
        }
      }
    } else {
      state.filter = { "": filter || "" };
    }
  }
  if (!isUndefined(sort)) {
    state.sort = [sort, order];
  }
  return state;
}
function matchFilter(el, attr, { filter: stateFilter = { "": "" }, sort: [stateSort, stateOrder] }) {
  const { filter = "", group = "", sort, order = "asc" } = getFilter(el, attr);
  const defaultFilterMatches = !group && filter === stateFilter[""];
  const groupFilterMatches = Boolean(group) && filter === stateFilter[group];
  const groupResetMatches = !filter && Boolean(group) && !(group in stateFilter) && !stateFilter[""];
  const filterMatches = defaultFilterMatches || groupFilterMatches || groupResetMatches;
  if (isUndefined(sort)) {
    return filterMatches;
  }
  const sortMatches = stateSort === sort && stateOrder === order;
  const hasFilter = Boolean(filter || group);
  return sortMatches && (!hasFilter || filterMatches);
}
function sortItems(nodes, sort, order) {
  return [...nodes].sort((a, b) => {
    const valA = data(a, sort) || "";
    const valB = data(b, sort) || "";
    const cmp = isNumeric(valA) && isNumeric(valB) ? Number(valA) - Number(valB) : valA.localeCompare(valB, void 0, { numeric: true });
    return cmp * (order === "asc" ? 1 : -1);
  });
}
function findButton(el) {
  return $("a,button", el) || el;
}
function stringOption(value) {
  return value === void 0 ? void 0 : String(value);
}
function toHtmlElements(value) {
  return Array.isArray(value) ? value.filter((item) => item instanceof HTMLElement) : [];
}
function hasElementTarget(event) {
  return event.target instanceof Element;
}

export { filter as default };
