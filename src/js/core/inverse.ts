import {
    $$,
    css,
    dimensions,
    intersectRect,
    matches,
    observeResize,
    on,
    parent,
    replaceClass,
    toNodes,
} from 'uikit-util';
import { intersection, mutation } from '../api/observables';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance, FrameworkEvent, NodeInput } from '../types';

interface InverseProps {
    target: string | false;
}

interface InverseInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    target: HTMLElement | HTMLElement[];
    selActive: string | false;
    isIntersecting: number;
}

type InverseObserverHandler = (
    entries?: ResizeObserverEntry[],
    observer?: ResizeObserver,
) => unknown;

export default defineComponent<InverseInstance>()({
    props: {
        target: String,
        selActive: String,
    },

    data: {
        target: false,
        selActive: false,
    },

    connected() {
        this.isIntersecting = 0;
    },

    computed: {
        target: ({ target }: InverseProps, $el: Element) => (target ? $$(target, $el) : $el),
    },

    watch: {
        target: {
            handler() {
                queueMicrotask(() => this.$reset());
            },
            immediate: false,
        },
    },

    observe: [
        intersection<InverseInstance>({
            handler(entries) {
                this.isIntersecting = entries.reduce(
                    (sum, { isIntersecting }) =>
                        sum + (isIntersecting ? 1 : this.isIntersecting ? -1 : 0),
                    this.isIntersecting,
                );
                this.$emit();
            },
            target: ({ target }) => target,
            args: { intersecting: false },
        }),
        mutation<InverseInstance>({
            target: ({ target }) => target,
            options: { attributes: true, attributeFilter: ['class'] },
        }),
        {
            target: ({ target }: InverseInstance) => target,
            observe: (target: NodeInput, handler: InverseObserverHandler) => {
                const targets = toNodes(target).filter(
                    (node): node is Element => node instanceof Element,
                );
                const observer = observeResize([...targets, document.documentElement], handler);
                const notify = () => handler();
                const observe = (element: Element) => {
                    if ('observe' in observer) {
                        observer.observe(element);
                    }
                };
                const unobserve = (element: Element) => {
                    if ('unobserve' in observer) {
                        observer.unobserve(element);
                    }
                };
                const listener = [
                    on(document, 'scroll itemshown itemhidden', notify, {
                        passive: true,
                        capture: true,
                    }),
                    on(document, 'show hide transitionstart', (e: FrameworkEvent) => {
                        handler();
                        if (e.target instanceof Element) {
                            observe(e.target);
                        }
                    }),
                    on(
                        document,
                        'shown hidden transitionend transitioncancel',
                        (e: FrameworkEvent) => {
                            handler();
                            if (e.target instanceof Element) {
                                unobserve(e.target);
                            }
                        },
                    ),
                ];

                return {
                    observe,
                    unobserve,
                    disconnect() {
                        observer.disconnect();
                        listener.map((off) => off());
                    },
                };
            },
            handler() {
                this.$emit();
            },
        },
    ],

    update: {
        read() {
            if (!this.isIntersecting) {
                return false;
            }

            for (const target of toNodes(this.target)) {
                const color =
                    !this.selActive || matches(target, this.selActive)
                        ? findTargetColor(target)
                        : '';

                if (color !== false) {
                    replaceClass(target, 'uk-light uk-dark', color);
                }
            }
        },
    },
});

function findTargetColor(target: Element): string | false {
    const dim = dimensions(target);
    const viewport = dimensions(window);

    if (!intersectRect(dim, viewport)) {
        return false;
    }

    const { left, top, height, width } = dim;

    let last = '';
    for (const percent of [0.25, 0.5, 0.75]) {
        const elements = target.ownerDocument.elementsFromPoint(
            Math.max(0, Math.min(left + width * percent, viewport.width - 1)),
            Math.max(0, Math.min(top + height / 2, viewport.height - 1)),
        );

        for (const element of elements) {
            if (
                target.contains(element) ||
                !checkVisibility(element) ||
                (element.closest('[class*="-leave"]') &&
                    elements.some((el) => element !== el && matches(el, '[class*="-enter"]')))
            ) {
                continue;
            }

            const color = css(element, '--uk-inverse');
            if (color) {
                if (color === last) {
                    return `uk-${color}`;
                }

                last = color;
                break;
            }
        }
    }

    return last ? `uk-${last}` : '';
}

// TODO: once it becomes Baseline `element.checkVisibility({ opacityProperty: true, visibilityProperty: true })`
function checkVisibility(element: Element): boolean {
    if (css(element, 'visibility') !== 'visible') {
        return false;
    }

    let current: Element | null | undefined = element;
    while (current) {
        if (css(current, 'opacity') === '0') {
            return false;
        }
        current = parent(current);
    }

    return true;
}
