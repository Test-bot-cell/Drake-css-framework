import type { Coordinates, Dimension, ElementInput, Rect } from '../types';
export declare function dimensions(element: unknown): Rect;
export declare function offset(element: unknown): Rect;
export declare function offset(element: ElementInput, coordinates: Coordinates): void;
export declare function position(element: ElementInput): Coordinates;
export declare function offsetPosition(element: ElementInput): [number, number];
export interface DimensionFunction {
    (element: unknown): number;
    (element: ElementInput, value: string | number | null): Element | undefined;
}
export declare const height: DimensionFunction;
export declare const width: DimensionFunction;
export declare function boxModelAdjust(element: ElementInput, property: Dimension, sizing?: string): number;
export declare function flipPosition(position: string): string;
export declare function toPx(value: unknown, property?: Dimension, element?: Element | Window, offsetDimension?: boolean): number;
