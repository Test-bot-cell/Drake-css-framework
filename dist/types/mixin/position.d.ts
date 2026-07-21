import type { Axis, ComponentInternalInstance, ComponentValueMap, Side } from '../types';
type Direction = Side | 'center';
type Attach = [Direction, Direction];
type PositionTarget = Element | [Element, Element];
interface PositionInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & {
        pos: string;
    };
    pos: Attach;
    dir: Direction;
    align: Direction;
    axis: Axis;
    offset: boolean | number | string;
    flip: boolean;
    shift: boolean;
    inset: boolean;
    positionAt(element: Element, target: PositionTarget, boundary?: Element | [Element, Element]): void;
    getPositionOffset(element?: Element): number;
    getShiftOffset(element?: Element): number;
    getViewportOffset(element: Element): number;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<PositionInstance>;
export default _default;
export declare function storeScrollPosition(element: Element): () => void;
