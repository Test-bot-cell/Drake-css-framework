import { $$, addClass, css, hasClass, offset, removeClass } from 'drake-util';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance, FrameworkEvent } from '../types';
import { awaitTimeout } from '../util/await';
import { active } from './drop';
import Dropnav from './dropnav';

const clsNavbarTransparent = 'drk-navbar-transparent';

interface NavbarProps {
    dropbarTransparentMode: boolean | 'behind' | 'remove';
}

interface NavbarDropdown extends ComponentInternalInstance {
    inset: boolean;
    targetEl: Element;
}

interface NavbarInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    navbarContainer: HTMLElement | null;
    items: HTMLElement[];
    dropContainer: HTMLElement;
    dropbar: HTMLElement | null;
    dropbarTransparentMode: boolean | 'behind' | 'remove';
    _transparent: boolean | null;
    getTransparentMode(element: Element): boolean | 'behind' | 'remove' | undefined;
    getDropbarOffset(offsetTop: number): number;
    getDropdown(element: Element): NavbarDropdown | undefined;
    isDropbarDrop(element: Element): boolean;
}

export default defineComponent<NavbarInstance>()({
    extends: Dropnav,

    props: {
        dropbarTransparentMode: Boolean,
    },

    data: {
        flip: false,
        autoUpdate: false,
        delayShow: 200,
        clsDrop: 'drk-navbar-dropdown',
        selNavItem:
            '.drk-navbar-nav > li > a,a.drk-navbar-item,button.drk-navbar-item,.drk-navbar-item a,.drk-navbar-item button,.drk-navbar-toggle', // Simplify with :where() selector once browser target is Safari 14+
        dropbarTransparentMode: false,
    },

    computed: {
        navbarContainer: (_props: NavbarProps, $el: Element) =>
            $el.closest<HTMLElement>('.drk-navbar-container'),
    },

    watch: {
        items() {
            const justify = hasClass(this.$el, 'drk-navbar-justify');
            const containers = $$('.drk-navbar-nav, .drk-navbar-left, .drk-navbar-right', this.$el);
            for (const container of containers) {
                const items = justify
                    ? $$(
                          '.drk-navbar-nav > li > a, .drk-navbar-item, .drk-navbar-toggle',
                          container,
                      ).length
                    : '';
                css(container, 'flexGrow', items);
            }
        },
    },

    events: [
        {
            name: 'show',

            el: ({ dropContainer }: NavbarInstance) => dropContainer,

            handler({ target }: FrameworkEvent<Element>) {
                if (
                    target &&
                    this.getTransparentMode(target) === 'remove' &&
                    hasClass(this.navbarContainer, clsNavbarTransparent)
                ) {
                    removeClass(this.navbarContainer, clsNavbarTransparent);
                    this._transparent = true;
                }
            },
        },
        {
            name: 'hide',

            el: ({ dropContainer }: NavbarInstance) => dropContainer,

            async handler() {
                await awaitTimeout(0);

                if (this._transparent && (!active || !this.dropContainer.contains(active.$el))) {
                    addClass(this.navbarContainer, clsNavbarTransparent);
                    this._transparent = null;
                }
            },
        },
    ],

    methods: {
        getTransparentMode(el: Element) {
            if (!this.navbarContainer) {
                return;
            }

            if (this.dropbar && this.isDropbarDrop(el)) {
                return this.dropbarTransparentMode;
            }

            const drop = this.getDropdown(el);

            if (drop && hasClass(el, 'drk-dropbar')) {
                return drop.inset ? 'behind' : 'remove';
            }
        },

        getDropbarOffset(offsetTop: number) {
            const { top, height } = offset(this.navbarContainer);
            return top + (this.dropbarTransparentMode === 'behind' ? 0 : height + offsetTop);
        },
    },
});
