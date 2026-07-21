import {
    addClass,
    css,
    hasClass,
    isRtl,
    scrolledOver,
    sumBy,
    toFloat,
    toggleClass,
    toPx,
} from 'drake-util';
import { scroll } from '../api/observables';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import type { ComponentInternalInstance } from '../types';
import Margin from './margin';

type Translation = [number, number];

interface GridInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    clsStack: string;
    margin: string;
    masonry: boolean | 'next';
    parallax: number | string;
    parallaxStart: number | string;
    parallaxEnd: number | string;
    parallaxJustify: boolean;
}

interface GridUpdateData {
    rows: HTMLElement[][];
    columns?: HTMLElement[][];
    translates?: Translation[][] | false;
    scrollColumns?: number[] | false;
    parallaxStart?: number;
    parallaxEnd?: number;
    padding?: number;
    height?: number | string | false;
    scrolled?: number | false;
}

export default defineComponent<GridInstance>()({
    extends: Margin,

    mixins: [Class],

    name: 'grid',

    props: {
        masonry: Boolean,
        parallax: String,
        parallaxStart: String,
        parallaxEnd: String,
        parallaxJustify: Boolean,
    },

    data: {
        margin: 'drk-grid-margin',
        clsStack: 'drk-grid-stack',
        masonry: false,
        parallax: 0,
        parallaxStart: 0,
        parallaxEnd: 0,
        parallaxJustify: false,
    },

    connected() {
        if (this.masonry) {
            addClass(this.$el, 'drk-flex-top', 'drk-flex-wrap-top');
        }
    },

    observe: scroll<GridInstance>({
        filter: ({ parallax, parallaxJustify }) => Boolean(parallax || parallaxJustify),
    }),

    update: [
        {
            write({ rows }: GridUpdateData) {
                toggleClass(this.$el, this.clsStack, !rows.some((row) => row.length > 1));
            },

            events: ['resize'],
        },

        {
            read(data: GridUpdateData) {
                const { rows } = data;
                const { masonry, parallaxJustify, margin } = this;
                let parallax = Math.max(0, toPx(this.parallax));

                // Filter component makes elements positioned absolute
                if (
                    !(masonry || parallax || parallaxJustify) ||
                    positionedAbsolute(rows) ||
                    (rows[0]?.some((el, i) =>
                        rows.some((row) => row[i] && row[i].offsetWidth !== el.offsetWidth),
                    ) ??
                        false)
                ) {
                    return (data.translates = data.scrollColumns = false);
                }

                const gutter = getGutter(rows, margin);

                let columns: HTMLElement[][];
                let translates: Translation[][] | undefined;
                if (masonry) {
                    [columns, translates] = applyMasonry(rows, gutter, masonry === 'next');
                } else {
                    columns = transpose(rows);
                }

                const columnHeights = columns.map(
                    (column) => sumBy(column, 'offsetHeight') + gutter * (column.length - 1),
                );
                const height = Math.max(0, ...columnHeights);

                let scrollColumns: number[] | undefined;
                let parallaxStart: number | undefined;
                let parallaxEnd: number | undefined;
                if (parallax || parallaxJustify) {
                    scrollColumns = columnHeights.map((hgt, i) =>
                        parallaxJustify ? height - hgt + parallax : parallax / (i % 2 || 8),
                    );
                    if (!parallaxJustify) {
                        parallax = Math.max(
                            ...columnHeights.map(
                                (hgt, i) => hgt + (scrollColumns?.[i] ?? 0) - height,
                            ),
                        );
                    }
                    parallaxStart = toPx(this.parallaxStart, 'height', this.$el, true);
                    parallaxEnd = toPx(this.parallaxEnd, 'height', this.$el, true);
                }

                return {
                    columns,
                    translates,
                    scrollColumns,
                    parallaxStart,
                    parallaxEnd,
                    padding: parallax,
                    height: translates ? height : '',
                };
            },

            write({ height, padding }: GridUpdateData) {
                css(this.$el, 'paddingBottom', padding || '');
                if (height !== false) {
                    css(this.$el, 'height', height);
                }
            },

            events: ['resize'],
        },

        {
            read({ rows, scrollColumns, parallaxStart, parallaxEnd }: GridUpdateData) {
                return {
                    scrolled:
                        scrollColumns && !positionedAbsolute(rows)
                            ? scrolledOver(this.$el, parallaxStart, parallaxEnd)
                            : false,
                };
            },

            write({ columns, scrolled, scrollColumns, translates }: GridUpdateData) {
                if ((!scrolled && !translates) || !columns) {
                    return;
                }

                columns.forEach((column, i) =>
                    column.forEach((el, j) => {
                        const [x, initialY] = (translates && translates[i]?.[j]) || [0, 0];
                        let y = initialY;

                        if (scrolled && scrollColumns) {
                            y += scrolled * (scrollColumns[i] ?? 0);
                        }

                        css(el, 'transform', `translate(${x}px, ${y}px)`);
                    }),
                );
            },

            events: ['scroll', 'resize'],
        },
    ],
});

function positionedAbsolute(rows: HTMLElement[][]): boolean {
    return rows.flat().some((el) => css(el, 'position') === 'absolute');
}

function applyMasonry(
    rows: HTMLElement[][],
    gutter: number,
    next: boolean,
): [HTMLElement[][], Translation[][]] {
    const columns: HTMLElement[][] = [];
    const translates: Translation[][] = [];
    const columnHeights: number[] = Array(rows[0]?.length ?? 0).fill(0);
    let rowHeights = 0;
    for (const row of rows) {
        const cells = isRtl ? row.slice().reverse() : row;

        let height = 0;
        for (const [j, cell] of cells.entries()) {
            const { offsetWidth, offsetHeight } = cell;
            const index = next ? j : columnHeights.indexOf(Math.min(...columnHeights));
            push(columns, index, cell);
            push(translates, index, [
                (index - j) * offsetWidth * (isRtl ? -1 : 1),
                (columnHeights[index] ?? 0) - rowHeights,
            ]);
            columnHeights[index] = (columnHeights[index] ?? 0) + offsetHeight + gutter;
            height = Math.max(height, offsetHeight);
        }

        rowHeights += height + gutter;
    }

    return [columns, translates];
}

function getGutter(rows: HTMLElement[][], cls: string): number {
    const node = rows.flat().find((el) => hasClass(el, cls));
    return toFloat(node ? css(node, 'marginTop') : css(rows[0]?.[0], 'paddingLeft'));
}

function transpose(rows: HTMLElement[][]): HTMLElement[][] {
    const columns: HTMLElement[][] = [];
    for (const row of rows) {
        for (const [index, element] of row.entries()) {
            push(columns, index, element);
        }
    }
    return columns;
}

function push<T>(array: T[][], index: number, value: T): void {
    if (!array[index]) {
        array[index] = [];
    }
    array[index]?.push(value);
}
