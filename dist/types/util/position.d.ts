import type { Side } from '../types';
type Direction = Side | 'center';
type Attach = [Direction, Direction];
type Placement = 'flip' | 'shift' | undefined;
type Pair<T> = [T, T];
export interface PositionOptions {
    attach?: {
        element?: Attach;
        target?: Attach;
    };
    offset?: Pair<number>;
    placement?: Pair<Placement>;
    boundary?: Element | Pair<Element>;
    recursion?: boolean;
}
export declare function positionAt(element: Element, target: Element | Pair<Element>, options?: PositionOptions): void;
export {};
