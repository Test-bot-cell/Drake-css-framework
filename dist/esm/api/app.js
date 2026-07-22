import * as index from '../util/index.js';
import VERSION from '../_virtual/_virtual_version.js';
import { init } from './state.js';

const App = function(options = {}) {
  init(this, options);
};
App.util = index;
App.options = {};
App.version = VERSION;

export { App as default };
