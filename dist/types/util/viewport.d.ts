import type { ElementInput, Rect } from '../types';
export declare function isInView(element: ElementInput, offsetTop?: number, offsetLeft?: number): boolean;
export declare function scrollIntoView(element: ElementInput, { offset: initialOffset }?: {
    offset?: number;
}): Promise<void>;
export declare function scrolledOver(element: ElementInput, startOffset?: number, endOffset?: number): number;
export declare function scrollParents(element: ElementInput, scrollable?: boolean, properties?: readonly string[]): HTMLElement[];
export declare function scrollParent(element: ElementInput, scrollable?: boolean, properties?: readonly string[]): HTMLElement;
export declare function overflowParents(element: ElementInput): HTMLElement[];
export declare function offsetViewport(scrollElement: unknown): Rect;
export declare function getCoveringElement(target?: ElementInput): Element | undefined;
