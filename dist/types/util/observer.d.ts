import type { ElementInput, NodeInput } from '../types';
export declare function observeIntersection(targets: ElementInput, callback: IntersectionObserverCallback, options?: IntersectionObserverInit, { intersecting }?: {
    intersecting?: boolean;
}): IntersectionObserver;
export declare function observeResize(targets: ElementInput, callback: ResizeObserverCallback, options?: ResizeObserverOptions): ResizeObserver | {
    disconnect(): void;
};
export declare function observeViewportResize(callback: EventListener): {
    disconnect(): void;
};
export declare function observeMutation(targets: NodeInput, callback: MutationCallback, options?: MutationObserverInit): MutationObserver;
