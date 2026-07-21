import type { CssProperties, ElementInput } from '../types';
declare function transition(input: ElementInput<HTMLElement>, properties: CssProperties, duration?: number, timing?: string, skipReflow?: boolean): Promise<HTMLElement[]>;
export declare const Transition: {
    start: typeof transition;
    stop(element: ElementInput): Promise<void>;
    cancel(element: ElementInput): Promise<void>;
    inProgress(element: ElementInput): boolean;
};
declare function animate(input: ElementInput<HTMLElement>, animation: string, duration?: number, origin?: string, out?: boolean): Promise<HTMLElement[]>;
export declare const Animation: {
    in: typeof animate;
    out(element: ElementInput<HTMLElement>, animation: string, duration?: number, origin?: string): Promise<HTMLElement[]>;
    inProgress(element: ElementInput): boolean;
    cancel(element: ElementInput): void;
};
export {};
