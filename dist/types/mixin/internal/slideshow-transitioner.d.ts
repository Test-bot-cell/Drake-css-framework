import type { ElementInput } from '../../types';
import type { SlideshowTransitioner, SlideshowTransitionOptions } from '../types';
export default function Transitioner(prev: HTMLElement | undefined, next: HTMLElement | undefined, dir: number, { animation, easing }: SlideshowTransitionOptions): SlideshowTransitioner;
export declare function triggerUpdate(el: ElementInput<HTMLElement>, type: string, data: Record<string, string | number | undefined>): void;
export declare function withResolvers<T = void>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
};
