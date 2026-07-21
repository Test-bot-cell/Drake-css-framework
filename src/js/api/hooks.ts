import LOG from 'virtual:log';
import type { ComponentHook, ComponentHookOption, ComponentInternalInstance } from '../types';
import { initComputedUpdates } from './computed';
import { initEvents } from './events';
import { log } from './log';
import { initObservers } from './observer';
import { initProps, initPropsObserver } from './props';
import { callUpdate, initUpdates } from './update';
import { initWatches } from './watch';

type HookName =
    'created' | 'beforeConnect' | 'connected' | 'beforeDisconnect' | 'disconnected' | 'destroy';

export function callHook(instance: ComponentInternalInstance, hook: HookName): void {
    if (LOG) {
        log(instance, hook);
    }
    for (const handler of normalizeHooks(instance.$options[hook])) {
        (handler as (this: ComponentInternalInstance) => unknown).call(instance);
    }
}

export function callConnected(instance: ComponentInternalInstance): void {
    if (instance._connected) {
        return;
    }
    initProps(instance);
    callHook(instance, 'beforeConnect');
    instance._connected = true;
    instance._disconnect = [];
    initEvents(instance);
    initUpdates(instance);
    initWatches(instance);
    initObservers(instance);
    initPropsObserver(instance);
    initComputedUpdates(instance);
    callHook(instance, 'connected');
    callUpdate(instance);
}

export function callDisconnected(instance: ComponentInternalInstance): void {
    if (!instance._connected) {
        return;
    }
    callHook(instance, 'beforeDisconnect');
    instance._disconnect?.forEach((off) => off());
    instance._disconnect = null;
    callHook(instance, 'disconnected');
    instance._connected = false;
}

function normalizeHooks(value: ComponentHookOption | undefined): readonly ComponentHook[] {
    return value ? (Array.isArray(value) ? value : [value as ComponentHook]) : [];
}
