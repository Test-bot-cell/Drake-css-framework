import {
    children,
    clamp,
    css,
    getEventPos,
    hasClass,
    isInput,
    isTouch,
    on,
    pointerCancel,
    pointerDown,
    pointerMove,
    pointerUp,
    selInput,
    toggleClass,
} from 'uikit-util';
import { mutation, resize } from '../api/observables';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance, FrameworkEvent } from '../types';

interface OverflowFadeInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    threshold: number;
    fadeDuration: number;
}

type MouseDragEvent = FrameworkEvent<Element> & { button: number };

export default defineComponent<OverflowFadeInstance>()({
    data: {
        threshold: 5,
        fadeDuration: 0.05,
    },

    events: [
        {
            name: 'scroll',

            self: true,

            passive: true,

            handler() {
                this.$emit();
            },
        },
        {
            name: pointerDown,

            handler: handleMouseDrag,
        },
    ],

    observe: [
        mutation<OverflowFadeInstance>({
            options: {
                subtree: true,
                childList: true,
            },
        }),
        resize<OverflowFadeInstance>({
            target: ({ $el }) => [$el, ...children($el)],
        }),
    ],

    update: {
        read() {
            const overflow: [number, number] = [
                this.$el.scrollWidth - this.$el.clientWidth,
                this.$el.scrollHeight - this.$el.clientHeight,
            ];
            return { overflow };
        },

        write({ overflow }: { overflow: [number, number] }) {
            for (let i = 0; i < 2; i++) {
                const current = overflow[i] ?? 0;
                const previous = i > 0 ? (overflow[i - 1] ?? 0) : 0;
                toggleClass(
                    this.$el,
                    `${this.$options.id}-${i ? 'vertical' : 'horizontal'}`,
                    Boolean(current && !previous),
                );

                if (!previous) {
                    const dir = i ? 'Top' : 'Left';
                    const scrollPosition = dir === 'Top' ? this.$el.scrollTop : this.$el.scrollLeft;
                    const percent = current ? scrollPosition / current : 0;

                    const toValue = (value: number): number =>
                        current ? clamp((this.fadeDuration - value) / this.fadeDuration) : 1;

                    css(this.$el, {
                        '--uk-overflow-fade-start-opacity': toValue(percent),
                        '--uk-overflow-fade-end-opacity': toValue(1 - percent),
                    });
                }
            }
        },

        events: ['resize'],
    },
});

function handleMouseDrag(this: OverflowFadeInstance, e: MouseDragEvent): void {
    const { target, button, defaultPrevented } = e;

    if (
        defaultPrevented ||
        button > 0 ||
        isTouch(e) ||
        (target && target.closest(selInput)) ||
        isInput(target)
    ) {
        return;
    }

    e.preventDefault();

    const pointerOptions = { passive: false, capture: true };
    const { $el: element, threshold, $options } = this;
    let started = false;

    const off = on(document, pointerMove, move(e), pointerOptions);
    on(document, [pointerUp, pointerCancel], end, { capture: true, once: true });

    function move(startEvent: FrameworkEvent) {
        const origin = getEventPos(startEvent);
        let pos = origin;
        let lastPos = pos;

        return function (event: FrameworkEvent) {
            lastPos = pos;
            pos = getEventPos(event);

            const isVertical = hasClass(element, `${$options.id}-vertical`);
            const prop = isVertical ? 'y' : 'x';

            started ||= Math.abs(pos[prop] - origin[prop]) > threshold;

            if (started) {
                const delta = lastPos[prop] - pos[prop];
                if (isVertical) {
                    element.scrollTop += delta;
                } else {
                    element.scrollLeft += delta;
                }
            }
        };
    }

    function end() {
        off();

        if (started) {
            setTimeout(on(element, 'click', (event) => event.preventDefault(), pointerOptions));
        }
    }
}
