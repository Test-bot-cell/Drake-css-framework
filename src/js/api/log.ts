import type { ComponentInternalInstance } from '../types';

export function log(
    instance: ComponentInternalInstance,
    eventName: string,
    eventData: Iterable<unknown> = [],
): void {
    console.log(
        `🔔 %s:%d %c%s`,
        instance.$options.name,
        instance._uid,
        'font-weight:bold;',
        eventName,
        [...eventData, instance, instance.$el],
    );
}
