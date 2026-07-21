import { addClass, css } from 'uikit-util';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance } from '../types';

interface ResponsiveInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    width: string | number;
    height: string | number;
}

export default defineComponent<ResponsiveInstance>()({
    props: ['width', 'height'],

    connected() {
        addClass(this.$el, 'uk-responsive-width');
        css(this.$el, 'aspectRatio', `${this.width}/${this.height}`);
    },
});
