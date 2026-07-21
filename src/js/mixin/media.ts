import {
    createEvent,
    css,
    isNumeric,
    isString,
    on,
    startsWith,
    toFloat,
    trigger,
} from 'drake-util';
import { defineMixin } from '../api/options';
import type { ComponentInternalInstance, Teardown } from '../types';

type MediaValue = boolean | number | string;

interface MediaInstance extends ComponentInternalInstance {
    media: MediaValue;
    matchMedia: boolean;
    mediaObj: MediaQueryList;
    offMediaObj?: Teardown;
}

export default defineMixin<MediaInstance>()({
    props: {
        media: Boolean,
    },

    data: {
        media: false,
    },

    connected() {
        const media = toMedia(this.media, this.$el);
        this.matchMedia = true;
        if (media) {
            this.mediaObj = window.matchMedia(media);
            const handler = () => {
                this.matchMedia = this.mediaObj.matches;
                trigger(this.$el, createEvent('mediachange', false, true, [this.mediaObj]));
            };
            this.offMediaObj = on(this.mediaObj, 'change', () => {
                handler();
                this.$emit('resize');
            });
            handler();
        }
    },

    disconnected() {
        this.offMediaObj?.();
    },
});

function toMedia(value: MediaValue, element: Element): string {
    if (isString(value)) {
        if (startsWith(value, '@')) {
            value = toFloat(css(element, `--drk-breakpoint-${value.slice(1)}`));
        } else if (Number.isNaN(Number(value))) {
            return value;
        }
    }

    return value && isNumeric(value) ? `(min-width: ${value}px)` : '';
}
