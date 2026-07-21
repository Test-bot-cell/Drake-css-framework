import { hasClass } from 'drake-util';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import type { ComponentInternalInstance } from '../types';
import Switcher from './switcher';

export default defineComponent<ComponentInternalInstance>()({
    mixins: [Class],

    extends: Switcher,

    props: {
        media: Boolean,
    },

    data: {
        media: 960,
        attrItem: 'drk-tab-item',
        selVertical: '.drk-tab-left,.drk-tab-right',
    },

    connected() {
        const cls = hasClass(this.$el, 'drk-tab-left')
            ? 'drk-tab-left'
            : hasClass(this.$el, 'drk-tab-right')
              ? 'drk-tab-right'
              : false;

        if (cls) {
            this.$create('toggle', this.$el, { cls, mode: 'media', media: this.media });
        }
    },
});
