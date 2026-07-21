import type { ComponentInternalInstance, ComponentValueMap, ObservableHandle } from '../types';
import { type DropInstance } from './drop';
type DropnavSelector = boolean | string | Element;
interface DropnavInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & {
        dropbar?: unknown;
    };
    align: string;
    boundary: DropnavSelector;
    dropbarAnchor: HTMLElement;
    dropbar: HTMLElement | null;
    dropContainer: Element;
    dropdowns: HTMLElement[];
    items: HTMLElement[];
    duration: number;
    container: Element | false | '' | undefined;
    clsDrop: string;
    clsDropbar: string;
    selNavItem: string;
    flip: boolean;
    target: DropnavSelector;
    targetY: DropnavSelector;
    _dropbar?: HTMLElement;
    _observer?: ObservableHandle<Element>;
    getActive(): DropInstance | undefined;
    transitionTo(newHeight: number, element?: HTMLElement): Promise<void>;
    getDropdown(element: Element): DropInstance | undefined;
    isDropbarDrop(element: Element): boolean;
    getDropbarOffset(offsetTop: number): number;
    initializeDropdowns(): void;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<DropnavInstance>;
export default _default;
