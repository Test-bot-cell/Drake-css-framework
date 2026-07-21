import { css, query } from 'uikit-util';
import { resize } from '../api/observables';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance } from '../types';

interface HeightPlaceholderProps {
    target: string;
}

interface HeightPlaceholderInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    target?: HTMLElement;
}

interface HeightPlaceholderUpdate {
    height: number;
}

export default defineComponent<HeightPlaceholderInstance>()({
    args: 'target',

    props: {
        target: String,
    },

    data: {
        target: '',
    },

    computed: {
        target: {
            get: ({ target }: HeightPlaceholderProps, $el: Element) => query(target, $el),
            observe: ({ target }: HeightPlaceholderProps) => target,
        },
    },

    observe: resize<HeightPlaceholderInstance>({ target: ({ target }) => target }),

    update: {
        read() {
            return this.target ? { height: this.target.offsetHeight } : false;
        },

        write({ height }: HeightPlaceholderUpdate) {
            css(this.$el, 'minHeight', height);
        },

        events: ['resize'],
    },
});
