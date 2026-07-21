import {
    $,
    $$,
    assign,
    findIndex,
    isElement,
    isTag,
    matches,
    on,
    parents,
    uniqueBy,
} from 'drake-util';
import { defineComponent, parseOptions } from '../api/options';
import type {
    ComponentInternalInstance,
    ComponentOptions,
    DrakeStatic,
    FrameworkEvent,
    PropType,
} from '../types';
import LightboxPanel from './lightbox-panel';

const selDisabled = '.drk-disabled *, .drk-disabled, [disabled]';

type LightboxItem = Record<string, unknown> & {
    source?: string | null;
    thumb?: string;
    thumbRatio?: number;
};

interface LightboxPanelInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    show(index?: unknown): unknown;
    hide(): unknown;
}

interface LightboxInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    toggle: string;
    toggles: HTMLElement[];
    nav: string;
    panel: LightboxPanelInstance | null | undefined;
    show(index?: number | string | Element): unknown;
    hide(): unknown;
}

type InstalledLightboxOptions = ComponentOptions & { props: Record<string, PropType> };

export default defineComponent<LightboxInstance>()({
    install,

    props: { toggle: String },

    data: { toggle: 'a' },

    computed: {
        toggles: ({ toggle }: { toggle: string }, $el: HTMLElement) => $$(toggle, $el),
    },

    watch: {
        toggles(value: unknown) {
            const toggles = toHtmlElements(value);
            this.hide();
            for (const toggle of toggles) {
                if (isTag(toggle, 'a')) {
                    toggle.role = 'button';
                }
            }
        },
    },

    disconnected() {
        this.hide();
    },

    events: {
        name: 'click',

        delegate: ({ toggle }: LightboxInstance) => toggle,

        handler(e: FrameworkEvent) {
            if (!e.defaultPrevented) {
                e.preventDefault();
                if (e.current instanceof HTMLElement && !matches(e.current, selDisabled)) {
                    this.show(e.current);
                }
            }
        },
    },

    methods: {
        show(index: number | string | Element = 0) {
            let items = this.toggles.map(toItem);

            if (this.nav === 'thumbnav') {
                ensureThumb.call(this, this.toggles, items);
            }

            items = uniqueBy(items, 'source');

            if (isElement(index)) {
                const { source } = toItem(index);
                index = findIndex(items, ({ source: src }) => source === src);
            }

            if (!this.panel) {
                const panel = this.$create('lightboxPanel', { ...this.$props, items });
                if (!isLightboxPanel(panel)) {
                    return;
                }
                this.panel = panel;
            }

            on(this.panel.$el, 'hidden', () => (this.panel = null));

            return this.panel.show(index);
        },

        hide() {
            return this.panel?.hide();
        },
    },
});

function install(Drake: DrakeStatic, Lightbox: InstalledLightboxOptions): void {
    if (!Drake.lightboxPanel) {
        Drake.component('lightboxPanel', LightboxPanel);
    }

    const panelDefinition = Drake.component('lightboxPanel');
    const panelProps =
        typeof panelDefinition === 'function'
            ? panelDefinition.options.props
            : panelDefinition.props;
    if (panelProps && !Array.isArray(panelProps)) {
        assign(Lightbox.props, panelProps);
    }
}

function ensureThumb(this: LightboxInstance, toggles: HTMLElement[], items: LightboxItem[]): void {
    for (const [i, toggle] of toggles.entries()) {
        const item = items[i];
        if (!item || item.thumb) {
            continue;
        }

        const parent = parents(toggle)
            .reverse()
            .concat(toggle)
            .find(
                (parent) =>
                    this.$el.contains(parent) &&
                    (parent === toggle || $$(this.toggle, parent).length === 1),
            );

        if (!parent) {
            continue;
        }

        const media = $<HTMLImageElement | HTMLVideoElement>('img,video', parent);

        if (media) {
            const isImage = media instanceof HTMLImageElement;
            item.thumb = media.currentSrc || (isImage ? '' : media.poster) || media.src;
            item.thumbRatio =
                (isImage ? media.naturalWidth : media.videoWidth) /
                (isImage ? media.naturalHeight : media.videoHeight);
        }
    }
}

function toItem(el: Element): LightboxItem {
    const item: LightboxItem = {};

    for (const attribute of el.getAttributeNames()) {
        const key = attribute.replace(/^data-/, '');
        item[key === 'href' ? 'source' : key] = el.getAttribute(attribute);
    }

    item.attrs = parseOptions(item.attrs);

    return item;
}

function isLightboxPanel(value: unknown): value is LightboxPanelInstance {
    return (
        typeof value === 'object' &&
        value !== null &&
        '$el' in value &&
        value.$el instanceof HTMLElement &&
        'show' in value &&
        typeof value.show === 'function' &&
        'hide' in value &&
        typeof value.hide === 'function'
    );
}

function toHtmlElements(value: unknown): HTMLElement[] {
    return Array.isArray(value)
        ? value.filter((item): item is HTMLElement => item instanceof HTMLElement)
        : [];
}
