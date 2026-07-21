import { children, isRtl, isVisible, offsetPosition, toggleClass } from 'drake-util';
import { mutation, resize } from '../api/observables';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance } from '../types';

interface MarginInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    margin: string;
    firstColumn: string;
}

export default defineComponent<MarginInstance>()({
    props: {
        margin: String,
        firstColumn: Boolean,
    },

    data: {
        margin: 'drk-margin-small-top',
        firstColumn: 'drk-first-column',
    },

    observe: [
        mutation<MarginInstance>({
            options: {
                childList: true,
            },
        }),
        mutation<MarginInstance>({
            options: {
                attributes: true,
                attributeFilter: ['style'],
            },
        }),
        resize<MarginInstance>({
            handler(mutations) {
                for (const { target, borderBoxSize } of mutations) {
                    const { inlineSize = 0, blockSize = 0 } = borderBoxSize[0] ?? {};
                    // Skip if the element is hidden
                    if (target === this.$el && !inlineSize && !blockSize) {
                        return;
                    }
                }
                this.$emit('resize');
            },
            target: ({ $el }) => [$el, ...children($el)],
        }),
    ],

    update: {
        read() {
            return {
                rows: getRows(children(this.$el)),
            };
        },

        write({ rows }: { rows: HTMLElement[][] }) {
            for (const row of rows) {
                for (const el of row) {
                    toggleClass(el, this.margin, rows[0] !== row);
                    toggleClass(el, this.firstColumn, row[isRtl ? row.length - 1 : 0] === el);
                }
            }
        },

        events: ['resize'],
    },
});

export function getRows(elements: Element[]): HTMLElement[][] {
    const htmlElements = elements.filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
    );
    const sorted: HTMLElement[][] = [[]];
    const withOffset = htmlElements.some(
        (el, i) => i > 0 && htmlElements[i - 1]?.offsetParent !== el.offsetParent,
    );

    for (const el of htmlElements) {
        if (!isVisible(el)) {
            continue;
        }

        const offset = getOffset(el, withOffset);

        for (let i = sorted.length - 1; i >= 0; i--) {
            const current = sorted[i];
            if (!current) {
                continue;
            }

            if (!current[0]) {
                current.push(el);
                break;
            }

            const offsetCurrent = getOffset(current[0], withOffset);

            if (offset.top >= offsetCurrent.bottom - 1 && offset.top !== offsetCurrent.top) {
                sorted.push([el]);
                break;
            }

            if (offset.bottom - 1 > offsetCurrent.top || offset.top === offsetCurrent.top) {
                let j = current.length - 1;
                for (; j >= 0; j--) {
                    const candidate = current[j];
                    if (!candidate) {
                        continue;
                    }
                    const offsetCurrent = getOffset(candidate, withOffset);
                    if (offset.left >= offsetCurrent.left) {
                        break;
                    }
                }
                current.splice(j + 1, 0, el);
                break;
            }

            if (i === 0) {
                sorted.unshift([el]);
                break;
            }
        }
    }

    return sorted;
}

function getOffset(element: HTMLElement, offset = false) {
    let { offsetTop, offsetLeft } = element;
    const { offsetHeight, offsetWidth } = element;

    if (offset) {
        [offsetTop, offsetLeft] = offsetPosition(element);
    }

    return {
        top: offsetTop,
        left: offsetLeft,
        bottom: offsetTop + offsetHeight,
        right: offsetLeft + offsetWidth,
    };
}
