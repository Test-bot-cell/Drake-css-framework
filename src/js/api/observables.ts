import {
    $$,
    getEventPos,
    isFunction,
    isTouch,
    observeIntersection,
    observeMutation,
    observeResize,
    observeViewportResize,
    on,
    once,
    pointerCancel,
    pointerDown,
    pointerUp,
    removeAttr,
    scrollParent,
    toNodes,
    trigger,
} from 'drake-util';
import type {
    ComponentInternalInstance,
    ComponentObservable,
    ElementInput,
    FrameworkEvent,
    GenericFunction,
    NodeInput,
    ObservableHandle,
} from '../types';
import { callUpdate } from './update';

export interface ObservableOptions<
    I extends ComponentInternalInstance,
    Records,
    Handle extends ObservableHandle,
> {
    target?: NodeInput | ((this: I, instance: I) => NodeInput);
    handler?: (this: I, records: Records, observer: Handle) => unknown;
    options?: unknown | ((this: I, instance: I) => unknown);
    filter?: (this: I, instance: I) => boolean;
    args?: unknown;
}

type ObserveAdapter<Records, Handle extends ObservableHandle> = (
    target: NodeInput,
    handler: (records: Records, observer: Handle) => unknown,
    options?: unknown,
    args?: unknown,
) => Handle;

export function resize<I extends ComponentInternalInstance = ComponentInternalInstance>(
    options: ObservableOptions<I, ResizeObserverEntry[], ObservableHandle<Element>> = {},
): ComponentObservable {
    return createObservable(
        (target, handler, observerOptions) => {
            const callback: ResizeObserverCallback = (entries, observer) =>
                handler(entries, observer);
            return observeResize(
                toElementInput(target),
                callback,
                isResizeOptions(observerOptions) ? observerOptions : undefined,
            );
        },
        options,
        'resize',
    );
}

export function intersection<I extends ComponentInternalInstance = ComponentInternalInstance>(
    options: ObservableOptions<I, IntersectionObserverEntry[], IntersectionObserver> = {},
): ComponentObservable {
    return createObservable(
        (target, handler, observerOptions, args) =>
            observeIntersection(
                toElementInput(target),
                (entries, observer) => handler(entries, observer),
                isIntersectionOptions(observerOptions) ? observerOptions : undefined,
                isIntersectionArgs(args) ? args : undefined,
            ),
        options,
    );
}

export function mutation<I extends ComponentInternalInstance = ComponentInternalInstance>(
    options: ObservableOptions<I, MutationRecord[], MutationObserver> = {},
): ComponentObservable {
    return createObservable(
        (target, handler, observerOptions) =>
            observeMutation(
                target,
                (records, observer) => handler(records, observer),
                isMutationOptions(observerOptions) ? observerOptions : undefined,
            ),
        options,
    );
}

interface LazyloadOptions<I extends ComponentInternalInstance> extends ObservableOptions<
    I,
    IntersectionObserverEntry[],
    IntersectionObserver
> {
    targets?: ElementInput | ((instance: I) => ElementInput);
    preload?: number;
}

export function lazyload<I extends ComponentInternalInstance = ComponentInternalInstance>(
    options: LazyloadOptions<I> = {},
): ComponentObservable {
    return intersection<I>({
        ...options,
        handler(this: I, entries, observer) {
            const targets = isFunction(options.targets)
                ? options.targets(this)
                : (options.targets ?? this.$el);
            for (const element of toNodes(targets).filter(
                (node): node is Element => node instanceof Element,
            )) {
                $$('[loading="lazy"]', element)
                    .slice(0, (options.preload ?? 5) - 1)
                    .forEach((item) => removeAttr(item, 'loading'));
            }
            for (const element of entries
                .filter(({ isIntersecting }) => isIntersecting)
                .map(({ target }) => target)) {
                observer.unobserve(element);
            }
        },
    });
}

export function viewport<I extends ComponentInternalInstance = ComponentInternalInstance>(
    options: ObservableOptions<I, FrameworkEvent, ObservableHandle> = {},
): ComponentObservable {
    return createObservable(
        (_target, handler) => ({
            disconnect: observeViewportResize((event) =>
                handler(event as FrameworkEvent, emptyHandle),
            ).disconnect,
        }),
        options,
        'resize',
    );
}

export function scroll<I extends ComponentInternalInstance = ComponentInternalInstance>(
    options: ObservableOptions<I, FrameworkEvent, ObservableHandle> = {},
): ComponentObservable {
    return createObservable(
        (target, handler) => {
            const handle: ObservableHandle = {
                disconnect: on(
                    toScrollTargets(target),
                    'scroll',
                    (event) => handler(event, handle),
                    { passive: true },
                ),
            };
            return handle;
        },
        options,
        'scroll',
    );
}

export function swipe<I extends ComponentInternalInstance = ComponentInternalInstance>(
    options: ObservableOptions<I, FrameworkEvent, ObservableHandle> = {},
): ComponentObservable {
    const observable: ComponentObservable = {
        observe: ((target: NodeInput, handler: (event: FrameworkEvent) => unknown) => ({
            observe() {},
            unobserve() {},
            disconnect: on(target, pointerDown, handler, { passive: true }),
        })) as GenericFunction,
        handler: function (this: I, event: FrameworkEvent) {
            if (!isTouch(event)) {
                return;
            }
            const position = getEventPos(event);
            const target = event.target instanceof Element ? event.target : undefined;
            once(document, `${pointerUp} ${pointerCancel} scroll`, (endEvent) => {
                const end = getEventPos(endEvent);
                if (
                    (endEvent.type !== 'scroll' &&
                        target &&
                        end.x !== 0 &&
                        Math.abs(position.x - end.x) > 100) ||
                    (end.y !== 0 && Math.abs(position.y - end.y) > 100)
                ) {
                    setTimeout(() => {
                        trigger(target, 'swipe');
                        trigger(
                            target,
                            `swipe${swipeDirection(position.x, position.y, end.x, end.y)}`,
                        );
                    });
                }
            });
        } as GenericFunction,
        ...options,
    };
    return observable;
}

function createObservable<
    I extends ComponentInternalInstance,
    Records,
    Handle extends ObservableHandle,
>(
    observe: ObserveAdapter<Records, Handle>,
    options: ObservableOptions<I, Records, Handle>,
    emit?: string,
): ComponentObservable {
    return {
        observe: observe as GenericFunction,
        handler: function (this: ComponentInternalInstance) {
            callUpdate(this, emit);
        } as GenericFunction,
        ...options,
    };
}

function swipeDirection(x1: number, y1: number, x2: number, y2: number): string {
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2)
        ? x1 - x2 > 0
            ? 'Left'
            : 'Right'
        : y1 - y2 > 0
          ? 'Up'
          : 'Down';
}

function toScrollTargets(elements: NodeInput): EventTarget[] {
    return toNodes(elements).flatMap((node): EventTarget[] => {
        const parentElement = scrollParent(node instanceof Element ? node : undefined, true);
        const target =
            parentElement === node.ownerDocument?.scrollingElement
                ? node.ownerDocument
                : parentElement;
        return target ? [target] : [];
    });
}

function toElementInput(target: NodeInput): ElementInput {
    return toNodes(target).filter((node): node is Element => node instanceof Element);
}

function isResizeOptions(value: unknown): value is ResizeObserverOptions {
    return typeof value === 'object' && value !== null;
}

function isIntersectionOptions(value: unknown): value is IntersectionObserverInit {
    return typeof value === 'object' && value !== null;
}

function isMutationOptions(value: unknown): value is MutationObserverInit {
    return typeof value === 'object' && value !== null;
}

function isIntersectionArgs(value: unknown): value is { intersecting?: boolean } {
    return typeof value === 'object' && value !== null;
}

const emptyHandle: ObservableHandle = { disconnect() {} };
