import * as util from 'drake-util';
import VERSION from 'virtual:version';
import type { ComponentInitOptions, ComponentInternalInstance, DrakeStatic } from '../types';
import { init } from './state';

const App = function (this: ComponentInternalInstance, options: ComponentInitOptions = {}): void {
    init(this, options);
} as DrakeStatic;

App.util = util;
App.options = {};
App.version = VERSION;

export default App;
