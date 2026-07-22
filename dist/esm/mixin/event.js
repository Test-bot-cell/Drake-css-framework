function maybeDefaultPreventClick(e) {
  var _a;
  if ((_a = e.target) == null ? void 0 : _a.closest('a[href="#"],a[href=""]')) {
    e.preventDefault();
  }
}

export { maybeDefaultPreventClick };
