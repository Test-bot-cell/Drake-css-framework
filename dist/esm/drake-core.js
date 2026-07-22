/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

import { each } from './util/lang.js';
import boot from './api/boot.js';
import './api/index.js';
import * as index from './core/index.js';
import App from './api/app.js';

each(index, (component, name) => App.component(name, component));
boot(App);

export { App as default };
