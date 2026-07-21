import { css, toFloat, Transition } from 'uikit-util';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import { maybeDefaultPreventClick } from '../mixin/event';
import Togglable from '../mixin/togglable';
import type { ComponentInternalInstance, FrameworkEvent } from '../types';

interface AlertAnimationContext {
    duration: number;
    transition: string;
    velocity: number;
}

type AlertAnimation = (
    element: HTMLElement,
    show: boolean,
    context: AlertAnimationContext,
) => Promise<unknown>;

interface AlertInstance extends ComponentInternalInstance, AlertAnimationContext {
    readonly $el: HTMLElement;
    selClose: string;
    close(): Promise<void>;
    toggleElement(target: HTMLElement, toggle: boolean, animate: AlertAnimation): Promise<boolean>;
}

export default defineComponent<AlertInstance>()({
    mixins: [Class, Togglable],

    args: 'animation',

    props: {
        animation: Boolean,
        close: String,
    },

    data: {
        animation: true,
        selClose: '.uk-alert-close',
        duration: 150,
    },

    events: {
        name: 'click',

        delegate: ({ selClose }: AlertInstance) => selClose,

        handler(e: FrameworkEvent<Element>) {
            maybeDefaultPreventClick(e);
            this.close();
        },
    },

    methods: {
        async close() {
            await this.toggleElement(this.$el, false, animate);
            this.$destroy(true);
        },
    },
});

function animate(
    el: HTMLElement,
    show: boolean,
    { duration, transition, velocity }: AlertAnimationContext,
): Promise<HTMLElement[]> {
    const height = toFloat(css(el, 'height'));
    css(el, 'height', height);
    return Transition.start(
        el,
        {
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            borderTop: 0,
            borderBottom: 0,
            opacity: 0,
        },
        velocity * height + duration,
        transition,
    );
}
