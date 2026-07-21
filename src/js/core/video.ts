import {
    hasAttr,
    isTag,
    isTouch,
    mute,
    parent,
    pause,
    play,
    pointerEnter,
    pointerLeave,
    query,
} from 'uikit-util';
import { intersection } from '../api/observables';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance, FrameworkEvent } from '../types';

type AutoplayMode = boolean | 'hover' | 'inview';
type VideoHost = HTMLVideoElement | HTMLIFrameElement;

interface VideoInstance extends ComponentInternalInstance {
    readonly $el: VideoHost;
    automute: boolean;
    autoplay: AutoplayMode;
    restart: boolean;
    hoverTarget: string | false;
}

export default defineComponent<VideoInstance>()({
    args: 'autoplay',

    props: {
        automute: Boolean,
        autoplay: Boolean,
        restart: Boolean,
        hoverTarget: Boolean,
    },

    data: {
        automute: false,
        autoplay: true,
        restart: false,
        hoverTarget: false,
    },

    beforeConnect() {
        const isVideo = isVideoElement(this.$el);
        if (this.autoplay === 'inview' && isVideo && !hasAttr(this.$el, 'preload')) {
            this.$el.preload = 'none';
        }

        if (!isVideo && !hasAttr(this.$el, 'allow')) {
            this.$el.allow = 'autoplay';
        }

        if (this.autoplay === 'hover') {
            if (isVideo) {
                this.$el.tabIndex = 0;
            } else {
                this.autoplay = true;
            }
        }

        // If the video is added to the DOM through JS, the muted attribute is ignored
        if (this.automute || hasAttr(this.$el, 'muted')) {
            mute(this.$el);
        }
    },

    events: [
        {
            name: `${pointerEnter} focusin`,

            el: ({ hoverTarget, $el }: VideoInstance) =>
                (hoverTarget ? query(hoverTarget, $el) : undefined) || $el,

            filter: ({ autoplay }: VideoInstance) => autoplay === 'hover',

            handler(e: FrameworkEvent) {
                if (!isTouch(e) || !isPlaying(this.$el)) {
                    play(this.$el);
                } else {
                    pauseHover(this.$el, this.restart);
                }
            },
        },

        {
            name: `${pointerLeave} focusout`,

            el: ({ hoverTarget, $el }: VideoInstance) =>
                (hoverTarget ? query(hoverTarget, $el) : undefined) || $el,

            filter: ({ autoplay }: VideoInstance) => autoplay === 'hover',

            handler(e: FrameworkEvent) {
                if (!isTouch(e)) {
                    pauseHover(this.$el, this.restart);
                }
            },
        },
    ],

    observe: [
        intersection<VideoInstance>({
            filter: ({ $el }) => isVideoElement($el) && $el.preload === 'none',
            handler(entries) {
                const entry = entries[0];
                if (!entry) {
                    return;
                }
                const { target } = entry;
                if (isVideoElement(target)) {
                    target.preload = '';
                }
                this.$reset();
            },
        }),

        intersection<VideoInstance>({
            filter: ({ $el, autoplay }) =>
                autoplay !== 'hover' && (!isVideoElement($el) || $el.preload !== 'none'),
            handler(entries) {
                const entry = entries[0];
                if (!entry) {
                    return;
                }
                const { isIntersecting, target } = entry;
                if (!document.fullscreenElement) {
                    if (isIntersecting) {
                        if (this.autoplay) {
                            play(target);
                        }
                    } else {
                        pauseHover(target, this.restart);
                    }
                }
            },
            args: { intersecting: false },
            options: ({ $el, autoplay }: VideoInstance) => {
                const parentElement = parent($el);
                return {
                    root:
                        autoplay === 'inview' ? null : (parentElement?.closest(':not(a)') ?? null),
                };
            },
        }),
    ],
});

function isVideoElement(element: Element): element is HTMLVideoElement {
    return isTag(element, 'video');
}

function isPlaying(videoEl: Element): boolean {
    return !isVideoElement(videoEl) || (!videoEl.paused && !videoEl.ended);
}

function pauseHover(el: Element, restart: boolean): void {
    pause(el);
    if (restart && isVideoElement(el)) {
        el.currentTime = 0;
    }
}
