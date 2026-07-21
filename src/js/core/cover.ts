import { css, Dimensions, isTag, parent } from 'drake-util';
import { resize } from '../api/observables';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance } from '../types';
import Video from './video';

interface CoverInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    width?: number;
    height?: number;
    useObjectFit: boolean;
}

interface CoverDimensions {
    width: number;
    height: number;
}

export default defineComponent<CoverInstance>()({
    mixins: [Video],

    props: {
        width: Number,
        height: Number,
    },

    data: {
        automute: true,
    },

    created() {
        this.useObjectFit = isTag(this.$el, 'img', 'video');
    },

    observe: resize<CoverInstance>({
        target: ({ $el }) => getPositionedParent($el) || parent($el),
        filter: ({ useObjectFit }) => !useObjectFit,
    }),

    update: {
        read() {
            if (this.useObjectFit) {
                return false;
            }

            const { $el, width = $el.clientWidth, height = $el.clientHeight } = this;

            const el = getPositionedParent($el) || parent($el);
            if (!el) {
                return false;
            }
            const dim = Dimensions.cover(
                { width, height },
                { width: el.offsetWidth, height: el.offsetHeight },
            );

            return dim.width && dim.height ? dim : false;
        },

        write({ height, width }: CoverDimensions) {
            css(this.$el, { height, width });
        },

        events: ['resize'],
    },
});

function getPositionedParent(el: HTMLElement): HTMLElement | undefined {
    let current: HTMLElement | null | undefined = el;
    while ((current = parent(current))) {
        if (css(current, 'position') !== 'static') {
            return current;
        }
    }
}
