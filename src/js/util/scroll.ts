import type { CssProperties, FrameworkEvent } from '../types';
import { width } from './dimensions';
import { getEventPos, on, once } from './event';
import { matches } from './filter';
import { css, resetProps } from './style';
import { scrollParents } from './viewport';

let prevented = false;

export function preventBackgroundScroll(element: HTMLElement): () => void {
    const off = on(
        element,
        'touchstart',
        (event: FrameworkEvent) => {
            if (
                event.targetTouches?.length !== 1 ||
                !(event.target instanceof Element) ||
                matches(event.target, 'input[type="range"]')
            ) {
                return;
            }

            let previous = getEventPos(event).y;
            const offMove = on(
                element,
                'touchmove',
                (moveEvent: FrameworkEvent) => {
                    const position = getEventPos(moveEvent).y;
                    if (position === previous) {
                        return;
                    }
                    previous = position;

                    const target = moveEvent.target instanceof Element ? moveEvent.target : element;
                    if (
                        !scrollParents(target).some((scrollParent) => {
                            if (!element.contains(scrollParent)) {
                                return false;
                            }
                            return scrollParent.clientHeight < scrollParent.scrollHeight;
                        })
                    ) {
                        moveEvent.preventDefault();
                    }
                },
                { passive: false },
            );
            once(element, 'scroll touchend touchcancel', offMove, { capture: true });
        },
        { passive: true },
    );

    if (prevented) {
        return off;
    }
    prevented = true;

    const scrollingElement =
        document.scrollingElement instanceof HTMLElement
            ? document.scrollingElement
            : document.documentElement;
    const properties: CssProperties = {
        overflowY: CSS.supports('overflow', 'clip') ? 'clip' : 'hidden',
        touchAction: 'none',
        scrollbarGutter: width(window) - scrollingElement.clientWidth ? 'stable' : '',
    };
    css(scrollingElement, properties);
    return () => {
        prevented = false;
        off();
        resetProps(scrollingElement, properties);
    };
}
