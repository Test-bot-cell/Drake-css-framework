import { clamp, createEvent, css, noop, resetProps, Transition, trigger } from 'drake-util';
import type { ElementInput } from '../../types';
import type { SlideshowTransitioner, SlideshowTransitionOptions } from '../types';

export default function Transitioner(
    prev: HTMLElement | undefined,
    next: HTMLElement | undefined,
    dir: number,
    { animation, easing }: SlideshowTransitionOptions,
): SlideshowTransitioner {
    const { percent, translate, show } = animation;
    const props = show(dir);

    const { promise, resolve } = withResolvers();

    return {
        dir,

        show(duration: number, initialPercent = 0, linear = false): Promise<void> {
            const timing = linear ? 'linear' : easing;
            duration -= Math.round(duration * clamp(initialPercent, -1, 1));

            this.translate(initialPercent);

            triggerUpdate(next, 'itemin', { percent: initialPercent, duration, timing, dir });
            triggerUpdate(prev, 'itemout', {
                percent: 1 - initialPercent,
                duration,
                timing,
                dir,
            });

            Promise.all([
                Transition.start(next, props[1], duration, timing),
                Transition.start(prev, props[0], duration, timing),
            ]).then(() => {
                this.reset();
                resolve(undefined);
            }, noop);

            return promise;
        },

        cancel() {
            return Transition.cancel([next, prev].filter(isHtmlElement));
        },

        reset() {
            resetProps([next, prev].filter(isHtmlElement), props[0]);
        },

        async forward(
            this: SlideshowTransitioner,
            duration: number,
            initialPercent = this.percent(),
        ): Promise<void> {
            await this.cancel();
            return this.show(duration, initialPercent, true);
        },

        translate(initialPercent: number): void {
            this.reset();

            const translatedProps = translate(initialPercent, dir);
            css(next, translatedProps[1]);
            css(prev, translatedProps[0]);
            triggerUpdate(next, 'itemtranslatein', { percent: initialPercent, dir });
            triggerUpdate(prev, 'itemtranslateout', { percent: 1 - initialPercent, dir });
        },

        percent() {
            const current = prev || next;
            return current ? percent(current, next, dir) : 0;
        },

        getDistance() {
            return prev?.offsetWidth;
        },
    };
}

export function triggerUpdate(
    el: ElementInput<HTMLElement>,
    type: string,
    data: Record<string, string | number | undefined>,
): void {
    trigger(el, createEvent(type, false, false, data));
}

// Use Promise.withResolvers() once it becomes baseline
export function withResolvers<T = void>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
} {
    let resolve!: (value: T | PromiseLike<T>) => void;
    const promise = new Promise<T>((resolver) => {
        resolve = resolver;
    });
    return { promise, resolve };
}

function isHtmlElement(value: HTMLElement | undefined): value is HTMLElement {
    return value instanceof HTMLElement;
}
