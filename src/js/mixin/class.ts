import { addClass, hasClass, removeClass } from 'uikit-util';
import { defineMixin } from '../api/options';
import type { ComponentInternalInstance } from '../types';

interface ClassInstance extends ComponentInternalInstance {
    _cmpCls: boolean;
}

export default defineMixin<ClassInstance>()({
    connected() {
        this._cmpCls = hasClass(this.$el, this.$options.id);
        addClass(this.$el, this.$options.id);
    },

    disconnected() {
        if (!this._cmpCls) {
            removeClass(this.$el, this.$options.id);
        }
    },
});
