import type { ComponentInternalInstance } from '../types';
type HookName = 'created' | 'beforeConnect' | 'connected' | 'beforeDisconnect' | 'disconnected' | 'destroy';
export declare function callHook(instance: ComponentInternalInstance, hook: HookName): void;
export declare function callConnected(instance: ComponentInternalInstance): void;
export declare function callDisconnected(instance: ComponentInternalInstance): void;
export {};
