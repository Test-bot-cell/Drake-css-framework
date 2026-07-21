import type { ComponentInternalInstance, ComponentValueMap, WatchDefinition } from '../types';
export declare function initWatches(instance: ComponentInternalInstance): void;
export declare function registerWatch(instance: ComponentInternalInstance, watch: WatchDefinition, name: string): void;
export declare function runWatches(instance: ComponentInternalInstance, values: ComponentValueMap): void;
