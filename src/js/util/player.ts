import type { ElementInput, UnknownRecord } from '../types';
import { isTag } from './dom';
import { once } from './event';
import { includes, isObject, noop } from './lang';

interface PlayerFrame extends HTMLIFrameElement {
    _ukPlayer?: Promise<void>;
}

interface PlayerCommand extends UnknownRecord {
    func?: string;
    method?: string;
    value?: number;
    event?: string;
    id?: number;
}

export function play(element: ElementInput): void {
    const node = firstElement(element);
    if (isIFrame(node)) {
        void call(node, { func: 'playVideo', method: 'play' });
    }
    if (isHTML5(node)) {
        node.play().catch(noop);
    }
}

export function pause(element: ElementInput): void {
    const node = firstElement(element);
    if (isIFrame(node) && node._ukPlayer) {
        void call(node, { func: 'pauseVideo', method: 'pause' });
    }
    if (isHTML5(node)) {
        node.pause();
    }
}

export function mute(element: ElementInput): void {
    const node = firstElement(element);
    if (isIFrame(node)) {
        void call(node, { func: 'mute', method: 'setVolume', value: 0 });
    }
    if (isHTML5(node)) {
        node.muted = true;
    }
}

function firstElement(element: ElementInput): Element | undefined {
    if (element instanceof Element) {
        return element;
    }
    return Array.from(element ?? []).find((item): item is Element => item instanceof Element);
}

function isHTML5(element: Element | undefined): element is HTMLVideoElement {
    return element instanceof HTMLVideoElement || isTag(element, 'video');
}

function isIFrame(element: Element | undefined): element is PlayerFrame {
    return (
        (element instanceof HTMLIFrameElement || isTag(element, 'iframe')) &&
        isFrameProvider(element)
    );
}

function isFrameProvider(element: Element | undefined): element is PlayerFrame {
    return element instanceof HTMLIFrameElement && (isYoutube(element) || isVimeo(element));
}

function isYoutube(element: HTMLIFrameElement): boolean {
    return /\/\/.*?youtube(-nocookie)?\.[a-z]+\/(watch\?v=[^&\s]+|embed)|youtu\.be\/.*/.test(
        element.src,
    );
}

function isVimeo(element: HTMLIFrameElement): boolean {
    return /vimeo\.com\/video\/.*/.test(element.src);
}

async function call(element: PlayerFrame, command: PlayerCommand): Promise<void> {
    await enableApi(element);
    post(element, command);
}

function post(element: PlayerFrame, command: PlayerCommand): void {
    element.contentWindow?.postMessage(JSON.stringify({ event: 'command', ...command }), '*');
}

let counter = 0;
function enableApi(element: PlayerFrame): Promise<void> {
    if (element._ukPlayer) {
        return element._ukPlayer;
    }
    const youtube = isYoutube(element);
    const vimeo = isVimeo(element);
    const id = ++counter;
    let poller: ReturnType<typeof setInterval> | undefined;

    element._ukPlayer = new Promise<void>((resolve) => {
        if (youtube) {
            once(element, 'load', () => {
                const listener = () => post(element, { event: 'listening', id });
                poller = setInterval(listener, 100);
                listener();
            });
        }

        once(
            window,
            'message',
            () => resolve(),
            false,
            (event) => {
                if (!(event instanceof MessageEvent) || typeof event.data !== 'string') {
                    return false;
                }
                try {
                    const data: unknown = JSON.parse(event.data);
                    return (
                        isObject(data) &&
                        ((youtube && data.id === id && data.event === 'onReady') ||
                            (vimeo && Number(data.player_id) === id))
                    );
                } catch {
                    return false;
                }
            },
        );

        element.src = `${element.src}${includes(element.src, '?') ? '&' : '?'}${
            youtube ? 'enablejsapi=1' : `api=1&player_id=${id}`
        }`;
    }).then(() => {
        if (poller) {
            clearInterval(poller);
        }
    });

    return element._ukPlayer;
}
