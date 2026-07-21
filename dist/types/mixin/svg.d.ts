import type { ComponentInternalInstance } from '../types';
interface SvgInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    width?: number;
    height?: number;
    ratio: number;
    svg: Promise<Element | undefined> | null;
    svgEl: Element | null;
    getSvg(): Promise<Element | undefined>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<SvgInstance>;
export default _default;
export declare function parseSVG(svg: string, icon?: string): Element | undefined;
