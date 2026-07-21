import type { ComponentInternalInstance } from '../types';
interface MarginInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    margin: string;
    firstColumn: string;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<MarginInstance>;
export default _default;
export declare function getRows(elements: Element[]): HTMLElement[][];
