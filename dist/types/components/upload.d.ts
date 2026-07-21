import type { ComponentInternalInstance, FrameworkEvent } from '../types';
type EventCallback = (event: FrameworkEvent) => unknown;
interface UploadInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    allow: string | false;
    clsDragover: string;
    concurrent: number;
    maxSize: number;
    method: string;
    mime: string | false;
    multiple: boolean;
    name: string;
    params: Record<string, unknown>;
    type: string;
    url: string;
    abort: EventCallback;
    beforeAll(instance: UploadInstance, files: File[]): unknown;
    beforeSend(environment: AjaxEnvironment): unknown;
    complete(xhr: XMLHttpRequest): unknown;
    completeAll(xhr: XMLHttpRequest): unknown;
    error(error: unknown): unknown;
    fail(message: string): unknown;
    load: EventCallback;
    loadEnd: EventCallback;
    loadStart: EventCallback;
    progress: EventCallback;
    t(key: string, ...params: string[]): string;
    upload(files: FileList | File[]): Promise<void>;
}
interface AjaxEnvironment {
    url: string;
    data: XMLHttpRequestBodyInit | Document | null;
    method: string;
    headers: Record<string, string>;
    xhr: XMLHttpRequest;
    beforeSend(environment: AjaxEnvironment): unknown | Promise<unknown>;
    responseType: string;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<UploadInstance>;
export default _default;
