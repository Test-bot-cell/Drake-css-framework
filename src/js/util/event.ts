import type { EventListenerOptions, EventTargetInput, FrameworkEvent, Point } from '../types';
import { isArray, isString, toNode, toNodes } from './lang';
import { findAll } from './selector';

export type FrameworkListener<E extends FrameworkEvent = FrameworkEvent> = (
    event: E,
    ...detail: unknown[]
) => unknown;
type Capture = boolean | EventListenerOptions;

export function on<E extends FrameworkEvent = FrameworkEvent>(
    targets: EventTargetInput,
    types: string | readonly string[],
    listener: FrameworkListener<E>,
    capture?: Capture,
): () => void;
export function on<E extends FrameworkEvent = FrameworkEvent>(
    targets: EventTargetInput,
    types: string | readonly string[],
    selector: string | false,
    listener: FrameworkListener<E>,
    capture?: Capture,
): () => void;
export function on<E extends FrameworkEvent = FrameworkEvent>(
    targets: EventTargetInput,
    types: string | readonly string[],
    selectorOrListener: string | false | FrameworkListener<E>,
    listenerOrCapture?: FrameworkListener<E> | Capture,
    capture: Capture = false,
): () => void {
    const selector = typeof selectorOrListener === 'function' ? false : selectorOrListener;
    const suppliedListener =
        typeof selectorOrListener === 'function' ? selectorOrListener : listenerOrCapture;
    const options =
        typeof selectorOrListener === 'function'
            ? (listenerOrCapture as Capture | undefined)
            : capture;
    if (typeof suppliedListener !== 'function') {
        return () => undefined;
    }

    let listener = suppliedListener as FrameworkListener;
    if (listener.length > 1) {
        listener = withDetail(listener);
    }
    if (typeof options === 'object' && options.self) {
        listener = selfFilter(listener);
    }
    if (selector) {
        listener = delegate(selector, listener);
    }

    const eventTargets = toEventTargets(targets);
    const eventTypes = isString(types) ? types.split(' ') : [...types];
    const domListener: EventListener = (event) => {
        listener(event as FrameworkEvent);
    };
    const domOptions = normalizeOptions(options);
    for (const type of eventTypes) {
        for (const target of eventTargets) {
            target.addEventListener(type, domListener, domOptions);
        }
    }
    return () => off(eventTargets, eventTypes, domListener, domOptions);
}

export function off(
    targets: EventTargetInput,
    types: string | readonly string[],
    listener: EventListener,
    capture: boolean | EventListenerOptions = false,
): void {
    const eventTypes = isString(types) ? types.split(' ') : types;
    const options = normalizeOptions(capture);
    for (const type of eventTypes) {
        for (const target of toEventTargets(targets)) {
            target.removeEventListener(type, listener, options);
        }
    }
}

export function once<E extends FrameworkEvent = FrameworkEvent>(
    targets: EventTargetInput,
    types: string | readonly string[],
    listener: FrameworkListener<E>,
    capture?: Capture,
    condition?: (event: E) => unknown,
): () => void;
export function once<E extends FrameworkEvent = FrameworkEvent>(
    targets: EventTargetInput,
    types: string | readonly string[],
    selector: string | false,
    listener: FrameworkListener<E>,
    capture?: Capture,
    condition?: (event: E) => unknown,
): () => void;
export function once<E extends FrameworkEvent = FrameworkEvent>(
    targets: EventTargetInput,
    types: string | readonly string[],
    selectorOrListener: string | false | FrameworkListener<E>,
    listenerOrCapture?: FrameworkListener<E> | Capture,
    captureOrCondition?: Capture | ((event: E) => unknown),
    maybeCondition?: (event: E) => unknown,
): () => void {
    const selector = typeof selectorOrListener === 'function' ? false : selectorOrListener;
    const listener =
        typeof selectorOrListener === 'function' ? selectorOrListener : listenerOrCapture;
    const capture =
        typeof selectorOrListener === 'function'
            ? (listenerOrCapture as Capture | undefined)
            : (captureOrCondition as Capture | undefined);
    const condition =
        typeof selectorOrListener === 'function'
            ? (captureOrCondition as ((event: E) => unknown) | undefined)
            : maybeCondition;
    if (typeof listener !== 'function') {
        return () => undefined;
    }

    let teardown: () => void = () => undefined;
    teardown = on(
        targets,
        types,
        selector,
        ((event: E) => {
            const result = condition?.(event) ?? true;
            if (result) {
                teardown();
                listener(event, result);
            }
        }) as FrameworkListener,
        capture,
    );
    return teardown;
}

export function trigger(
    targets: EventTargetInput,
    event: string | Event,
    detail?: unknown,
): boolean {
    return toEventTargets(targets)
        .map((target) => target.dispatchEvent(createEvent(event, true, true, detail)))
        .every(Boolean);
}

export function createEvent(
    event: string | Event,
    bubbles = true,
    cancelable = false,
    detail?: unknown,
): Event {
    return isString(event) ? new CustomEvent(event, { bubbles, cancelable, detail }) : event;
}

function delegate(selector: string, listener: FrameworkListener): FrameworkListener {
    return (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }
        const currentTarget = event.currentTarget;
        const current =
            selector[0] === '>'
                ? isQueryContext(currentTarget)
                    ? findAll(selector, currentTarget)
                          .reverse()
                          .find((element) => element.contains(event.target as Node))
                    : undefined
                : event.target.closest(selector);
        if (current) {
            event.current = current;
            listener(event);
            delete event.current;
        }
    };
}

function isQueryContext(value: unknown): value is Document | DocumentFragment | Element {
    return value !== null && typeof value === 'object' && 'querySelectorAll' in value;
}

function withDetail(listener: FrameworkListener): FrameworkListener {
    return (event) => (isArray(event.detail) ? listener(event, ...event.detail) : listener(event));
}

function selfFilter(listener: FrameworkListener): FrameworkListener {
    return (event) => {
        if (event.target === event.currentTarget || event.target === event.current) {
            return listener(event);
        }
    };
}

function normalizeOptions(capture: Capture | undefined): boolean | AddEventListenerOptions {
    if (typeof capture !== 'object' || capture === null) {
        return capture ?? false;
    }
    const options = { ...capture };
    delete options.self;
    return options;
}

function isEventTarget(target: unknown): target is EventTarget {
    return target !== null && typeof target === 'object' && 'addEventListener' in target;
}

export function toEventTargets(target: EventTargetInput): EventTarget[] {
    if (isString(target)) {
        return findAll(target);
    }
    if (isEventTarget(target)) {
        return [target];
    }
    if (isArray(target)) {
        return target
            .map((item) => (isEventTarget(item) ? item : toNode(item)))
            .filter(isEventTarget);
    }
    return toNodes(target).filter(isEventTarget);
}

export function isTouch(event: unknown): boolean {
    return (
        event !== null &&
        typeof event === 'object' &&
        (('pointerType' in event && event.pointerType === 'touch') ||
            ('touches' in event && Boolean(event.touches)))
    );
}

export function getEventPos(event: FrameworkEvent | MouseEvent | TouchEvent): Point {
    const touch =
        'touches' in event
            ? (event.touches?.[0] ??
              ('changedTouches' in event ? event.changedTouches[0] : undefined))
            : undefined;
    const source = touch ?? event;
    return {
        x: 'clientX' in source && typeof source.clientX === 'number' ? source.clientX : 0,
        y: 'clientY' in source && typeof source.clientY === 'number' ? source.clientY : 0,
    };
}
