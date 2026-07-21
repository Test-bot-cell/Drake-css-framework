import {
    $,
    append,
    apply,
    css,
    parent,
    pointerEnter,
    pointerLeave,
    remove,
    toFloat,
    Transition,
    trigger,
} from 'uikit-util';
import { defineComponent } from '../api/options';
import Container from '../mixin/container';
import { maybeDefaultPreventClick } from '../mixin/event';
import type {
    ComponentInternalInstance,
    CssProperties,
    FrameworkEvent,
    UIkitStatic,
} from '../types';

interface NotificationInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    container: Element;
    message: string;
    status: string;
    timeout: number;
    group: string;
    pos: string;
    clsContainer: string;
    clsClose: string;
    clsMsg: string;
    marginProp: string;
    startProps: CssProperties;
    timer: number | undefined;
    close(immediate?: boolean): Promise<void>;
}

interface NotificationApi {
    closeAll(group?: string, immediate?: boolean): void;
}

interface NotificationUIkit extends UIkitStatic {
    notification: NotificationApi;
}

export default defineComponent<NotificationInstance>()({
    mixins: [Container],

    functional: true,

    args: ['message', 'status'],

    data: {
        message: '',
        status: '',
        timeout: 5000,
        group: '',
        pos: 'top-center',
        clsContainer: 'uk-notification',
        clsClose: 'uk-notification-close',
        clsMsg: 'uk-notification-message',
    },

    install,

    computed: {
        marginProp: ({ pos }: { pos: string }) =>
            `margin-${pos.match(/[a-z]+(?=-)/)?.[0] ?? 'top'}`,

        startProps() {
            return { opacity: 0, [this.marginProp]: -this.$el.offsetHeight };
        },
    },

    created() {
        const posClass = `${this.clsContainer}-${this.pos}`;
        const containerAttr = `data-${this.clsContainer}-container`;
        let container = $(`.${posClass}[${containerAttr}]`, this.container);
        if (!container) {
            const appendedContainer = append(
                this.container,
                `<div class="${this.clsContainer} ${posClass}" ${containerAttr}></div>`,
            );
            container = appendedContainer instanceof HTMLElement ? appendedContainer : undefined;
        }

        if (!container) {
            return;
        }
        const message = append(
            container,
            `<div class="${this.clsMsg}${
                this.status ? ` ${this.clsMsg}-${this.status}` : ''
            }" role="alert">
                    <a href class="${this.clsClose}" data-uk-close></a>
                    <div>${this.message}</div>
                </div>`,
        );
        if (message instanceof Element) {
            this.$mount(message);
        }
    },

    async connected() {
        const margin = toFloat(css(this.$el, this.marginProp));
        css(this.$el, this.startProps);
        await Transition.start(this.$el, {
            opacity: 1,
            [this.marginProp]: margin,
        });

        if (this.timeout) {
            this.timer = setTimeout(this.close, this.timeout);
        }
    },

    events: [
        {
            name: 'click',
            handler(e: FrameworkEvent) {
                if (hasElementTarget(e)) {
                    maybeDefaultPreventClick(e);
                }
                this.close();
            },
        },

        {
            name: pointerEnter,
            handler() {
                if (this.timer) {
                    clearTimeout(this.timer);
                }
            },
        },

        {
            name: pointerLeave,
            handler() {
                if (this.timeout) {
                    this.timer = setTimeout(this.close, this.timeout);
                }
            },
        },
    ],

    methods: {
        async close(immediate = false) {
            const removeFn = (el: Element) => {
                const container = parent(el);

                trigger(el, 'close', [this]);
                remove(el);

                if (!container?.hasChildNodes()) {
                    remove(container);
                }
            };

            if (this.timer) {
                clearTimeout(this.timer);
            }

            if (!immediate) {
                await Transition.start(this.$el, this.startProps);
            }

            removeFn(this.$el);
        },
    },
});

function install(UIkit: NotificationUIkit): void {
    UIkit.notification.closeAll = function (group?: string, immediate?: boolean): void {
        apply(document.body, (el) => {
            const notification = UIkit.getComponent(el, 'notification');
            if (isNotificationInstance(notification) && (!group || group === notification.group)) {
                notification.close(immediate);
            }
        });
    };
}

function isNotificationInstance(
    instance: ComponentInternalInstance | undefined,
): instance is NotificationInstance {
    return (
        Boolean(instance) &&
        typeof instance?.group === 'string' &&
        typeof instance.close === 'function'
    );
}

function hasElementTarget(event: FrameworkEvent): event is FrameworkEvent<Element> {
    return event.target instanceof Element;
}
