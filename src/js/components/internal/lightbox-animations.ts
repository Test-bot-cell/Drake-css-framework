import { css } from 'drake-util';
import Animations from '../../mixin/internal/slideshow-animations';
import { scale3d } from './slideshow-animations';

type AnimationElement = HTMLElement;

export default {
    ...Animations,
    fade: {
        show() {
            return [{ opacity: 0 }, { opacity: 1 }];
        },

        percent(current: AnimationElement) {
            return 1 - Number(css(current, 'opacity'));
        },

        translate(percent: number) {
            return [{ opacity: 1 - percent }, { opacity: percent }];
        },
    },

    scale: {
        show() {
            return [
                { opacity: 0, transform: scale3d(1 - 0.2) },
                { opacity: 1, transform: scale3d(1) },
            ];
        },

        percent(current: AnimationElement) {
            return 1 - Number(css(current, 'opacity'));
        },

        translate(percent: number) {
            return [
                { opacity: 1 - percent, transform: scale3d(1 - 0.2 * percent) },
                { opacity: percent, transform: scale3d(1 - 0.2 + 0.2 * percent) },
            ];
        },
    },
};
