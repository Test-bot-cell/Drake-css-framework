import type { ElementInput } from '../types';
import { includes, isArray, isUndefined, toNodes } from './lang';

export type ClassValue = string | false | null | undefined | readonly ClassValue[];

export function addClass(element: ElementInput, ...classes: ClassValue[]): void {
    for (const node of toNodes(element)) {
        const additions = toClasses(classes).filter((className) => !hasClass(node, className));
        if (additions.length) {
            node.classList.add(...additions);
        }
    }
}

export function removeClass(element: ElementInput, ...classes: ClassValue[]): void {
    for (const node of toNodes(element)) {
        const removals = toClasses(classes).filter((className) => hasClass(node, className));
        if (removals.length) {
            node.classList.remove(...removals);
        }
    }
}

export function replaceClass(
    element: ElementInput,
    oldClass: ClassValue,
    newClass: ClassValue,
): void {
    const newClasses = toClasses(newClass);
    const oldClasses = toClasses(oldClass).filter((className) => !includes(newClasses, className));
    removeClass(element, oldClasses);
    addClass(element, newClasses);
}

export function hasClass(element: ElementInput, value: ClassValue): boolean {
    const [className] = toClasses(value);
    return Boolean(
        className && toNodes(element).some((node) => node.classList.contains(className)),
    );
}

export function toggleClass(element: ElementInput, value: ClassValue, force?: boolean): void {
    const classes = toClasses(value);
    const toggle = isUndefined(force) ? undefined : Boolean(force);
    for (const node of toNodes(element)) {
        for (const className of classes) {
            node.classList.toggle(className, toggle);
        }
    }
}

function toClasses(value: ClassValue): string[] {
    if (!value) {
        return [];
    }
    return isArray(value)
        ? value.flatMap((item) => toClasses(item as ClassValue))
        : String(value).split(' ').filter(Boolean);
}
