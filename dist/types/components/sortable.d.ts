import type { ComponentInternalInstance, FrameworkEvent, Point } from '../types';
interface SortableOrigin extends Point {
    target: Node;
    index: number;
    offsetTop?: number;
    offsetLeft?: number;
}
interface SortableInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    group: string | false;
    threshold: number;
    clsItem: string;
    clsPlaceholder: string;
    clsDrag: string;
    clsDragState: string;
    clsBase: string;
    clsNoDrag: string;
    clsEmpty: string;
    clsCustom: string;
    handle: string | false;
    pos: Point;
    target: HTMLElement;
    items: HTMLElement[];
    isEmpty: boolean;
    handles: HTMLElement[];
    drag: HTMLElement | null | undefined;
    placeholder: HTMLElement;
    origin: SortableOrigin;
    touched: Set<SortableInstance> | null;
    animate(action: () => unknown, target?: HTMLElement): Promise<void>;
    init(event: FrameworkEvent): void;
    start(event: FrameworkEvent): void;
    move(event: FrameworkEvent): void;
    end(): void;
    insert(element: HTMLElement, target?: Element | null): void;
    remove(element: HTMLElement): void;
    getSortable(element: Element | null): SortableInstance | undefined;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<SortableInstance>;
export default _default;
