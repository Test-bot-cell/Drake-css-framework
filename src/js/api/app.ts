import * as util from 'uikit-util';
import VERSION from 'virtual:version';
import type { ComponentInitOptions, ComponentInternalInstance, UIkitStatic } from '../types';
import { init } from './state';

const App = function (this: ComponentInternalInstance, options: ComponentInitOptions = {}): void {
    init(this, options);
} as UIkitStatic;

App.util = util;
App.options = {};
App.version = VERSION;

export default App;
