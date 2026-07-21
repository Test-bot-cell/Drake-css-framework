import { css } from 'uikit-util';
import type { SlideshowAnimations } from '../types';

const animations: SlideshowAnimations = {
    slide: {
        show(dir: number) {
            return [{ transform: translate(dir * -100) }, { transform: translate() }];
        },

        percent(current: HTMLElement) {
            return translated(current);
        },

        translate(percent: number, dir: number) {
            return [
                { transform: translate(dir * -100 * percent) },
                { transform: translate(dir * 100 * (1 - percent)) },
            ];
        },
    },
};

export default animations;

export function translated(el: HTMLElement): number {
    return Math.abs(new DOMMatrix(css(el, 'transform')).m41 / el.offsetWidth);
}

export function translate(value = 0, unit = '%'): string {
    return value ? `translate3d(${value + unit}, 0, 0)` : '';
}
