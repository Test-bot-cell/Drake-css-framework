import type { ComponentConstructor, ComponentDefinition, ComponentInternalInstance, ComponentRegistry } from '../types';
export declare const components: ComponentRegistry;
export declare function component(name: string): ComponentConstructor;
export declare function component(name: string, options: ComponentDefinition): ComponentDefinition;
export declare function createComponent(name: string, element?: unknown, data?: unknown, ...args: unknown[]): ComponentInternalInstance | undefined;
export declare function getComponents(element?: Element | null): Record<string, ComponentInternalInstance>;
export declare function getComponent(element: Element, name: string): ComponentInternalInstance | undefined;
export declare function attachToElement(element: Element, instance: ComponentInternalInstance): void;
export declare function detachFromElement(element: Element, instance: ComponentInternalInstance): void;
