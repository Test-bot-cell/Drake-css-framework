import {
    $,
    $$,
    Transition,
    addClass,
    append,
    attr,
    fragment,
    getIndex,
    html,
    isTag,
    matches,
    on,
    parent,
    pointerDown,
    pointerMove,
    remove,
    removeClass,
    toggleClass,
    trigger,
    wrapAll,
} from 'uikit-util';
import { defineComponent } from '../api/options';
import { wrapInPicture } from '../core/img';
import Modal from '../mixin/modal';
import Slideshow from '../mixin/slideshow';
import type { SliderIndex, SliderInstance } from '../mixin/types';
import type { ComponentValueMap, FrameworkEvent } from '../types';
import { keyMap } from '../util/keys';
import Animations from './internal/lightbox-animations';

type AttributeValue = string | number | boolean | null;
type ElementAttributes = Record<string, AttributeValue>;
type PictureSources = Parameters<typeof wrapInPicture>[1];

interface LightboxItem extends Record<string, unknown> {
    source?: string;
    type?: string;
    attrs?: ElementAttributes;
    sources?: PictureSources;
    alt?: string;
    srcset?: string;
    sizes?: string;
    poster?: string;
    caption?: string;
    thumb?: string;
    thumbRatio?: number;
}

interface LightboxPanelInstance extends SliderInstance {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & {
        nav: string | false;
        draggable: boolean;
        index: SliderIndex;
    };
    container: Element;
    counter: boolean;
    preload: number;
    nav: string | false;
    slidenav: boolean;
    delayControls: number;
    videoAutoplay: boolean | 'inline';
    items: LightboxItem[];
    cls: string;
    clsPage: string;
    clsFit: string;
    clsZoom: string;
    attrItem: string;
    selList: string;
    selClose: string;
    selNav: string;
    selCaption: string;
    selCounter: string;
    template: string;
    bgClose: boolean;
    draggable: boolean;
    animation: (typeof Animations)['scale'];
    controlsTimer: number | undefined;
    list: HTMLElement;
    slides: HTMLElement[];
    isToggled(element?: Element): boolean;
    toggleElement(element: Element, toggled: boolean, animate?: boolean): Promise<boolean>;
    hide(): Promise<boolean>;
    loadItem(index?: SliderIndex): void;
    getItem(index?: SliderIndex): LightboxItem;
    setItem(item: LightboxItem, content: string | Node): void;
    getSlide(item: LightboxItem): HTMLElement;
    setError(item: LightboxItem): void;
    showControls(): void;
    hideControls(): void;
}

export default defineComponent<LightboxPanelInstance>()({
    i18n: {
        counter: '%s / %s',
    },

    mixins: [Modal, Slideshow],

    functional: true,

    props: {
        counter: Boolean,
        preload: Number,
        nav: Boolean,
        slidenav: Boolean,
        delayControls: Number,
        videoAutoplay: Boolean,
        template: String,
    },

    data: () => ({
        counter: false,
        preload: 1,
        nav: false,
        slidenav: true,
        delayControls: 3000,
        videoAutoplay: false,
        items: [],
        cls: 'uk-open',
        clsPage: 'uk-lightbox-page',
        clsFit: 'uk-lightbox-items-fit',
        clsZoom: 'uk-lightbox-zoom',
        attrItem: 'uk-lightbox-item',
        selList: '.uk-lightbox-items',
        selClose: '.uk-close-large',
        selNav: '.uk-lightbox-thumbnav, .uk-lightbox-dotnav',
        selCaption: '.uk-lightbox-caption',
        selCounter: '.uk-lightbox-counter',
        pauseOnHover: false,
        velocity: 2,
        Animations,
        template: `<div class="uk-lightbox uk-overflow-hidden">
                        <div class="uk-lightbox-items"></div>
                        <div class="uk-position-top-right uk-position-small uk-transition-fade" uk-inverse>
                            <button class="uk-lightbox-close uk-close-large" type="button" uk-close></button>
                        </div>
                        <div class="uk-lightbox-slidenav uk-position-center-left uk-position-medium uk-transition-fade" uk-inverse>
                            <a href uk-slidenav-previous uk-lightbox-item="previous"></a>
                        </div>
                        <div class="uk-lightbox-slidenav uk-position-center-right uk-position-medium uk-transition-fade" uk-inverse>
                            <a href uk-slidenav-next uk-lightbox-item="next"></a>
                        </div>
                        <div class="uk-position-center-right uk-position-medium uk-transition-fade" uk-inverse style="max-height: 90vh; overflow: auto;">
                            <ul class="uk-lightbox-thumbnav uk-lightbox-thumbnav-vertical uk-thumbnav uk-thumbnav-vertical"></ul>
                            <ul class="uk-lightbox-dotnav uk-dotnav uk-dotnav-vertical"></ul>
                        </div>
                        <div class="uk-lightbox-counter uk-text-large uk-position-top-left uk-position-small uk-transition-fade" uk-inverse></div>
                        <div class="uk-lightbox-caption uk-position-bottom uk-text-center uk-transition-slide-bottom uk-transition-opaque"></div>
                    </div>`,
    }),

    created() {
        let $el = $(this.template);
        if (!$el) {
            return;
        }

        if (isTag($el, 'template')) {
            $el = firstHtmlElement(fragment(html($el) ?? ''));
        }
        if (!$el) {
            return;
        }

        const list = $(this.selList, $el);
        if (!list) {
            return;
        }
        const navType = this.$props.nav;

        remove($$(this.selNav, $el).filter((el) => !matches(el, `.uk-${navType}`)));

        for (const [i, item] of this.items.entries()) {
            append(list, '<div>');
            if (navType === 'thumbnav') {
                const nav = $(this.selNav, $el);
                const navItem = nav
                    ? append(nav, `<li uk-lightbox-item="${i}"><a href></a></li>`)
                    : undefined;
                if (navItem instanceof Element) {
                    wrapAll(toThumbnavItem(item, this.videoAutoplay), navItem);
                }
            }
        }

        if (!this.slidenav) {
            remove($$('.uk-lightbox-slidenav', $el));
        }

        if (!this.counter) {
            remove($(this.selCounter, $el));
        }

        addClass(list, this.clsFit);

        const close = $('[uk-close]', $el);
        const closeLabel = this.t('close');
        if (close && closeLabel) {
            close.dataset.i18n = JSON.stringify({ label: closeLabel });
        }

        append(this.container, $el);
        this.$mount($el);
    },

    events: [
        {
            name: 'click',

            self: true,

            filter: ({ bgClose }) => bgClose,

            delegate: ({ selList }) => `${selList} > *`,

            handler(e) {
                if (!e.defaultPrevented) {
                    this.hide();
                }
            },
        },

        {
            name: 'click',

            self: true,

            delegate: ({ clsZoom }) => `.${clsZoom}`,

            handler(e) {
                if (!e.defaultPrevented) {
                    toggleClass(this.list, this.clsFit);
                }
            },
        },

        {
            name: `${pointerMove} ${pointerDown} keydown`,

            filter: ({ delayControls }) => Boolean(delayControls),

            handler() {
                this.showControls();
            },
        },

        {
            name: 'shown',

            self: true,

            handler() {
                this.showControls();
            },
        },

        {
            name: 'hide',

            self: true,

            handler() {
                this.hideControls();

                removeClass(this.slides, this.clsActive);
                Transition.stop(this.slides);
            },
        },

        {
            name: 'hidden',

            self: true,

            handler() {
                this.$destroy(true);
            },
        },

        {
            name: 'keyup',

            el: () => document,

            handler(event: FrameworkEvent) {
                if (!this.isToggled() || !this.draggable) {
                    return;
                }

                if (!(event instanceof KeyboardEvent)) {
                    return;
                }
                const { keyCode } = event;
                let index: SliderIndex | undefined;

                if (keyCode === keyMap.LEFT) {
                    index = 'previous';
                } else if (keyCode === keyMap.RIGHT) {
                    index = 'next';
                } else if (keyCode === keyMap.HOME) {
                    index = 0;
                } else if (keyCode === keyMap.END) {
                    index = 'last';
                }

                if (index !== undefined) {
                    void this.show(index);
                }
            },
        },

        {
            name: 'beforeitemshow',

            handler(e: FrameworkEvent) {
                html($(this.selCaption, this.$el), this.getItem().caption || '');
                html(
                    $(this.selCounter, this.$el),
                    this.t('counter', this.index + 1, this.slides.length),
                );

                for (let j = -this.preload; j <= this.preload; j++) {
                    this.loadItem(this.index + j);
                }

                if (this.isToggled()) {
                    return;
                }

                this.draggable = false;

                e.preventDefault();

                this.toggleElement(this.$el, true, false);

                this.animation = Animations.scale;
                if (e.target instanceof Element) {
                    removeClass(e.target, this.clsActive);
                }
                this.stack.splice(1, 0, this.index);
            },
        },

        {
            name: 'itemshown',

            handler() {
                this.draggable = this.$props.draggable;
            },
        },

        {
            name: 'itemload',

            async handler(_event: FrameworkEvent, value: unknown) {
                if (!isLightboxItem(value)) {
                    return;
                }
                const item = value;
                const { source: src, type } = item;
                const attrs = toAttributes(item.attrs);

                this.setItem(item, '<span uk-spinner uk-inverse></span>');

                if (!src) {
                    return;
                }

                let matches;
                const iframeAttrs = {
                    allowfullscreen: '',
                    style: 'max-width: 100%; box-sizing: border-box;',
                    'uk-responsive': '',
                    'uk-video': Boolean(this.videoAutoplay),
                };

                // Image
                if (type === 'image' || isImage(src)) {
                    const img = createEl('img');

                    wrapInPicture(img, item.sources ?? false);
                    attr(img, {
                        src,
                        ...getImageAttributes(item),
                        ...attrs,
                    });

                    on(img, 'load', () => this.setItem(item, parent(img) || img));
                    on(img, 'error', () => this.setError(item));

                    // Video
                } else if (type === 'video' || isVideo(src)) {
                    const inline = this.videoAutoplay === 'inline';
                    const video = createEl('video', {
                        src,
                        playsinline: '',
                        controls: inline ? null : '',
                        loop: inline ? '' : null,
                        muted: inline ? '' : null,
                        poster: this.videoAutoplay ? null : (item.poster ?? null),
                        'uk-video': Boolean(this.videoAutoplay),
                        ...attrs,
                    });

                    on(video, 'loadedmetadata', () => this.setItem(item, video));
                    on(video, 'error', () => this.setError(item));

                    // Iframe
                } else if (type === 'iframe' || src.match(/\.(html|php)($|\?)/i)) {
                    this.setItem(
                        item,
                        createEl('iframe', {
                            src,
                            allowfullscreen: '',
                            class: 'uk-lightbox-iframe',
                            ...attrs,
                        }),
                    );

                    // YouTube
                } else if (
                    (matches = src.match(
                        /\/\/(?:.*?youtube(-nocookie)?\..*?(?:[?&]v=|\/shorts\/)|youtu\.be\/)([\w-]{11})[&?]?(.*)?/,
                    ))
                ) {
                    this.setItem(
                        item,
                        createEl('iframe', {
                            src: `https://www.youtube${matches[1] || ''}.com/embed/${matches[2] ?? ''}${
                                matches[3] ? `?${matches[3]}` : ''
                            }`,
                            width: 1920,
                            height: 1080,
                            ...iframeAttrs,
                            ...attrs,
                        }),
                    );

                    // Vimeo
                } else if ((matches = src.match(/\/\/.*?vimeo\.[a-z]+\/(\d+)[&?]?(.*)?/))) {
                    try {
                        const response = await fetch(
                            `https://vimeo.com/api/oembed.json?maxwidth=1920&url=${encodeURI(src)}`,
                            { credentials: 'omit' },
                        );
                        const metadata: unknown = await response.json();
                        if (!isMediaDimensions(metadata)) {
                            throw new TypeError('Invalid Vimeo oEmbed dimensions');
                        }
                        const { height, width } = metadata;

                        this.setItem(
                            item,
                            createEl('iframe', {
                                src: `https://player.vimeo.com/video/${matches[1]}${
                                    matches[2] ? `?${matches[2]}` : ''
                                }`,
                                width,
                                height,
                                ...iframeAttrs,
                                ...attrs,
                            }),
                        );
                    } catch {
                        this.setError(item);
                    }
                }
            },
        },

        {
            name: 'itemloaded',
            handler() {
                this.$emit('resize');
            },
        },
    ],

    update: {
        read() {
            for (const media of $$<HTMLImageElement | HTMLVideoElement>(
                `${this.selList} :not([controls]):is(img,video)`,
                this.$el,
            )) {
                const isImage = media instanceof HTMLImageElement;
                toggleClass(
                    media,
                    this.clsZoom,
                    (isImage ? media.naturalHeight : media.videoHeight) - this.$el.offsetHeight >
                        Math.max(
                            0,
                            (isImage ? media.naturalWidth : media.videoWidth) -
                                this.$el.offsetWidth,
                        ),
                );
            }
        },

        events: ['resize'],
    },

    methods: {
        loadItem(this: LightboxPanelInstance, index: SliderIndex = this.index) {
            const item = this.getItem(index);

            if (!this.getSlide(item).childElementCount) {
                trigger(this.$el, 'itemload', [item]);
            }
        },

        getItem(this: LightboxPanelInstance, index: SliderIndex = this.index): LightboxItem {
            const item = this.items[getIndex(index, this.slides)];
            if (!item) {
                throw new RangeError('Lightbox item index is out of range');
            }
            return item;
        },

        setItem(item: LightboxItem, content: string | Node) {
            trigger(this.$el, 'itemloaded', [this, html(this.getSlide(item), content)]);
        },

        getSlide(item: LightboxItem): HTMLElement {
            const slide = this.slides[this.items.indexOf(item)];
            if (!slide) {
                throw new RangeError('Lightbox slide is missing');
            }
            return slide;
        },

        setError(item: LightboxItem) {
            this.setItem(item, '<span uk-icon="icon: bolt; ratio: 2" uk-inverse></span>');
        },

        showControls() {
            clearTimeout(this.controlsTimer);
            this.controlsTimer = this.delayControls
                ? setTimeout(this.hideControls, this.delayControls)
                : undefined;

            addClass(this.$el, 'uk-active', 'uk-transition-active');
        },

        hideControls() {
            removeClass(this.$el, 'uk-active', 'uk-transition-active');
        },
    },
});

function createEl(tag: 'img', attrs?: ElementAttributes): HTMLImageElement;
function createEl(tag: 'video', attrs?: ElementAttributes): HTMLVideoElement;
function createEl(tag: 'iframe', attrs?: ElementAttributes): HTMLIFrameElement;
function createEl(tag: 'canvas', attrs?: ElementAttributes): HTMLCanvasElement;
function createEl(
    tag: 'img' | 'video' | 'iframe' | 'canvas',
    attrs: ElementAttributes = {},
): HTMLImageElement | HTMLVideoElement | HTMLIFrameElement | HTMLCanvasElement {
    const el = document.createElement(tag);
    attr(el, attrs);
    return el;
}

function toThumbnavItem(item: LightboxItem, videoAutoplay: boolean | 'inline'): HTMLElement {
    const el =
        item.poster || (item.thumb && (item.type === 'image' || isImage(item.thumb)))
            ? createEl('img', { src: item.poster || item.thumb || '', alt: '' })
            : item.thumb && (item.type === 'video' || isVideo(item.thumb))
              ? createEl('video', {
                    src: item.thumb,
                    loop: '',
                    playsinline: '',
                    muted: '',
                    'uk-video': videoAutoplay === 'inline',
                })
              : createEl('canvas');

    if (item.thumbRatio) {
        el.style.aspectRatio = String(item.thumbRatio);
    }

    return el;
}

function isImage(src: string | undefined): boolean {
    return Boolean(src?.match(/\.(avif|jpe?g|jfif|a?png|gif|svg|webp)($|\?)/i));
}

function isVideo(src: string | undefined): boolean {
    return Boolean(src?.match(/\.(mp4|webm|ogv)($|\?)/i));
}

function firstHtmlElement(value: Node | Node[] | undefined): HTMLElement | undefined {
    if (value instanceof HTMLElement) {
        return value;
    }
    return Array.isArray(value)
        ? value.find((node): node is HTMLElement => node instanceof HTMLElement)
        : undefined;
}

function isLightboxItem(value: unknown): value is LightboxItem {
    if (!isRecord(value)) {
        return false;
    }
    return (
        (value.source === undefined || typeof value.source === 'string') &&
        (value.type === undefined || typeof value.type === 'string') &&
        (value.attrs === undefined || isAttributes(value.attrs))
    );
}

function toAttributes(value: unknown): ElementAttributes {
    if (!isRecord(value)) {
        return {};
    }
    return Object.fromEntries(
        Object.entries(value).filter((entry): entry is [string, AttributeValue] =>
            isAttributeValue(entry[1]),
        ),
    );
}

function isAttributes(value: unknown): value is ElementAttributes {
    return isRecord(value) && Object.values(value).every(isAttributeValue);
}

function isAttributeValue(value: unknown): value is AttributeValue {
    return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function getImageAttributes(item: LightboxItem): ElementAttributes {
    return toAttributes({ alt: item.alt, srcset: item.srcset, sizes: item.sizes });
}

function isMediaDimensions(value: unknown): value is { width: number; height: number } {
    return isRecord(value) && typeof value.width === 'number' && typeof value.height === 'number';
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
    return typeof value === 'object' && value !== null;
}
