import { css, dimensions, height, isVisible } from 'uikit-util';
import { resize } from '../api/observables';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import type { ComponentInternalInstance } from '../types';

interface OverflowAutoProps {
    selContainer: string;
    selContent: string;
}

interface OverflowAutoInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    container?: HTMLElement;
    content?: HTMLElement;
    minHeight: number;
}

export default defineComponent<OverflowAutoInstance>()({
    mixins: [Class],

    props: {
        selContainer: String,
        selContent: String,
        minHeight: Number,
    },

    data: {
        selContainer: '.uk-modal',
        selContent: '.uk-modal-dialog',
        minHeight: 150,
    },

    computed: {
        container: ({ selContainer }: OverflowAutoProps, $el: Element) =>
            $el.closest<HTMLElement>(selContainer) ?? undefined,

        content: ({ selContent }: OverflowAutoProps, $el: Element) =>
            $el.closest<HTMLElement>(selContent) ?? undefined,
    },

    observe: resize<OverflowAutoInstance>({
        target: ({ container, content }) =>
            [container, content].filter((element): element is HTMLElement => Boolean(element)),
    }),

    update: {
        read() {
            if (!this.content || !this.container || !isVisible(this.$el)) {
                return false;
            }

            return {
                max: Math.max(
                    this.minHeight,
                    height(this.container) - (dimensions(this.content).height - height(this.$el)),
                ),
            };
        },

        write({ max }: { max: number }) {
            css(this.$el, { minHeight: this.minHeight, maxHeight: max });
        },

        events: ['resize'],
    },
});
