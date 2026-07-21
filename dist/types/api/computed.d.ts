import type { ComponentInternalInstance, ComputedDefinition } from '../types';
export declare function initComputed(instance: ComponentInternalInstance): void;
export declare function registerComputed(instance: ComponentInternalInstance, key: string, definition: ComputedDefinition): void;
export declare function initComputedUpdates(instance: ComponentInternalInstance): void;
