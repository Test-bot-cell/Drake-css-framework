import {
    $,
    addClass,
    assign,
    css,
    hasClass,
    height,
    html,
    isString,
    isTag,
    noop,
    on,
    removeClass,
} from 'uikit-util';
import { defineComponent } from '../api/options';
import Modal from '../mixin/modal';
import type { ComponentInternalInstance, FrameworkEvent } from '../types';

interface ModalInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    panel: HTMLElement;
    isToggled(): boolean;
    hide(): Promise<unknown>;
    show(): Promise<unknown>;
}

interface DialogI18n {
    ok: string;
    cancel: string;
}

interface DialogOptions {
    bgClose?: boolean;
    escClose?: boolean;
    stack?: boolean;
    role?: string;
    i18n?: Partial<DialogI18n>;
    [key: string]: unknown;
}

type DialogMessage = string | Element;
type DialogPromise<T> = Promise<T> & { dialog: ModalInstance };

interface ModalFactory {
    (element: Element | undefined, options?: DialogOptions): ModalInstance;
    dialog(content: string, options?: DialogOptions): ModalInstance;
    alert(message: DialogMessage, options?: DialogOptions): DialogPromise<unknown>;
    confirm(message: DialogMessage, options?: DialogOptions): DialogPromise<unknown>;
    prompt(message: DialogMessage, value?: string, options?: DialogOptions): DialogPromise<unknown>;
    i18n: DialogI18n;
}

interface ModalInstaller {
    modal: ModalFactory;
}

export default defineComponent<ModalInstance>()({
    install,

    mixins: [Modal],

    data: {
        clsPage: 'uk-modal-page',
        selPanel: '.uk-modal-dialog',
        selClose: '[class*="uk-modal-close"]',
    },

    events: [
        {
            name: 'fullscreenchange webkitendfullscreen',

            capture: true,

            handler(e: FrameworkEvent<Element>) {
                if (isTag(e.target, 'video') && this.isToggled() && !document.fullscreenElement) {
                    this.hide();
                }
            },
        },

        {
            name: 'show',

            self: true,

            handler() {
                if (hasClass(this.panel, 'uk-margin-auto-vertical')) {
                    addClass(this.$el, 'uk-flex');
                } else {
                    css(this.$el, 'display', 'block');
                }

                height(this.$el); // force reflow
            },
        },

        {
            name: 'hidden',

            self: true,

            handler() {
                css(this.$el, 'display', '');
                removeClass(this.$el, 'uk-flex');
            },
        },
    ],
});

function install({ modal }: ModalInstaller): void {
    modal.dialog = function (content: string, options?: DialogOptions): ModalInstance {
        const dialog = modal($(`<div><div class="uk-modal-dialog">${content}</div></div>`), {
            stack: true,
            role: 'alertdialog',
            ...options,
        });

        dialog.show();

        on(
            dialog.$el,
            'hidden',
            async () => {
                await Promise.resolve();
                dialog.$destroy(true);
            },
            { self: true },
        );

        return dialog;
    };

    modal.alert = function (
        message: DialogMessage,
        options?: DialogOptions,
    ): DialogPromise<unknown> {
        return openDialog(
            ({ i18n }) => `<div class="uk-modal-body">${
                isString(message) ? message : html(message)
            }</div>
            <div class="uk-modal-footer uk-text-right">
                <button class="uk-button uk-button-primary uk-modal-close" type="button" autofocus>${
                    i18n.ok
                }</button>
            </div>`,
            options,
        );
    };

    modal.confirm = function (
        message: DialogMessage,
        options?: DialogOptions,
    ): DialogPromise<unknown> {
        return openDialog(
            ({ i18n }) => `<form>
                <div class="uk-modal-body">${isString(message) ? message : html(message)}</div>
                <div class="uk-modal-footer uk-text-right">
                    <button class="uk-button uk-button-default uk-modal-close" type="button">${
                        i18n.cancel
                    }</button>
                    <button class="uk-button uk-button-primary" autofocus>${i18n.ok}</button>
                </div>
            </form>`,
            options,
            () => Promise.reject(),
        );
    };

    modal.prompt = function (
        message: DialogMessage,
        value?: string,
        options?: DialogOptions,
    ): DialogPromise<unknown> {
        const promise = openDialog(
            ({ i18n }) => `<form class="uk-form-stacked">
                <div class="uk-modal-body">
                    <label>${isString(message) ? message : html(message)}</label>
                    <input class="uk-input" autofocus>
                </div>
                <div class="uk-modal-footer uk-text-right">
                    <button class="uk-button uk-button-default uk-modal-close" type="button">${
                        i18n.cancel
                    }</button>
                    <button class="uk-button uk-button-primary">${i18n.ok}</button>
                </div>
            </form>`,
            options,
            () => null,
            (dialog) => {
                const promptInput = $<HTMLInputElement>('input', dialog.$el);
                if (!promptInput) {
                    throw new Error('Modal prompt input is missing.');
                }
                return promptInput.value;
            },
        );

        const { $el } = promise.dialog;
        const inputElement = $<HTMLInputElement>('input', $el);
        if (!inputElement) {
            throw new Error('Modal prompt input is missing.');
        }
        const input = inputElement;
        input.value = value || '';
        on($el, 'show', () => input.select());

        return promise;
    };

    modal.i18n = {
        ok: 'Ok',
        cancel: 'Cancel',
    };

    function openDialog(
        tmpl: (options: DialogOptions & { i18n: DialogI18n }) => string,
        options?: DialogOptions,
        hideFn: () => unknown = noop,
        submitFn: (dialog: ModalInstance) => unknown = noop,
    ): DialogPromise<unknown> {
        const resolvedOptions: DialogOptions & { i18n: DialogI18n } = {
            bgClose: false,
            escClose: true,
            ...options,
            i18n: { ...modal.i18n, ...options?.i18n },
        };

        const dialog = modal.dialog(tmpl(resolvedOptions), resolvedOptions);

        return assign(
            new Promise<unknown>((resolve) => {
                const off = on(dialog.$el, 'hide', () => resolve(hideFn()));

                on(dialog.$el, 'submit', 'form', (e: FrameworkEvent) => {
                    e.preventDefault();
                    resolve(submitFn(dialog));
                    off();
                    dialog.hide();
                });
            }),
            { dialog },
        );
    }
}
