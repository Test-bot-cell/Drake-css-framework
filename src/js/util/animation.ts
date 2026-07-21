import type { CssProperties, ElementInput, FrameworkEvent } from '../types';
import { addClass, hasClass, removeClass, type ClassValue } from './class';
import { once, trigger } from './event';
import { toNodes } from './lang';
import { css, propName, resetProps } from './style';

const clsTransition = 'drk-transition';
const transitionEnd = 'transitionend';
const transitionCanceled = 'transitioncanceled';

function transition(
    input: ElementInput<HTMLElement>,
    properties: CssProperties,
    duration = 400,
    timing = 'linear',
    skipReflow = false,
): Promise<HTMLElement[]> {
    const roundedDuration = Math.round(duration);
    return Promise.all(
        toNodes(input).map(
            (element) =>
                new Promise<HTMLElement>((resolve, reject) => {
                    if (!skipReflow) {
                        void element.offsetHeight;
                    }
                    const timer = setTimeout(
                        () => trigger(element, transitionEnd),
                        roundedDuration,
                    );
                    const transitionProperties: CssProperties = {
                        transitionProperty: Object.keys(properties).map(propName).join(','),
                        transitionDuration: `${roundedDuration}ms`,
                        transitionTimingFunction: timing,
                    };
                    once(
                        element,
                        [transitionEnd, transitionCanceled],
                        ({ type }: FrameworkEvent) => {
                            clearTimeout(timer);
                            removeClass(element, clsTransition);
                            resetProps(element, transitionProperties);
                            if (type === transitionCanceled) {
                                reject(new Error(transitionCanceled));
                            } else {
                                resolve(element);
                            }
                        },
                        { self: true },
                    );
                    addClass(element, clsTransition);
                    css(element, { ...transitionProperties, ...properties });
                }),
        ),
    );
}

export const Transition = {
    start: transition,
    async stop(element: ElementInput): Promise<void> {
        trigger(element, transitionEnd);
        await Promise.resolve();
    },
    async cancel(element: ElementInput): Promise<void> {
        trigger(element, transitionCanceled);
        await Promise.resolve();
    },
    inProgress(element: ElementInput): boolean {
        return hasClass(element, clsTransition);
    },
};

const clsAnimation = 'drk-animation';
const animationEnd = 'animationend';
const animationCanceled = 'animationcanceled';

function animate(
    input: ElementInput<HTMLElement>,
    animation: string,
    duration = 200,
    origin?: string,
    out = false,
): Promise<HTMLElement[]> {
    return Promise.all(
        toNodes(input).map(
            (element) =>
                new Promise<HTMLElement>((resolve, reject) => {
                    if (hasClass(element, clsAnimation)) {
                        trigger(element, animationCanceled);
                    }
                    const classes: ClassValue[] = [
                        animation,
                        clsAnimation,
                        `${clsAnimation}-${out ? 'leave' : 'enter'}`,
                        origin && `drk-transform-origin-${origin}`,
                        out && `${clsAnimation}-reverse`,
                    ];
                    const timer = setTimeout(() => trigger(element, animationEnd), duration);
                    once(
                        element,
                        [animationEnd, animationCanceled],
                        ({ type }: FrameworkEvent) => {
                            clearTimeout(timer);
                            if (type === animationCanceled) {
                                reject(new Error(animationCanceled));
                            } else {
                                resolve(element);
                            }
                            css(element, 'animationDuration', '');
                            removeClass(element, classes);
                        },
                        { self: true },
                    );
                    css(element, 'animationDuration', `${duration}ms`);
                    addClass(element, classes);
                }),
        ),
    );
}

export const Animation = {
    in: animate,
    out(element: ElementInput<HTMLElement>, animation: string, duration?: number, origin?: string) {
        return animate(element, animation, duration, origin, true);
    },
    inProgress(element: ElementInput): boolean {
        return hasClass(element, clsAnimation);
    },
    cancel(element: ElementInput): void {
        trigger(element, animationCanceled);
    },
};
