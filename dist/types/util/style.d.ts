import type { CssProperties, CssValue, ElementInput } from '../types';
type StylableElement = HTMLElement | SVGElement;
export declare function css(element: ElementInput, property: string): string;
export declare function css(element: ElementInput, properties: readonly string[]): Record<string, string>;
export declare function css(element: ElementInput, property: string, value: CssValue, priority?: string): StylableElement | undefined;
export declare function css(element: ElementInput, properties: CssProperties, priority?: string): StylableElement | undefined;
export declare function resetProps(element: ElementInput, properties: CssProperties): void;
export declare const propName: (key: string) => string;
export {};
