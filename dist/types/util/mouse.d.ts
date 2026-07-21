import type { ElementInput } from '../types';
export declare class MouseTracker {
    private positions;
    private unbind?;
    private interval?;
    init(): void;
    cancel(): void;
    movesTo(target: ElementInput): boolean;
}
