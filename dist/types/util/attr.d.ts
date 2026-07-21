import type { ElementInput } from '../types';
export type AttributeValue = string | number | boolean | null;
export type Attributes = Record<string, AttributeValue>;
export declare function attr(element: ElementInput, name: string): string | null | undefined;
export declare function attr(element: ElementInput, name: string, value: AttributeValue): void;
export declare function attr(element: ElementInput, attributes: Attributes): void;
export declare function hasAttr(element: ElementInput, name: string): boolean;
export declare function removeAttr(element: ElementInput, name: string): void;
export declare function data(element: ElementInput, attribute: string): string | null | undefined;
