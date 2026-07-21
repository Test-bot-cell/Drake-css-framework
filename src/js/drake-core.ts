import { each } from 'drake-util';
import boot from './api/boot';
import Drake from './api/index';
import * as components from './core/index';

// register components
each(components, (component, name) => Drake.component(name, component));

boot(Drake);

export default Drake;
