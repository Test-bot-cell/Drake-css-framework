import {
    $,
    addClass,
    css,
    endsWith,
    hasClass,
    height,
    isVisible,
    parent,
    removeClass,
    unwrap,
    wrapAll,
} from 'uikit-util';
import { swipe } from '../api/observables';
import { defineComponent } from '../api/options';
import Modal from '../mixin/modal';
import type { ComponentInternalInstance, FrameworkEvent } from '../types';

type OffcanvasMode = 'slide' | 'push' | 'reveal' | 'none';

interface OffcanvasProps {
    mode: OffcanvasMode;
    flip: boolean;
    overlay: boolean;
    clsFlip: string;
    clsOverlay: string;
    clsMode: string;
    clsSidebarAnimation: string;
    clsContainerAnimation: string;
}

interface OffcanvasInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    panel: HTMLElement;
    mode: OffcanvasMode;
    flip: boolean;
    overlay: boolean;
    swiping: boolean;
    clsPage: string;
    clsContainer: string;
    clsFlip: string;
    clsContainerAnimation: string;
    clsSidebarAnimation: string;
    clsMode: string;
    clsOverlay: string;
    isToggled(): boolean;
    hide(): Promise<unknown>;
}

export default defineComponent<OffcanvasInstance>()({
    mixins: [Modal],

    args: 'mode',

    props: {
        mode: String,
        flip: Boolean,
        overlay: Boolean,
        swiping: Boolean,
    },

    data: {
        mode: 'slide',
        flip: false,
        overlay: false,
        clsPage: 'uk-offcanvas-page',
        clsContainer: 'uk-offcanvas-container',
        selPanel: '.uk-offcanvas-bar',
        clsFlip: 'uk-offcanvas-flip',
        clsContainerAnimation: 'uk-offcanvas-container-animation',
        clsSidebarAnimation: 'uk-offcanvas-bar-animation',
        clsMode: 'uk-offcanvas',
        clsOverlay: 'uk-offcanvas-overlay',
        selClose: '.uk-offcanvas-close',
        container: false,
        swiping: true,
    },

    computed: {
        clsFlip: ({ flip, clsFlip }: OffcanvasProps) => (flip ? clsFlip : ''),

        clsOverlay: ({ overlay, clsOverlay }: OffcanvasProps) => (overlay ? clsOverlay : ''),

        clsMode: ({ mode, clsMode }: OffcanvasProps) => `${clsMode}-${mode}`,

        clsSidebarAnimation: ({ mode, clsSidebarAnimation }: OffcanvasProps) =>
            mode === 'none' || mode === 'reveal' ? '' : clsSidebarAnimation,

        clsContainerAnimation: ({ mode, clsContainerAnimation }: OffcanvasProps) =>
            mode !== 'push' && mode !== 'reveal' ? '' : clsContainerAnimation,

        transitionElement({ mode }: OffcanvasProps) {
            return mode === 'reveal' ? parent(this.panel) : this.panel;
        },
    },

    observe: swipe<OffcanvasInstance>({ filter: ({ swiping }) => swiping }),

    update: {
        read() {
            if (this.isToggled() && !isVisible(this.$el)) {
                this.hide();
            }
        },

        events: ['resize'],
    },

    events: [
        {
            name: 'touchmove',

            self: true,
            passive: false,

            filter: ({ overlay }: OffcanvasInstance) => overlay,

            handler(e: FrameworkEvent) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            },
        },

        {
            name: 'show',

            self: true,

            handler() {
                if (this.mode === 'reveal' && !hasClass(parent(this.panel), this.clsMode)) {
                    addClass(wrapAll(this.panel, '<div>'), this.clsMode);
                }

                const { body, scrollingElement } = document;

                addClass(body, this.clsContainer, this.clsFlip);
                css(body, 'touchAction', 'pan-y pinch-zoom');
                css(this.$el, 'display', 'block');
                css(
                    this.panel,
                    'maxWidth',
                    (scrollingElement ?? document.documentElement).clientWidth,
                );
                addClass(this.$el, this.clsOverlay);
                addClass(
                    this.panel,
                    this.clsSidebarAnimation,
                    this.mode === 'reveal' ? '' : this.clsMode,
                );

                height(body); // force reflow
                addClass(body, this.clsContainerAnimation);

                if (this.clsContainerAnimation) {
                    suppressUserScale();
                }
            },
        },

        {
            name: 'hide',

            self: true,

            handler() {
                removeClass(document.body, this.clsContainerAnimation);
                css(document.body, 'touchAction', '');
            },
        },

        {
            name: 'hidden',

            self: true,

            handler() {
                if (this.clsContainerAnimation) {
                    resumeUserScale();
                }

                if (this.mode === 'reveal' && hasClass(parent(this.panel), this.clsMode)) {
                    unwrap(this.panel);
                }

                removeClass(this.panel, this.clsSidebarAnimation, this.clsMode);
                removeClass(this.$el, this.clsOverlay);
                css(this.$el, 'display', '');
                css(this.panel, 'maxWidth', '');
                removeClass(document.body, this.clsContainer, this.clsFlip);
            },
        },

        {
            name: 'swipeLeft swipeRight',

            handler(e: FrameworkEvent) {
                if (this.isToggled() && endsWith(e.type, 'Left') !== this.flip) {
                    this.hide();
                }
            },
        },
    ],
});

// Chrome in responsive mode zooms page upon opening offcanvas
function suppressUserScale(): void {
    getViewport().content += ',user-scalable=0';
}

function resumeUserScale(): void {
    const viewport = getViewport();
    viewport.content = viewport.content.replace(/,user-scalable=0$/, '');
}

function getViewport(): HTMLMetaElement {
    const existing = $<HTMLMetaElement>('meta[name="viewport"]', document.head);
    if (existing) {
        return existing;
    }
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.append(viewport);
    return viewport;
}
