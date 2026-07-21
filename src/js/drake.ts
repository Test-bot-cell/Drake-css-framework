import { each } from 'drake-util';
import * as components from './components/index';
import Drake from './drake-core';

each(components, (component, name) => Drake.component(name, component));

export default Drake;
