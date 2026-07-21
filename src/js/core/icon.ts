import { addClass, attr, css, hasAttr, hasClass, hyphenate, isTag, removeClass } from 'drake-util';
import I18n from '../mixin/i18n';
import type { ComponentInternalInstance } from '../types';

const iconNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface IconInstance extends ComponentInternalInstance {
    icon?: string;
    width?: number;
    height?: number;
    ratio: number;
    role?: string | null;
    _iconAddedAriaHidden?: boolean;
    _iconClasses?: readonly string[];
    t(key: string, ...params: string[]): string;
}

const Icon = {
    args: 'icon',

    props: {
        icon: String,
        width: Number,
        height: Number,
        ratio: Number,
    },

    data: {
        ratio: 1,
    },

    isIcon: true,

    beforeConnect(this: IconInstance) {
        addClass(this.$el, 'drk-icon', 'drk-ti');
    },

    connected(this: IconInstance) {
        const icon = normalizeIconName(this.icon);
        if (!icon) {
            return;
        }

        this._iconClasses = [`drk-ti-${icon}`, `drk-icon-alias-${icon}`];
        addClass(this.$el, this._iconClasses);
        setDimensions(this);
        hideDecorativeIcon(this);
    },

    disconnected(this: IconInstance) {
        removeClass(this.$el, this._iconClasses);
        css(this.$el, {
            '--drk-icon-ratio': '',
            '--drk-icon-width': '',
            '--drk-icon-height': '',
        });
        if (this._iconAddedAriaHidden) {
            attr(this.$el, 'aria-hidden', null);
        }
        this._iconAddedAriaHidden = undefined;
        this._iconClasses = undefined;
    },
};

export default Icon;

export const IconComponent = {
    args: false,

    extends: Icon,

    data: (instance: ComponentInternalInstance) => ({
        icon: hyphenate(instance.constructor.options.name || ''),
    }),

    beforeConnect(this: IconInstance) {
        addClass(this.$el, String(this.$options.id || ''));
    },
};

export const NavParentIcon = {
    extends: IconComponent,

    beforeConnect(this: IconInstance) {
        const icon = readIconProp(this);
        this.icon = this.$el.closest('.drk-nav-primary') ? `${icon}-large` : icon;
    },
};

export const Search = {
    extends: IconComponent,

    mixins: [I18n],

    i18n: { toggle: 'Open Search', submit: 'Submit Search' },

    beforeConnect(this: IconInstance) {
        const isToggle =
            hasClass(this.$el, 'drk-search-toggle') || hasClass(this.$el, 'drk-navbar-toggle');
        this.icon = isToggle
            ? 'search-toggle-icon'
            : hasClass(this.$el, 'drk-search-icon') && this.$el.closest('.drk-search-large')
              ? 'search-large'
              : this.$el.closest('.drk-search-medium')
                ? 'search-medium'
                : readIconProp(this);

        if (hasAttr(this.$el, 'aria-label')) {
            return;
        }

        if (isToggle) {
            attr(this.$el, 'aria-label', this.t('toggle'));
            return;
        }

        const button = this.$el.closest('a,button');
        if (button && !hasAttr(button, 'aria-label')) {
            attr(button, 'aria-label', this.t('submit'));
        }
    },
};

export const Spinner = {
    extends: IconComponent,

    mixins: [I18n],

    i18n: { label: 'Loading' },

    beforeConnect(this: IconInstance) {
        attr(this.$el, 'role', 'status');
        if (!hasAttr(this.$el, 'aria-label')) {
            attr(this.$el, 'aria-label', this.t('label'));
        }
    },
};

const ButtonComponent = {
    extends: IconComponent,

    mixins: [I18n],

    beforeConnect(this: IconInstance) {
        const button = this.$el.closest('a,button');
        if (!button) {
            return;
        }

        attr(
            button,
            'role',
            this.role !== null && isTag(button, 'a') ? 'button' : this.role || null,
        );

        const label = this.t('label');
        if (label && !hasAttr(button, 'aria-label')) {
            attr(button, 'aria-label', label);
        }
    },
};

export const Slidenav = {
    extends: ButtonComponent,

    beforeConnect(this: IconInstance) {
        addClass(this.$el, 'drk-slidenav');
        const icon = readIconProp(this);
        this.icon = hasClass(this.$el, 'drk-slidenav-large') ? `${icon}-large` : icon;
    },
};

export const NavbarToggleIcon = {
    extends: ButtonComponent,

    i18n: { label: 'Open menu' },

    beforeConnect(this: IconInstance) {
        const button = this.$el.closest('a,button');
        if (button && !hasAttr(button, 'aria-expanded')) {
            attr(button, 'aria-expanded', 'false');
        }
    },
};

export const Close = {
    extends: ButtonComponent,

    i18n: { label: 'Close' },

    beforeConnect(this: IconInstance) {
        this.icon = `close-${hasClass(this.$el, 'drk-close-large') ? 'large' : 'icon'}`;
    },
};

export const Marker = {
    extends: ButtonComponent,
    i18n: { label: 'Open' },
};

export const Totop = {
    extends: ButtonComponent,
    i18n: { label: 'Back to top' },
};

export const PaginationNext = {
    extends: ButtonComponent,
    i18n: { label: 'Next page' },
    data: { role: null },
};

export const PaginationPrevious = {
    extends: ButtonComponent,
    i18n: { label: 'Previous page' },
    data: { role: null },
};

function normalizeIconName(icon: string | undefined): string | undefined {
    const name = icon?.trim();
    return name && iconNamePattern.test(name) ? name : undefined;
}

function readIconProp(instance: IconInstance): string {
    const icon = instance.$props.icon;
    return typeof icon === 'string' ? icon : '';
}

function setDimensions(instance: IconInstance): void {
    const ratio = positiveNumber(instance.ratio) || 1;
    css(instance.$el, '--drk-icon-ratio', ratio);

    const width = positiveNumber(instance.width);
    if (width) {
        css(instance.$el, '--drk-icon-width', `${width}px`);
    }

    const height = positiveNumber(instance.height);
    if (height) {
        css(instance.$el, '--drk-icon-height', `${height}px`);
    }
}

function hideDecorativeIcon(instance: IconInstance): void {
    const role = attr(instance.$el, 'role')?.toLowerCase();
    const hasAccessibleName =
        hasAttr(instance.$el, 'aria-label') || hasAttr(instance.$el, 'aria-labelledby');

    if (
        !hasAccessibleName &&
        role !== 'status' &&
        role !== 'img' &&
        !hasAttr(instance.$el, 'aria-hidden')
    ) {
        attr(instance.$el, 'aria-hidden', 'true');
        instance._iconAddedAriaHidden = true;
    }
}

function positiveNumber(value: number | undefined): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}
