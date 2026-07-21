import {
    after,
    append,
    attr,
    fragment,
    includes,
    isElement,
    isTag,
    isVoidElement,
    memoize,
    remove,
    toFloat,
    toNodes,
} from 'uikit-util';
import { defineMixin } from '../api/options';
import type { ComponentInternalInstance } from '../types';

interface SvgInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    width?: number;
    height?: number;
    ratio: number;
    svg: Promise<Element | undefined> | null;
    svgEl: Element | null;
    getSvg(): Promise<Element | undefined>;
}

export default defineMixin<SvgInstance>()({
    args: 'src',

    props: {
        width: Number,
        height: Number,
        ratio: Number,
    },

    data: {
        ratio: 1,
    },

    connected() {
        this.svg = this.getSvg().then(
            (el) => {
                if (!this._connected || !el) {
                    return;
                }

                const svg = insertSVG(el, this.$el);

                if (this.svgEl && svg !== this.svgEl) {
                    remove(this.svgEl);
                }

                applyWidthAndHeight.call(this, svg, el);

                return (this.svgEl = svg);
            },
            () => undefined,
        );
    },

    disconnected() {
        this.svg?.then((svg) => {
            if (this._connected) {
                return;
            }

            if (isVoidElement(this.$el)) {
                this.$el.hidden = false;
            }

            remove(svg);
            this.svgEl = null;
        });

        this.svg = null;
    },

    methods: {
        async getSvg(): Promise<Element | undefined> {
            return undefined;
        },
    },
});

function insertSVG(el: Element, root: HTMLElement): Element {
    if (isVoidElement(root) || isTag(root, 'canvas')) {
        root.hidden = true;

        const next = root.nextElementSibling;
        if (equals(el, next) && next) {
            return next;
        }
        after(root, el);
        return el;
    }

    const last = root.lastElementChild;
    if (equals(el, last) && last) {
        return last;
    }
    append(root, el);
    return el;
}

function equals(el: Element, other: Element | null): boolean {
    return isTag(el, 'svg') && isTag(other, 'svg') && el.innerHTML === other?.innerHTML;
}

function applyWidthAndHeight(this: SvgInstance, el: Element, ref: Element): void {
    const props = ['width', 'height'] as const;
    let dimensions: Array<number | string | null | undefined> = [this.width, this.height];

    if (!dimensions.some((val) => val)) {
        dimensions = props.map((prop) => attr(ref, prop));
    }

    const viewBox = attr(ref, 'viewBox');
    if (viewBox && !dimensions.some((val) => val)) {
        dimensions = viewBox.split(' ').slice(2);
    }

    dimensions.forEach((val, i) => {
        const prop = props[i];
        if (prop) {
            attr(el, prop, toFloat(val) * this.ratio || null);
        }
    });
}

export function parseSVG(svg: string, icon?: string): Element | undefined {
    if (icon && includes(svg, '<symbol')) {
        svg = parseSymbols(svg)[icon] || svg;
    }

    return toNodes(fragment(svg)).filter(isElement)[0];
}

const symbolRe = /<symbol([^]*?id=(['"])(.+?)\2[^]*?<\/)symbol>/g;

const parseSymbols = memoize(function (svg: string): Record<string, string> {
    const symbols: Record<string, string> = {};

    let match;
    while ((match = symbolRe.exec(svg))) {
        const id = match[3];
        const content = match[1];
        if (id && content) {
            symbols[id] = `<svg ${content}svg>`;
        }
    }

    return symbols;
});
