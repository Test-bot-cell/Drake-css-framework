import {
    append,
    attr,
    children,
    createEvent,
    css,
    data,
    escape,
    includes,
    isArray,
    isEmpty,
    isObject,
    isString,
    isTag,
    parent,
    queryAll,
    removeAttr,
    startsWith,
    trigger,
} from 'uikit-util';
import { intersection } from '../api/observables';
import { defineComponent, parseOptions } from '../api/options';
import type { ComponentInternalInstance, ComponentValueMap } from '../types';

type SourceAttributeValue = string | number | boolean | null;
type SourceAttributes = Record<string, SourceAttributeValue>;
type SourcesValue = string | SourceAttributes | SourceAttributes[] | false;

interface ImageInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $props: ComponentValueMap & { target?: string };
    dataSrc: string;
    sources: SourcesValue;
    margin: string;
    target: string | false;
    loading: string;
    img?: HTMLImageElement;
    load(): HTMLImageElement;
}

export default defineComponent<ImageInstance>()({
    args: 'dataSrc',

    props: {
        dataSrc: String,
        sources: String,
        margin: String,
        target: String,
        loading: String,
    },

    data: {
        dataSrc: '',
        sources: false,
        margin: '50%',
        target: false,
        loading: 'lazy',
    },

    connected() {
        if (this.loading !== 'lazy') {
            this.load();
        } else if (isImg(this.$el)) {
            this.$el.loading = 'lazy';
            setSrcAttrs(this.$el);
        }
    },

    disconnected() {
        if (this.img) {
            this.img.onload = null;
        }
        delete this.img;
    },

    observe: intersection<ImageInstance>({
        handler(_entries, observer) {
            this.load();
            observer.disconnect();
        },
        options: ({ margin }: ImageInstance) => ({ rootMargin: margin }),
        filter: ({ loading }) => loading === 'lazy',
        target: ({ $el, $props }) => ($props.target ? [$el, ...queryAll($props.target, $el)] : $el),
    }),

    methods: {
        load() {
            if (this.img) {
                return this.img;
            }

            const image = isImg(this.$el)
                ? this.$el
                : getImageFromElement(this.$el, this.dataSrc, this.sources);

            removeAttr(image, 'loading');
            setSrcAttrs(this.$el, image.currentSrc);
            return (this.img = image);
        },
    },
});

function setSrcAttrs(el: HTMLElement, src?: string): void {
    if (isImg(el)) {
        const parentNode = parent(el);
        const elements = isTag(parentNode, 'picture') ? children(parentNode) : [el];
        elements.forEach((element) => setSourceProps(element, element));
    } else if (src) {
        const change = !includes(el.style.backgroundImage, src);
        if (change) {
            css(el, 'backgroundImage', `url(${escape(src)})`);
            trigger(el, createEvent('load', false));
        }
    }
}

const srcProps = ['data-src', 'data-srcset', 'sizes'];
function setSourceProps(sourceEl: Element, targetEl: Element): void {
    for (const prop of srcProps) {
        const value = data(sourceEl, prop);
        if (value) {
            attr(targetEl, prop.replace(/data-/g, ''), value);
        }
    }
}

function getImageFromElement(
    el: HTMLElement,
    src: string,
    sources: SourcesValue,
): HTMLImageElement {
    const img = new Image();

    wrapInPicture(img, sources);
    setSourceProps(el, img);
    img.onload = () => setSrcAttrs(el, img.currentSrc);
    img.src = src;
    return img;
}

export function wrapInPicture(img: HTMLImageElement, sources: SourcesValue): void {
    const parsedSources = parseSources(sources);

    if (parsedSources.length) {
        const picture = document.createElement('picture');
        for (const attrs of parsedSources) {
            const source = document.createElement('source');
            attr(source, attrs);
            append(picture, source);
        }
        append(picture, img);
    }
}

function parseSources(sources: SourcesValue): SourceAttributes[] {
    if (!sources) {
        return [];
    }

    let parsedSources: unknown = sources;
    if (isString(sources)) {
        if (startsWith(sources, '[')) {
            try {
                const parsed: unknown = JSON.parse(sources);
                parsedSources = isSourceInput(parsed) ? parsed : [];
            } catch {
                parsedSources = [];
            }
        } else {
            parsedSources = parseOptions(sources);
        }
    }

    const sourceList = isArray(parsedSources) ? parsedSources : [parsedSources];
    return sourceList.filter(isSourceAttributes).filter((source) => !isEmpty(source));
}

function isSourceInput(value: unknown): value is SourceAttributes | SourceAttributes[] {
    return isSourceAttributes(value) || (isArray(value) && value.every(isSourceAttributes));
}

function isSourceAttributes(value: unknown): value is SourceAttributes {
    return (
        isObject(value) &&
        Object.values(value).every(
            (attribute) =>
                attribute === null || ['string', 'number', 'boolean'].includes(typeof attribute),
        )
    );
}

function isImg(el: Element): el is HTMLImageElement {
    return isTag(el, 'img');
}
