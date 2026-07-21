import type { FrameworkEvent } from '../types';

export function maybeDefaultPreventClick(e: FrameworkEvent<Element>): void {
    if (e.target?.closest('a[href="#"],a[href=""]')) {
        e.preventDefault();
    }
}
