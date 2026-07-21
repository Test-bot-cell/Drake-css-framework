import type { ElementInput, NodeInput } from '../types';
import { inBrowser } from './env';
import { on } from './event';
import { toNodes } from './lang';

export function observeIntersection(
    targets: ElementInput,
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
    { intersecting = true }: { intersecting?: boolean } = {},
): IntersectionObserver {
    const observer = new IntersectionObserver(
        intersecting
            ? (entries, currentObserver) => {
                  if (entries.some((entry) => entry.isIntersecting)) {
                      callback(entries, currentObserver);
                  }
              }
            : callback,
        options,
    );
    for (const element of toNodes(targets)) {
        observer.observe(element);
    }
    return observer;
}

export function observeResize(
    targets: ElementInput,
    callback: ResizeObserverCallback,
    options: ResizeObserverOptions = { box: 'border-box' },
): ResizeObserver | { disconnect(): void } {
    if (inBrowser && window.ResizeObserver) {
        const observer = new ResizeObserver(callback);
        for (const element of toNodes(targets)) {
            observer.observe(element, options);
        }
        return observer;
    }
    const notify = () => callback([], emptyResizeObserver);
    const off = [
        on(window, 'load resize', notify),
        on(document, 'loadedmetadata load', notify, true),
    ];
    return { disconnect: () => off.forEach((teardown) => teardown()) };
}

export function observeViewportResize(callback: EventListener): { disconnect(): void } {
    const targets: EventTarget[] = window.visualViewport
        ? [window, window.visualViewport]
        : [window];
    return { disconnect: on(targets, 'resize', () => callback(new Event('resize'))) };
}

const emptyResizeObserver: ResizeObserver = {
    disconnect() {},
    observe() {},
    unobserve() {},
};

export function observeMutation(
    targets: NodeInput,
    callback: MutationCallback,
    options: MutationObserverInit = {},
): MutationObserver {
    const observer = new MutationObserver(callback);
    for (const node of toNodes(targets)) {
        observer.observe(node, options);
    }
    return observer;
}
