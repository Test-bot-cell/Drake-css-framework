import { css, dimensions, height, isVisible } from 'drake-util';
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
        selContainer: '.drk-modal',
        selContent: '.drk-modal-dialog',
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
            // D-026 (axe 3) : la zone rendue défilante par le composant doit
            // livrer son accès clavier (WCAG 2.1.1, scrollable-region-focusable).
            this.$el.tabIndex = 0;
        },

        events: ['resize'],
    },
});
