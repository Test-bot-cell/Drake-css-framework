import type { ComponentInternalInstance, ComponentValueMap } from '../types';
type SourceAttributeValue = string | number | boolean | null;
type SourceAttributes = Record<string, SourceAttributeValue>;
type SourcesValue = string | SourceAttributes | SourceAttributes[] | false;
interface ImageInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & {
        target?: string;
    };
    dataSrc: string;
    sources: SourcesValue;
    margin: string;
    target: string | false;
    loading: string;
    img?: HTMLImageElement;
    load(): HTMLImageElement;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ImageInstance>;
export default _default;
export declare function wrapInPicture(img: HTMLImageElement, sources: SourcesValue): void;
