import { noop } from 'uikit-util';
import { defineMixin } from '../api/options';
import type { ComponentInternalInstance } from '../types';
import fade from './internal/animate-fade';
import slide from './internal/animate-slide';

export type MixinAnimationAction = () => unknown;

interface AnimateInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    animation: boolean | string;
    duration: number;
    animate(action: MixinAnimationAction, target?: HTMLElement): Promise<void>;
}

export default defineMixin<AnimateInstance>()({
    props: {
        duration: Number,
        animation: Boolean,
    },

    data: {
        duration: 150,
        animation: 'slide',
    },

    methods: {
        animate(
            this: AnimateInstance,
            action: MixinAnimationAction,
            target = this.$el,
        ): Promise<void> {
            const name = this.animation;
            const animationFn =
                name === 'fade'
                    ? fade
                    : name === 'delayed-fade'
                      ? (
                            nextAction: MixinAnimationAction,
                            nextTarget: HTMLElement,
                            nextDuration: number,
                        ) => fade(nextAction, nextTarget, nextDuration, 40)
                      : name
                        ? slide
                        : (nextAction: MixinAnimationAction) => {
                              nextAction();
                              return Promise.resolve();
                          };

            return animationFn(action, target, this.duration).catch(noop);
        },
    },
});
