import { addClass, assign, matches, noop, on, removeClass, toArray, trigger } from 'uikit-util';
import { defineComponent } from '../api/options';
import I18n from '../mixin/i18n';
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

interface AjaxOptions {
    data: XMLHttpRequestBodyInit | Document | null;
    method: string;
    responseType: string;
    beforeSend(environment: AjaxEnvironment): unknown | Promise<unknown>;
}

export default defineComponent<UploadInstance>()({
    mixins: [I18n],

    i18n: {
        invalidMime: 'Invalid File Type: %s',
        invalidName: 'Invalid File Name: %s',
        invalidSize: 'Invalid File Size: %s Kilobytes Max',
    },

    props: {
        allow: String,
        clsDragover: String,
        concurrent: Number,
        maxSize: Number,
        method: String,
        mime: String,
        multiple: Boolean,
        name: String,
        params: Object,
        type: String,
        url: String,
    },

    data: {
        allow: false,
        clsDragover: 'uk-dragover',
        concurrent: 1,
        maxSize: 0,
        method: 'POST',
        mime: false,
        multiple: false,
        name: 'files[]',
        params: {},
        type: '',
        url: '',
        abort: noop,
        beforeAll: noop,
        beforeSend: noop,
        complete: noop,
        completeAll: noop,
        error: noop,
        fail: noop,
        load: noop,
        loadEnd: noop,
        loadStart: noop,
        progress: noop,
    },

    events: [
        {
            name: 'change',
            handler(e: FrameworkEvent) {
                if (
                    !(e.target instanceof HTMLInputElement) ||
                    !matches(e.target, 'input[type="file"]')
                ) {
                    return;
                }

                e.preventDefault();

                if (e.target.files) {
                    this.upload(e.target.files);
                }

                e.target.value = '';
            },
        },

        {
            name: 'drop',
            handler(e: FrameworkEvent) {
                stop(e);

                const transfer = e instanceof DragEvent ? e.dataTransfer : null;

                if (!transfer?.files) {
                    return;
                }

                removeClass(this.$el, this.clsDragover);

                this.upload(transfer.files);
            },
        },

        {
            name: 'dragenter',
            handler(e: FrameworkEvent) {
                stop(e);
            },
        },

        {
            name: 'dragover',
            handler(e: FrameworkEvent) {
                stop(e);
                addClass(this.$el, this.clsDragover);
            },
        },

        {
            name: 'dragleave',
            handler(e: FrameworkEvent) {
                stop(e);
                removeClass(this.$el, this.clsDragover);
            },
        },
    ],

    methods: {
        async upload(files: FileList | File[]) {
            files = toArray(files);

            if (!files.length) {
                return;
            }

            if (!this.multiple) {
                files = files.slice(0, 1);
            }

            trigger(this.$el, 'upload', [files]);

            for (const file of files) {
                if (this.maxSize && this.maxSize * 1000 < file.size) {
                    this.fail(this.t('invalidSize', String(this.maxSize)));
                    return;
                }

                if (this.allow && !match(this.allow, file.name)) {
                    this.fail(this.t('invalidName', this.allow));
                    return;
                }

                if (this.mime && !match(this.mime, file.type)) {
                    this.fail(this.t('invalidMime', this.mime));
                    return;
                }
            }

            this.beforeAll(this, files);

            const chunks = chunk(files, this.concurrent);
            const upload = async (currentFiles: File[]): Promise<void> => {
                const data = new FormData();

                currentFiles.forEach((file) => data.append(this.name, file));

                for (const key in this.params) {
                    const value = this.params[key];
                    data.append(key, value instanceof Blob ? value : String(value));
                }

                try {
                    const xhr = await ajax(this.url, {
                        data,
                        method: this.method,
                        responseType: this.type,
                        beforeSend: (env: AjaxEnvironment) => {
                            const { xhr } = env;
                            on(xhr.upload, 'progress', this.progress);
                            for (const type of uploadEventNames) {
                                on(xhr, type.toLowerCase(), this[type]);
                            }

                            return this.beforeSend(env);
                        },
                    });

                    this.complete(xhr);

                    const nextChunk = chunks.shift();
                    if (nextChunk) {
                        await upload(nextChunk);
                    } else {
                        this.completeAll(xhr);
                    }
                } catch (error) {
                    if (!(error instanceof Error) || error.name !== 'AbortError') {
                        this.error(error);
                    }
                }
            };

            const firstChunk = chunks.shift();
            if (firstChunk) {
                await upload(firstChunk);
            }
        },
    },
});

const uploadEventNames = ['loadStart', 'load', 'loadEnd', 'abort'] as const;

function match(pattern: string, path: string): RegExpMatchArray | null {
    return path.match(
        new RegExp(
            `^${pattern
                .replace(/\//g, '\\/')
                .replace(/\*\*/g, '(\\/[^\\/]+)*')
                .replace(/\*/g, '[^\\/]+')
                .replace(/((?!\\))\?/g, '$1.')}$`,
            'i',
        ),
    );
}

function chunk(files: File[], size: number): File[][] {
    const chunks: File[][] = [];
    for (let i = 0; i < files.length; i += size) {
        chunks.push(files.slice(i, i + size));
    }
    return chunks;
}

function stop(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
}

async function ajax(url: string, options: AjaxOptions): Promise<XMLHttpRequest> {
    const env: AjaxEnvironment = {
        url,
        headers: {},
        xhr: new XMLHttpRequest(),
        ...options,
    };
    if ((await env.beforeSend(env)) === false) {
        throw abortError(env.xhr);
    }

    return send(env.url, env);
}

function send(url: string, env: AjaxEnvironment): Promise<XMLHttpRequest> {
    return new Promise<XMLHttpRequest>((resolve, reject) => {
        const { xhr } = env;

        for (const prop in env) {
            if (prop in xhr) {
                try {
                    Reflect.set(xhr, prop, Reflect.get(env, prop));
                } catch {}
            }
        }

        xhr.open(env.method.toUpperCase(), url);

        for (const header in env.headers) {
            const value = env.headers[header];
            if (value !== undefined) {
                xhr.setRequestHeader(header, value);
            }
        }

        on(xhr, 'load', () => {
            if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                resolve(xhr);
            } else {
                reject(
                    assign(Error(xhr.statusText), {
                        xhr,
                        status: xhr.status,
                    }),
                );
            }
        });

        on(xhr, 'error', () => reject(assign(Error('Network Error'), { xhr })));
        on(xhr, 'timeout', () => reject(assign(Error('Network Timeout'), { xhr })));
        on(xhr, 'abort', () => reject(abortError(xhr)));

        xhr.send(env.data);
    });
}

function abortError(xhr: XMLHttpRequest): Error & { xhr: XMLHttpRequest } {
    return assign(Error('Network Abort'), { xhr, name: 'AbortError' });
}
