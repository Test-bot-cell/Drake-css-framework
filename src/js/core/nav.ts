import { defineComponent } from '../api/options';
import type { ComponentInternalInstance } from '../types';
import Accordion from './accordion';

export default defineComponent<ComponentInternalInstance>()({
    extends: Accordion,

    data: {
        targets: '> .uk-parent',
        toggle: '> a',
        content: '> ul',
    },
});
