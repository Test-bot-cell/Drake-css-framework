import { css } from 'drake-util';
import Animations, { translate, translated } from '../../mixin/internal/slideshow-animations';

type AnimationElement = HTMLElement;

export default {
    ...Animations,
    fade: {
        show() {
            return [{ opacity: 0, zIndex: 0 }, { zIndex: -1 }];
        },

        percent(current: AnimationElement) {
            return 1 - Number(css(current, 'opacity'));
        },

        translate(percent: number) {
            return [{ opacity: 1 - percent, zIndex: 0 }, { zIndex: -1 }];
        },
    },

    scale: {
        show() {
            return [{ opacity: 0, transform: scale3d(1 + 0.5), zIndex: 0 }, { zIndex: -1 }];
        },

        percent(current: AnimationElement) {
            return 1 - Number(css(current, 'opacity'));
        },

        translate(percent: number) {
            return [
                { opacity: 1 - percent, transform: scale3d(1 + 0.5 * percent), zIndex: 0 },
                { zIndex: -1 },
            ];
        },
    },

    pull: {
        show(dir: number) {
            return dir < 0
                ? [
                      { transform: translate(30), zIndex: -1 },
                      { transform: translate(), zIndex: 0 },
                  ]
                : [
                      { transform: translate(-100), zIndex: 0 },
                      { transform: translate(), zIndex: -1 },
                  ];
        },

        percent(current: AnimationElement, next: AnimationElement, dir: number) {
            return dir < 0 ? 1 - translated(next) : translated(current);
        },

        translate(percent: number, dir: number) {
            return dir < 0
                ? [
                      { transform: translate(30 * percent), zIndex: -1 },
                      { transform: translate(-100 * (1 - percent)), zIndex: 0 },
                  ]
                : [
                      { transform: translate(-percent * 100), zIndex: 0 },
                      { transform: translate(30 * (1 - percent)), zIndex: -1 },
                  ];
        },
    },

    push: {
        show(dir: number) {
            return dir < 0
                ? [
                      { transform: translate(100), zIndex: 0 },
                      { transform: translate(), zIndex: -1 },
                  ]
                : [
                      { transform: translate(-30), zIndex: -1 },
                      { transform: translate(), zIndex: 0 },
                  ];
        },

        percent(current: AnimationElement, next: AnimationElement, dir: number) {
            return dir > 0 ? 1 - translated(next) : translated(current);
        },

        translate(percent: number, dir: number) {
            return dir < 0
                ? [
                      { transform: translate(percent * 100), zIndex: 0 },
                      { transform: translate(-30 * (1 - percent)), zIndex: -1 },
                  ]
                : [
                      { transform: translate(-30 * percent), zIndex: -1 },
                      { transform: translate(100 * (1 - percent)), zIndex: 0 },
                  ];
        },
    },
};

export function scale3d(value: number): string {
    return `scale3d(${value}, ${value}, 1)`;
}
