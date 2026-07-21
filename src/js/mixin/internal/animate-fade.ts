import {
    addClass,
    children,
    css,
    hasClass,
    height,
    isInView,
    isVisible,
    once,
    removeClass,
    resetProps,
    toNumber,
    Transition,
} from 'drake-util';
import { getRows } from '../../core/margin';
import { awaitTimeout } from '../../util/await';
import type { MixinAnimationAction } from '../animate';

const clsLeave = 'drk-transition-leave';
const clsEnter = 'drk-transition-enter';

export default function fade(
    action: MixinAnimationAction,
    target: HTMLElement,
    duration: number,
    stagger = 0,
): Promise<void> {
    const index = transitionIndex(target, true);
    const propsIn = { opacity: 1 };
    const propsOut = { opacity: 0 };

    const isCurrentIndex = () => index === transitionIndex(target);
    const wrapIndexFn = (fn: () => Promise<void>) => () =>
        isCurrentIndex() ? fn() : Promise.reject<void>();

    const leaveFn = wrapIndexFn(async () => {
        addClass(target, clsLeave);

        await (stagger
            ? getTransitionNodes(target).reduce(async (promise, child, i, array) => {
                  await promise;

                  if (!isInView(child) || !isCurrentIndex()) {
                      css(child, propsOut);
                      return;
                  }

                  await awaitTimeout(stagger);

                  const transition = Transition.start(child, propsOut, duration / 2, 'ease');
                  if (array.length - 1 === i) {
                      await transition;
                  }
              }, Promise.resolve())
            : Transition.start(target, propsOut, duration / 2, 'ease'));

        removeClass(target, clsLeave);
    });

    const enterFn = wrapIndexFn(async () => {
        const oldHeight = height(target);

        addClass(target, clsEnter);
        action();

        css(stagger ? children(target) : target, propsOut);

        // Ensure Drake updates have propagated (e.g. Grid needs to reset margin classes)
        height(target, oldHeight);
        await awaitTimeout();
        height(target, '');

        const newHeight = height(target);

        // Ensure Grid cells do not stretch when height is applied
        css(target, 'alignContent', 'flex-start');
        height(target, oldHeight);

        const transitions: Promise<unknown>[] = [];
        let targetDuration = duration / 2;
        if (stagger) {
            const nodes = getTransitionNodes(target);
            css(children(target), propsOut);

            transitions.push(
                nodes.reduce(async (promise, child, i, array) => {
                    await promise;

                    if (!isInView(child) || !isCurrentIndex()) {
                        resetProps(child, propsIn);
                        return;
                    }

                    await awaitTimeout(stagger);

                    const transition = Transition.start(child, propsIn, duration / 2, 'ease').then(
                        () => isCurrentIndex() && resetProps(child, propsIn),
                    );
                    if (array.length - 1 === i) {
                        await transition;
                    }
                }, Promise.resolve()),
            );

            targetDuration += nodes.length * stagger;
        }

        if (!stagger || oldHeight !== newHeight) {
            const targetProps = { height: newHeight, ...(stagger ? {} : propsIn) };
            transitions.push(Transition.start(target, targetProps, targetDuration, 'ease'));
        }

        await Promise.all(transitions);

        removeClass(target, clsEnter);
        if (isCurrentIndex()) {
            resetProps(target, { height: '', alignContent: '', ...propsIn });
            delete target.dataset.transition;
        }
    });

    return hasClass(target, clsLeave)
        ? waitTransitionend(target).then(enterFn)
        : hasClass(target, clsEnter)
          ? waitTransitionend(target).then(leaveFn).then(enterFn)
          : leaveFn().then(enterFn);
}

function transitionIndex(target: HTMLElement, next = false): number {
    if (next) {
        target.dataset.transition = String(1 + transitionIndex(target));
    }

    return toNumber(target.dataset.transition) || 0;
}

function waitTransitionend(target: HTMLElement): Promise<unknown[]> {
    return Promise.all(
        children(target)
            .filter(Transition.inProgress)
            .map(
                (el) =>
                    new Promise<unknown>((resolve) =>
                        once(el, 'transitionend transitioncanceled', resolve),
                    ),
            ),
    );
}

function getTransitionNodes(target: HTMLElement): HTMLElement[] {
    const rows: Element[][] = getRows(children(target));
    return rows
        .flat()
        .filter((node): node is HTMLElement => node instanceof HTMLElement && isVisible(node));
}
