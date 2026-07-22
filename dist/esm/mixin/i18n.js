import { defineMixin } from '../api/options.js';

var I18n = defineMixin()({
  props: {
    i18n: Object
  },
  data: {
    i18n: null
  },
  methods: {
    t(key, ...params) {
      var _a, _b, _c;
      let i = 0;
      return ((_c = ((_a = this.i18n) == null ? void 0 : _a[key]) || ((_b = this.$options.i18n) == null ? void 0 : _b[key])) == null ? void 0 : _c.replace(
        /%s/g,
        () => params[i++] || ""
      )) || "";
    }
  }
});

export { I18n as default };
