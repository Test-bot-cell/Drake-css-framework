import {
    addClass,
    attr,
    css,
    hasAttr,
    hasClass,
    hyphenate,
    isTag,
    matches,
    removeClass,
    selFocusable,
} from 'drake-util';
import I18n from '../mixin/i18n';
import type { ComponentInternalInstance } from '../types';

const iconNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Garde de focalisabilité (D-026, axe 3) : hôtes focalisables ou en passe de
// l'être — le déclencheur [drk-tooltip] reçoit son tabindex du composant
// tooltip après le connect de l'icône. Jamais aria-hidden sur ces hôtes.
const selFocusableHost = `${selFocusable},[drk-tooltip]`;

// Hôtes dont le rôle implicite accepte aria-label (nommables sans rôle
// explicite). Les autres (span[drk-tooltip], [tabindex]…) sont génériques :
// aria-label y est interdit (aria-prohibited-attr) sans role explicite.
const selNamableHost = 'a[href],area[href],button,input,select,textarea,summary';

interface IconInstance extends ComponentInternalInstance {
    icon?: string;
    width?: number;
    height?: number;
    ratio: number;
    role?: string | null;
    _iconAddedAriaHidden?: boolean;
    _iconAddedAriaLabel?: boolean;
    _iconAddedRole?: boolean;
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
        hideDecorativeIcon(this, icon);
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
        if (this._iconAddedAriaLabel) {
            attr(this.$el, 'aria-label', null);
        }
        if (this._iconAddedRole) {
            attr(this.$el, 'role', null);
        }
        this._iconAddedAriaHidden = undefined;
        this._iconAddedAriaLabel = undefined;
        this._iconAddedRole = undefined;
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

    // D-026 (axe 3) : libellés de repli des slidenav autonomes — mêmes clés et
    // mêmes valeurs que le mixin slider-nav, qui conserve tout aria-label déjà
    // posé (la course slider-nav est neutralisée par le garde de focalisabilité).
    i18n: { next: 'Next slide', previous: 'Previous slide' },

    beforeConnect(this: IconInstance) {
        addClass(this.$el, 'drk-slidenav');
        const icon = readIconProp(this);
        this.icon = hasClass(this.$el, 'drk-slidenav-large') ? `${icon}-large` : icon;

        const button = this.$el.closest('a,button');
        if (button && !hasAttr(button, 'aria-label')) {
            const direction = String(this.$options.id || '').includes('previous')
                ? 'previous'
                : 'next';
            attr(button, 'aria-label', this.t(direction));
        }
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

function hideDecorativeIcon(instance: IconInstance, icon: string): void {
    const role = attr(instance.$el, 'role')?.toLowerCase();
    const hasAccessibleName =
        hasAttr(instance.$el, 'aria-label') || hasAttr(instance.$el, 'aria-labelledby');

    if (hasAccessibleName || role === 'status' || role === 'img') {
        return;
    }

    // D-026 (axe 3) : jamais aria-hidden sur un hôte focalisable — le clavier
    // atteindrait un contrôle muet pour le lecteur d'écran (aria-hidden-focus).
    // L'hôte sans nom accessible reçoit un libellé de repli dérivé du nom
    // d'icône, surchargeable par l'auteur via aria-label/aria-labelledby.
    if (matches(instance.$el, selFocusableHost)) {
        attr(instance.$el, 'aria-label', icon.replaceAll('-', ' '));
        instance._iconAddedAriaLabel = true;
        // D-026 (solde) : aria-label est interdit sur un élément générique
        // (aria-prohibited-attr). L'hôte sans rôle implicite nommable reçoit
        // role="img" avec son libellé de repli — retiré au disconnect.
        if (!hasAttr(instance.$el, 'role') && !matches(instance.$el, selNamableHost)) {
            attr(instance.$el, 'role', 'img');
            instance._iconAddedRole = true;
        }
        return;
    }

    if (!hasAttr(instance.$el, 'aria-hidden')) {
        attr(instance.$el, 'aria-hidden', 'true');
        instance._iconAddedAriaHidden = true;
    }
}

function positiveNumber(value: number | undefined): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}
