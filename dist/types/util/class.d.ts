import type { ElementInput } from '../types';
export type ClassValue = string | false | null | undefined | readonly ClassValue[];
export declare function addClass(element: ElementInput, ...classes: ClassValue[]): void;
export declare function removeClass(element: ElementInput, ...classes: ClassValue[]): void;
export declare function replaceClass(element: ElementInput, oldClass: ClassValue, newClass: ClassValue): void;
export declare function hasClass(element: ElementInput, value: ClassValue): boolean;
export declare function toggleClass(element: ElementInput, value: ClassValue, force?: boolean): void;
