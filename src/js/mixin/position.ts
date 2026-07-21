import {
    css,
    dimensions,
    flipPosition,
    includes,
    isRtl,
    positionAt,
    scrollParent,
    toPx,
} from 'drake-util';
import { defineMixin } from '../api/options';
import type { Axis, ComponentInternalInstance, ComponentValueMap, Side } from '../types';
import type { PositionOptions } from '../util/position';

type Direction = Side | 'center';
type Attach = [Direction, Direction];
type PositionTarget = Element | [Element, Element];

interface PositionInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & { pos: string };
    pos: Attach;
    dir: Direction;
    align: Direction;
    axis: Axis;
    offset: boolean | number | string;
    flip: boolean;
    shift: boolean;
    inset: boolean;
    positionAt(
        element: Element,
        target: PositionTarget,
        boundary?: Element | [Element, Element],
    ): void;
    getPositionOffset(element?: Element): number;
    getShiftOffset(element?: Element): number;
    getViewportOffset(element: Element): number;
}

type ExtendedPositionOptions = PositionOptions & { viewportOffset: number };
const positionWithViewportOffset: (
    element: Element,
    target: PositionTarget,
    options: ExtendedPositionOptions,
) => void = positionAt;

export default defineMixin<PositionInstance>()({
    props: {
        pos: String,
        offset: Boolean,
        flip: Boolean,
        shift: Boolean,
        inset: Boolean,
    },

    data: {
        pos: `bottom-${isRtl ? 'right' : 'left'}`,
        offset: false,
        flip: true,
        shift: true,
        inset: false,
    },

    connected() {
        const [direction = 'center', alignment = 'center'] = this.$props.pos
            .split('-')
            .concat('center');
        this.pos = [toDirection(direction), toDirection(alignment)];
        [this.dir, this.align] = this.pos;
        this.axis = includes(['top', 'bottom'], this.dir) ? 'y' : 'x';
    },

    methods: {
        positionAt(
            element: Element,
            target: PositionTarget,
            boundary?: Element | [Element, Element],
        ): void {
            const offset: [number, number] = [
                this.getPositionOffset(element),
                this.getShiftOffset(element),
            ];
            const placement: ['flip' | undefined, 'shift' | undefined] = [
                this.flip ? 'flip' : undefined,
                this.shift ? 'shift' : undefined,
            ];

            const attach: { element: Attach; target: Attach } = {
                element: [this.inset ? this.dir : toDirection(flipPosition(this.dir)), this.align],
                target: [this.dir, this.align],
            };

            if (this.axis === 'y') {
                attach.element.reverse();
                attach.target.reverse();
                offset.reverse();
                placement.reverse();
            }

            const restoreScrollPosition = storeScrollPosition(element);

            // Ensure none positioned element does not generate scrollbars
            const elDim = dimensions(element);
            css(element, { top: -elDim.height, left: -elDim.width });

            positionWithViewportOffset(element, target, {
                attach,
                offset,
                boundary,
                placement,
                viewportOffset: this.getViewportOffset(element),
            });

            restoreScrollPosition();
        },

        getPositionOffset(this: PositionInstance, element = this.$el): number {
            return (
                toPx(
                    this.offset === false ? css(element, '--drk-position-offset') : this.offset,
                    this.axis === 'x' ? 'width' : 'height',
                    element,
                ) *
                (includes(['left', 'top'], this.dir) ? -1 : 1) *
                (this.inset ? -1 : 1)
            );
        },

        getShiftOffset(this: PositionInstance, element = this.$el): number {
            return this.align === 'center'
                ? 0
                : toPx(
                      css(element, '--drk-position-shift-offset'),
                      this.axis === 'y' ? 'width' : 'height',
                      element,
                  ) * (includes(['left', 'top'], this.align) ? 1 : -1);
        },

        getViewportOffset(element: Element): number {
            return toPx(css(element, '--drk-position-viewport-offset'));
        },
    },
});

export function storeScrollPosition(element: Element): () => void {
    const scrollElement = scrollParent(element);
    const { scrollTop } = scrollElement;

    return () => {
        if (scrollTop !== scrollElement.scrollTop) {
            scrollElement.scrollTop = scrollTop;
        }
    };
}

function toDirection(value: string): Direction {
    return ['top', 'right', 'bottom', 'left', 'center'].includes(value)
        ? value === 'top' || value === 'right' || value === 'bottom' || value === 'left'
            ? value
            : 'center'
        : 'center';
}
