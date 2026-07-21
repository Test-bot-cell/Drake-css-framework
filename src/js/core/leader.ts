import { attr, css, toggleClass, wrapInner } from 'drake-util';
import { resize } from '../api/observables';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import Media from '../mixin/media';
import type { ComponentInternalInstance } from '../types';

interface LeaderProps {
    fill: string;
}

interface LeaderInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    fill: string;
    clsWrapper: string;
    clsHide: string;
    attrFill: string;
    matchMedia: boolean;
    wrapper?: HTMLElement;
}

interface LeaderUpdate {
    width: number;
    fill: string;
    hide: boolean;
}

export default defineComponent<LeaderInstance>()({
    mixins: [Class, Media],

    props: {
        fill: String,
    },

    data: {
        fill: '',
        clsWrapper: 'drk-leader-fill',
        clsHide: 'drk-leader-hide',
        attrFill: 'data-fill',
    },

    computed: {
        fill: ({ fill }: LeaderProps, $el: Element) =>
            fill || css($el, '--drk-leader-fill-content'),
    },

    connected() {
        const wrapper = wrapInner(this.$el, `<span class="${this.clsWrapper}">`)[0];
        if (wrapper instanceof HTMLElement) {
            this.wrapper = wrapper;
        }
    },

    disconnected() {
        if (this.wrapper) {
            this.wrapper.replaceWith(...this.wrapper.childNodes);
        }
    },

    observe: resize<LeaderInstance>(),

    update: {
        read() {
            const width = Math.trunc(this.$el.offsetWidth / 2);

            return {
                width,
                fill: this.fill,
                hide: !this.matchMedia,
            };
        },

        write({ width, fill, hide }: LeaderUpdate) {
            if (!this.wrapper) {
                return;
            }
            toggleClass(this.wrapper, this.clsHide, hide);
            attr(this.wrapper, this.attrFill, new Array(width).join(fill));
        },

        events: ['resize'],
    },
});
