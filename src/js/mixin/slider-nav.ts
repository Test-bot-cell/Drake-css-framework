import {
    $,
    $$,
    attr,
    children,
    data,
    html,
    isEqual,
    isNumeric,
    isTag,
    matches,
    parent,
    toFloat,
    toNumber,
    toggleClass,
} from 'drake-util';
import { generateId } from '../api/instance';
import { defineMixin } from '../api/options';
import { keyMap } from '../util/keys';
import { maybeDefaultPreventClick } from './event';
import type { ElementEvent, SliderIndex, SliderInstance } from './types';

interface SliderNavInstance extends SliderInstance {
    selNav: string | false;
    attrItem: string;
    role: string;
    nav: HTMLElement[];
    navChildren: HTMLElement[];
    selNavItem: string;
    navItems: HTMLElement[];
    updateNav(): void;
    padNavitems(): void;
}

interface SliderNavEvent extends ElementEvent {
    current: HTMLElement;
    keyCode: number;
}

export default defineMixin<SliderNavInstance>()({
    i18n: {
        next: 'Next slide',
        previous: 'Previous slide',
        slideX: 'Slide %s',
        slideLabel: '%s of %s',
    },

    data: {
        selNav: false,
        role: 'region',
    },

    computed: {
        nav: ({ selNav }: { selNav: string | false }, $el: HTMLElement) =>
            selNav ? $$<HTMLElement>(selNav, $el) : [],

        navChildren(): HTMLElement[] {
            return this.nav
                .flatMap((nav) => children(nav))
                .filter((item): item is HTMLElement => item instanceof HTMLElement);
        },

        selNavItem: ({ attrItem }: { attrItem: string }) => `[${attrItem}],[data-${attrItem}]`,

        navItems(_data: object, $el: HTMLElement): HTMLElement[] {
            return $$<HTMLElement>(this.selNavItem, $el);
        },
    },

    watch: {
        nav(nav: HTMLElement[], prev: HTMLElement[] | undefined): void {
            attr(nav, 'role', 'tablist');
            this.padNavitems();

            if (prev) {
                this.$emit();
            }
        },

        list(list: HTMLElement | undefined): void {
            if (isTag(list, 'ul')) {
                attr(list, 'role', 'presentation');
            }
        },

        navChildren(items: HTMLElement[]): void {
            attr(items, 'role', 'presentation');
            this.padNavitems();
            this.updateNav();
        },

        navItems(items: HTMLElement[]): void {
            for (const el of items) {
                const cmd = data(el, this.attrItem);
                const button = $('a,button', el) || el;

                let ariaLabel;
                let ariaControls = null;
                if (isNumeric(cmd)) {
                    const item = toNumber(cmd);
                    if (item === false) {
                        continue;
                    }
                    const slide = this.slides[item];

                    if (slide) {
                        if (!slide.id) {
                            slide.id = generateId(this, slide);
                        }
                        ariaControls = slide.id;
                    }

                    ariaLabel = this.t('slideX', toFloat(cmd) + 1);

                    button.role = 'tab';
                } else {
                    if (this.list) {
                        if (!this.list.id) {
                            this.list.id = generateId(this, this.list);
                        }

                        ariaControls = this.list.id;
                    }

                    ariaLabel = this.t(cmd ?? '');
                }

                attr(button, 'aria-controls', ariaControls);
                button.ariaLabel = button.ariaLabel || ariaLabel;
            }
        },

        slides(slides: HTMLElement[]): void {
            slides.forEach((slide, i) =>
                attr(slide, {
                    role: this.nav.length ? 'tabpanel' : 'group',
                    'aria-label': this.t('slideLabel', i + 1, this.length),
                    'aria-roledescription': this.nav.length ? null : 'slide',
                }),
            );

            this.padNavitems();
        },
    },

    connected() {
        this.$el.role = this.role;
        this.$el.ariaRoleDescription = 'carousel';
    },

    update: [
        {
            write() {
                this.navItems
                    .concat(this.nav)
                    .forEach((el) => el && (el.hidden = this.maxIndex < 1));
                this.updateNav();
            },

            events: ['resize'],
        },
    ],

    events: [
        {
            name: 'click keydown',

            delegate: ({ selNavItem }) => selNavItem,

            filter: ({ parallax }) => !parallax,

            handler(e: SliderNavEvent): void {
                if (
                    e.target.closest('a,button') &&
                    (e.type === 'click' || e.keyCode === keyMap.SPACE)
                ) {
                    maybeDefaultPreventClick(e);
                    const command = toSliderIndex(data(e.current, this.attrItem));
                    if (command !== undefined) {
                        void this.show(command);
                    }
                }
            },
        },

        {
            name: 'itemshow',
            handler(): void {
                this.updateNav();
            },
        },

        {
            name: 'keydown',

            delegate: ({ selNavItem }) => selNavItem,

            filter: ({ parallax }) => !parallax,

            handler(e: SliderNavEvent): void {
                const { current, keyCode } = e;
                const cmd = data(current, this.attrItem);

                if (!isNumeric(cmd)) {
                    return;
                }

                const item: SliderIndex | -1 =
                    keyCode === keyMap.HOME
                        ? 0
                        : keyCode === keyMap.END
                          ? 'last'
                          : keyCode === keyMap.LEFT
                            ? 'previous'
                            : keyCode === keyMap.RIGHT
                              ? 'next'
                              : -1;

                if (item !== -1) {
                    e.preventDefault();
                    void this.show(item);
                }
            },
        },
    ],

    methods: {
        updateNav(): void {
            const index = this.getValidIndex();

            for (const el of this.navItems) {
                const cmd = data(el, this.attrItem);
                const button = $('a,button', el) || el;

                if (isNumeric(cmd)) {
                    const item = toNumber(cmd);
                    if (item === false) {
                        continue;
                    }
                    const active = item === index;

                    toggleClass(el, this.clsActive, active);
                    toggleClass(button, 'drk-disabled', !!this.parallax);

                    button.ariaSelected = String(active);
                    button.tabIndex = active && !this.parallax ? 0 : -1;

                    if (active && button && matches(parent(el), ':focus-within')) {
                        button.focus();
                    }
                } else {
                    toggleClass(
                        el,
                        'drk-invisible',
                        this.finite &&
                            ((cmd === 'previous' && index === 0) ||
                                (cmd === 'next' && index >= this.maxIndex)),
                    );
                }
            }
        },

        padNavitems(): void {
            for (const nav of this.nav) {
                const navChildren = children(nav);
                const navItems: Element[] = [];
                for (let i = 0; i < this.length; i++) {
                    const attr = `${this.attrItem}="${i}"`;
                    const existing = [...navChildren]
                        .reverse()
                        .find((element) => element.matches(`[${attr}]`));
                    const created = $(`<li ${attr}><a href></a></li>`);
                    const item = existing || created;
                    if (item) {
                        navItems[i] = item;
                    }
                }
                if (!isEqual(navItems, navChildren)) {
                    html(nav, navItems);
                }
            }
        },
    },
});

function toSliderIndex(value: string | null | undefined): SliderIndex | undefined {
    if (isNumeric(value)) {
        const number = toNumber(value);
        return number === false ? undefined : number;
    }
    return value === 'next' || value === 'previous' || value === 'last' ? value : undefined;
}
