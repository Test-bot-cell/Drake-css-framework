import type { ComponentInternalInstance, ComponentUpdate } from '../types';
export declare function initUpdates(instance: ComponentInternalInstance): void;
export declare function prependUpdate(instance: ComponentInternalInstance, update: ComponentUpdate): void;
export declare function callUpdate(instance: ComponentInternalInstance, event?: string | Event): void;
