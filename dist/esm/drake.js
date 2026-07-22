/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

import { each } from './util/lang.js';
import * as index from './components/index.js';
import './drake-core.js';
import './api/index.js';
import App from './api/app.js';

each(index, (component, name) => App.component(name, component));

export { App as default };
