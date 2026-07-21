import {
    $$,
    attr,
    children,
    css,
    data,
    endsWith,
    findIndex,
    getIndex,
    hasClass,
    isNumeric,
    isTag,
    matches,
    queryAll,
    toArray,
    toggleClass,
} from 'uikit-util';
import { generateId } from '../api/instance';
import { lazyload, swipe } from '../api/observables';
import { defineComponent } from '../api/options';
import { maybeDefaultPreventClick } from '../mixin/event';
import Togglable from '../mixin/togglable';
import type { ComponentInternalInstance, FrameworkEvent, NodeInput } from '../types';
import { keyMap } from '../util/keys';
import type { IndexSpecifier } from '../util/lang';

const selDisabled = '.uk-disabled *, .uk-disabled, [disabled]';

interface SwitcherProps {
    connect: string;
    toggle: string;
}

interface SwitcherInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    connects: HTMLElement[];
    connectChildren: Element[];
    toggles: HTMLElement[];
    toggle: string;
    children: Element[];
    active: number;
    cls: string;
    itemNav: string | false;
    attrItem: string;
    selVertical: string;
    followFocus: boolean;
    swiping: boolean;
    index(): number;
    next(item: SwitcherItem, previous?: number): number;
    show(item: SwitcherItem): void;
    toggleElement(targets: NodeInput, toggle?: boolean, animate?: boolean): Promise<boolean>;
}

type SwitcherKeyboardEvent = FrameworkEvent<Element> & { keyCode?: number };

export default defineComponent<SwitcherInstance>()({
    mixins: [Togglable],

    args: 'connect',

    props: {
        connect: String,
        toggle: String,
        itemNav: String,
        active: Number,
        followFocus: Boolean,
        swiping: Boolean,
    },

    data: {
        connect: '~.uk-switcher',
        toggle: '> * > :first-child',
        itemNav: false,
        active: 0,
        cls: 'uk-active',
        attrItem: 'uk-switcher-item',
        selVertical: '.uk-nav',
        followFocus: false,
        swiping: true,
    },

    computed: {
        connects: {
            get: ({ connect }: SwitcherProps, $el: Element) => queryAll<HTMLElement>(connect, $el),
            observe: ({ connect }: SwitcherProps) => connect,
        },

        connectChildren() {
            return this.connects.map((el) => children(el)).flat();
        },

        toggles: ({ toggle }: SwitcherProps, $el: Element) => $$<HTMLElement>(toggle, $el),

        children(_props: SwitcherProps, $el: Element) {
            return children($el).filter((child) =>
                this.toggles.some((toggle) => child.contains(toggle)),
            );
        },
    },

    watch: {
        connects(connects: HTMLElement[]) {
            if (this.swiping) {
                css(connects, 'touchAction', 'pan-y pinch-zoom');
            }
            this.$emit();
        },

        connectChildren() {
            const index = Math.max(0, this.index());
            for (const el of this.connects) {
                children(el).forEach((child, i) => toggleClass(child, this.cls, i === index));
            }
            this.$emit();
        },

        toggles() {
            this.$emit();
            const active = this.index();
            this.show(~active ? active : this.next(this.active));
        },
    },

    connected() {
        this.$el.role = 'tablist';
    },

    observe: [
        lazyload<SwitcherInstance>({ targets: ({ connectChildren }) => connectChildren }),
        swipe<SwitcherInstance>({
            target: ({ connects }) => connects,
            filter: ({ swiping }) => swiping,
        }),
    ],

    events: [
        {
            name: 'click keydown',

            delegate: ({ toggle }: SwitcherInstance) => toggle,

            handler(e: SwitcherKeyboardEvent) {
                if (
                    !matches(e.current, selDisabled) &&
                    (e.type === 'click' || e.keyCode === keyMap.SPACE)
                ) {
                    maybeDefaultPreventClick(e);
                    if (e.current) {
                        this.show(e.current);
                    }
                }
            },
        },

        {
            name: 'keydown',

            delegate: ({ toggle }: SwitcherInstance) => toggle,

            handler(e: SwitcherKeyboardEvent) {
                const { current, keyCode } = e;
                const isVertical = matches(this.$el, this.selVertical);

                const item: IndexSpecifier | -1 =
                    keyCode === keyMap.HOME
                        ? 0
                        : keyCode === keyMap.END
                          ? 'last'
                          : (keyCode === keyMap.LEFT && !isVertical) ||
                              (keyCode === keyMap.UP && isVertical)
                            ? 'previous'
                            : (keyCode === keyMap.RIGHT && !isVertical) ||
                                (keyCode === keyMap.DOWN && isVertical)
                              ? 'next'
                              : -1;

                if (item !== -1) {
                    e.preventDefault();
                    const next =
                        this.toggles[
                            this.next(
                                item,
                                current instanceof HTMLElement ? this.toggles.indexOf(current) : -1,
                            )
                        ];
                    if (next) {
                        next.focus();
                        if (this.followFocus) {
                            this.show(next);
                        }
                    }
                }
            },
        },

        {
            name: 'click',

            el: ({ $el, connects, itemNav }: SwitcherInstance) =>
                connects.concat(itemNav ? queryAll(itemNav, $el) : []),

            delegate: ({ attrItem }: SwitcherInstance) => `[${attrItem}],[data-${attrItem}]`,

            handler(e: FrameworkEvent<Element>) {
                if (e.target?.closest('a,button')) {
                    maybeDefaultPreventClick(e);
                    const item = data(e.current, this.attrItem);
                    if (item !== undefined && item !== null) {
                        this.show(item);
                    }
                }
            },
        },

        {
            name: 'swipeRight swipeLeft',

            filter: ({ swiping }: SwitcherInstance) => swiping,

            el: ({ connects }: SwitcherInstance) => connects,

            handler({ type }: FrameworkEvent) {
                this.show(endsWith(type, 'Left') ? 'next' : 'previous');
            },
        },
    ],

    update() {
        for (const el of this.connects) {
            if (isTag(el, 'ul')) {
                el.role = 'presentation';
            }
        }
        attr(children(this.$el), 'role', 'presentation');

        for (const [index, toggle] of this.toggles.entries()) {
            const item = this.connects[0]?.children[index];

            toggle.role = 'tab';

            if (!item) {
                continue;
            }

            toggle.id = generateId(this, toggle);
            item.id = generateId(this, item);

            attr(toggle, 'aria-controls', item.id);
            attr(item, { role: 'tabpanel', 'aria-labelledby': toggle.id });
        }
        attr(this.$el, 'aria-orientation', matches(this.$el, this.selVertical) ? 'vertical' : null);
    },

    methods: {
        index() {
            return findIndex(this.children, (el) => hasClass(el, this.cls));
        },

        next(item: SwitcherItem, prev?: number) {
            prev ??= this.index();
            if (isNumeric(item)) {
                for (let i = 0; i < this.toggles.length; i++) {
                    const index = getIndex(i + Number(item), this.toggles);
                    if (!matches(this.toggles[index], selDisabled)) {
                        return index;
                    }
                }
            }

            const toggles = this.toggles.filter((el) => !matches(el, selDisabled));
            const currentToggle = this.toggles[prev];
            const resolvedItem = resolveSwitcherItem(item);
            return getIndex(
                toggles[
                    getIndex(
                        resolvedItem,
                        toggles,
                        currentToggle ? toggles.indexOf(currentToggle) : -1,
                    )
                ] ?? -1,
                this.toggles,
            );
        },

        show(item: SwitcherItem) {
            const prev = this.index();
            const next = this.next(item);

            this.children.forEach((child, i) => {
                toggleClass(child, this.cls, next === i);
                attr(this.toggles[i], {
                    'aria-selected': next === i,
                    tabindex: next === i ? null : -1,
                });
            });

            const animate = prev >= 0 && prev !== next;
            this.connects.forEach(async ({ children }) => {
                const actives = toArray(children).filter(
                    (child, i) => i !== next && hasClass(child, this.cls),
                );

                if (await this.toggleElement(actives, false, animate)) {
                    await this.toggleElement(children[next], true, animate);
                }
            });
        },
    },
});

type SwitcherItem = IndexSpecifier | string;

function resolveSwitcherItem(item: SwitcherItem): IndexSpecifier {
    if (item instanceof Node || typeof item === 'number') {
        return item;
    }
    if (item === 'next' || item === 'previous' || item === 'last') {
        return item;
    }
    return isNumeric(item) ? Number(item) : -1;
}
