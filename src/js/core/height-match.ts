import { $$, boxModelAdjust, css, dimensions, isVisible, pick } from 'drake-util';
import { resize } from '../api/observables';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance } from '../types';
import { getRows } from './margin';

interface HeightMatchProps {
    target: string;
}

interface HeightMatchInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    elements: HTMLElement[];
    row: boolean;
}

export default defineComponent<HeightMatchInstance>()({
    args: 'target',

    props: {
        target: String,
        row: Boolean,
    },

    data: {
        target: '> *',
        row: true,
    },

    computed: {
        elements: ({ target }: HeightMatchProps, $el: Element) => $$(target, $el),
    },

    observe: resize<HeightMatchInstance>({
        target: ({ $el, elements }) => [
            $el,
            ...elements,
            ...elements.flatMap((el) => Array.from(el.children)),
        ],
    }),

    events: {
        // Hidden elements may change height when fonts load
        name: 'loadingdone',

        el: () => document.fonts,

        handler() {
            this.$emit('resize');
        },
    },

    update: {
        read() {
            return {
                rows: (this.row ? getRows(this.elements) : [this.elements]).map(match),
            };
        },

        write({ rows }: { rows: MatchResult[] }) {
            for (const { heights, elements } of rows) {
                elements.forEach((el, i) => css(el, 'minHeight', heights[i]));
            }
        },

        events: ['resize'],
    },
});

interface MatchResult {
    heights: (number | string)[];
    elements: HTMLElement[];
}

function match(elements: HTMLElement[]): MatchResult {
    if (elements.length < 2) {
        return { heights: [''], elements };
    }

    const heights = elements.map(getHeight);
    const max = Math.max(...heights);

    return {
        heights: elements.map((_el, i) => {
            const height = heights[i];
            return height !== undefined && height.toFixed(2) === max.toFixed(2) ? '' : max;
        }),
        elements,
    };
}

function getHeight(element: HTMLElement): number {
    const style = pick(element.style, ['display', 'minHeight']);

    if (!isVisible(element)) {
        css(element, 'display', 'block', 'important');
    }
    css(element, 'minHeight', '');
    const height = dimensions(element).height - boxModelAdjust(element, 'height', 'content-box');
    css(element, style);
    return height;
}
