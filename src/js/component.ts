import Component from 'component';
import name from 'virtual:name';

if (typeof window !== 'undefined' && window.Drake) {
    window.Drake.component(name, Component);
}

export default Component;
