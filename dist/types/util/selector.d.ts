import type { ElementInput } from '../types';
export type Selector = string | ElementInput<Element>;
export type QueryContext = Document | DocumentFragment | Element;
export declare function query<T extends Element = HTMLElement>(selector: Selector, context?: QueryContext): T | undefined;
export declare function queryAll<T extends Element = HTMLElement>(selector: Selector, context?: QueryContext): T[];
export declare function find<T extends Element = HTMLElement>(selector: Selector, context?: QueryContext): T | undefined;
export declare function findAll<T extends Element = HTMLElement>(selector: Selector, context?: QueryContext): T[];
export declare function escape(value: unknown): string;
