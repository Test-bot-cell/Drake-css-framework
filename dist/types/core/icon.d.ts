import type { ComponentInternalInstance } from '../types';
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
declare const Icon: {
    args: string;
    props: {
        icon: StringConstructor;
        width: NumberConstructor;
        height: NumberConstructor;
        ratio: NumberConstructor;
    };
    data: {
        ratio: number;
    };
    isIcon: boolean;
    beforeConnect(this: IconInstance): void;
    connected(this: IconInstance): void;
    disconnected(this: IconInstance): void;
};
export default Icon;
export declare const IconComponent: {
    args: boolean;
    extends: {
        args: string;
        props: {
            icon: StringConstructor;
            width: NumberConstructor;
            height: NumberConstructor;
            ratio: NumberConstructor;
        };
        data: {
            ratio: number;
        };
        isIcon: boolean;
        beforeConnect(this: IconInstance): void;
        connected(this: IconInstance): void;
        disconnected(this: IconInstance): void;
    };
    data: (instance: ComponentInternalInstance) => {
        icon: string;
    };
    beforeConnect(this: IconInstance): void;
};
export declare const NavParentIcon: {
    extends: {
        args: boolean;
        extends: {
            args: string;
            props: {
                icon: StringConstructor;
                width: NumberConstructor;
                height: NumberConstructor;
                ratio: NumberConstructor;
            };
            data: {
                ratio: number;
            };
            isIcon: boolean;
            beforeConnect(this: IconInstance): void;
            connected(this: IconInstance): void;
            disconnected(this: IconInstance): void;
        };
        data: (instance: ComponentInternalInstance) => {
            icon: string;
        };
        beforeConnect(this: IconInstance): void;
    };
    beforeConnect(this: IconInstance): void;
};
export declare const Search: {
    extends: {
        args: boolean;
        extends: {
            args: string;
            props: {
                icon: StringConstructor;
                width: NumberConstructor;
                height: NumberConstructor;
                ratio: NumberConstructor;
            };
            data: {
                ratio: number;
            };
            isIcon: boolean;
            beforeConnect(this: IconInstance): void;
            connected(this: IconInstance): void;
            disconnected(this: IconInstance): void;
        };
        data: (instance: ComponentInternalInstance) => {
            icon: string;
        };
        beforeConnect(this: IconInstance): void;
    };
    mixins: import("../api/options").ExplicitComponentOptionsFor<import("../mixin/i18n").I18nInstance>[];
    i18n: {
        toggle: string;
        submit: string;
    };
    beforeConnect(this: IconInstance): void;
};
export declare const Spinner: {
    extends: {
        args: boolean;
        extends: {
            args: string;
            props: {
                icon: StringConstructor;
                width: NumberConstructor;
                height: NumberConstructor;
                ratio: NumberConstructor;
            };
            data: {
                ratio: number;
            };
            isIcon: boolean;
            beforeConnect(this: IconInstance): void;
            connected(this: IconInstance): void;
            disconnected(this: IconInstance): void;
        };
        data: (instance: ComponentInternalInstance) => {
            icon: string;
        };
        beforeConnect(this: IconInstance): void;
    };
    mixins: import("../api/options").ExplicitComponentOptionsFor<import("../mixin/i18n").I18nInstance>[];
    i18n: {
        label: string;
    };
    beforeConnect(this: IconInstance): void;
};
export declare const Slidenav: {
    extends: {
        extends: {
            args: boolean;
            extends: {
                args: string;
                props: {
                    icon: StringConstructor;
                    width: NumberConstructor;
                    height: NumberConstructor;
                    ratio: NumberConstructor;
                };
                data: {
                    ratio: number;
                };
                isIcon: boolean;
                beforeConnect(this: IconInstance): void;
                connected(this: IconInstance): void;
                disconnected(this: IconInstance): void;
            };
            data: (instance: ComponentInternalInstance) => {
                icon: string;
            };
            beforeConnect(this: IconInstance): void;
        };
        mixins: import("../api/options").ExplicitComponentOptionsFor<import("../mixin/i18n").I18nInstance>[];
        beforeConnect(this: IconInstance): void;
    };
    i18n: {
        next: string;
        previous: string;
    };
    beforeConnect(this: IconInstance): void;
};
export declare const NavbarToggleIcon: {
    extends: {
        extends: {
            args: boolean;
            extends: {
                args: string;
                props: {
                    icon: StringConstructor;
                    width: NumberConstructor;
                    height: NumberConstructor;
                    ratio: NumberConstructor;
                };
                data: {
                    ratio: number;
                };
                isIcon: boolean;
                beforeConnect(this: IconInstance): void;
                connected(this: IconInstance): void;
                disconnected(this: IconInstance): void;
            };
            data: (instance: ComponentInternalInstance) => {
                icon: string;
            };
            beforeConnect(this: IconInstance): void;
        };
        mixins: import("../api/options").ExplicitComponentOptionsFor<import("../mixin/i18n").I18nInstance>[];
        beforeConnect(this: IconInstance): void;
    };
    i18n: {
        label: string;
    };
    beforeConnect(this: IconInstance): void;
};
export declare const Close: {
    extends: {
        extends: {
            args: boolean;
            extends: {
                args: string;
                props: {
                    icon: StringConstructor;
                    width: NumberConstructor;
                    height: NumberConstructor;
                    ratio: NumberConstructor;
                };
                data: {
                    ratio: number;
                };
                isIcon: boolean;
                beforeConnect(this: IconInstance): void;
                connected(this: IconInstance): void;
                disconnected(this: IconInstance): void;
            };
            data: (instance: ComponentInternalInstance) => {
                icon: string;
            };
            beforeConnect(this: IconInstance): void;
        };
        mixins: import("../api/options").ExplicitComponentOptionsFor<import("../mixin/i18n").I18nInstance>[];
        beforeConnect(this: IconInstance): void;
    };
    i18n: {
        label: string;
    };
    beforeConnect(this: IconInstance): void;
};
export declare const Marker: {
    extends: {
        extends: {
            args: boolean;
            extends: {
                args: string;
                props: {
                    icon: StringConstructor;
                    width: NumberConstructor;
                    height: NumberConstructor;
                    ratio: NumberConstructor;
                };
                data: {
                    ratio: number;
                };
                isIcon: boolean;
                beforeConnect(this: IconInstance): void;
                connected(this: IconInstance): void;
                disconnected(this: IconInstance): void;
            };
            data: (instance: ComponentInternalInstance) => {
                icon: string;
            };
            beforeConnect(this: IconInstance): void;
        };
        mixins: import("../api/options").ExplicitComponentOptionsFor<import("../mixin/i18n").I18nInstance>[];
        beforeConnect(this: IconInstance): void;
    };
    i18n: {
        label: string;
    };
};
export declare const Totop: {
    extends: {
        extends: {
            args: boolean;
            extends: {
                args: string;
                props: {
                    icon: StringConstructor;
                    width: NumberConstructor;
                    height: NumberConstructor;
                    ratio: NumberConstructor;
                };
                data: {
                    ratio: number;
                };
                isIcon: boolean;
                beforeConnect(this: IconInstance): void;
                connected(this: IconInstance): void;
                disconnected(this: IconInstance): void;
            };
            data: (instance: ComponentInternalInstance) => {
                icon: string;
            };
            beforeConnect(this: IconInstance): void;
        };
        mixins: import("../api/options").ExplicitComponentOptionsFor<import("../mixin/i18n").I18nInstance>[];
        beforeConnect(this: IconInstance): void;
    };
    i18n: {
        label: string;
    };
};
export declare const PaginationNext: {
    extends: {
        extends: {
            args: boolean;
            extends: {
                args: string;
                props: {
                    icon: StringConstructor;
                    width: NumberConstructor;
                    height: NumberConstructor;
                    ratio: NumberConstructor;
                };
                data: {
                    ratio: number;
                };
                isIcon: boolean;
                beforeConnect(this: IconInstance): void;
                connected(this: IconInstance): void;
                disconnected(this: IconInstance): void;
            };
            data: (instance: ComponentInternalInstance) => {
                icon: string;
            };
            beforeConnect(this: IconInstance): void;
        };
        mixins: import("../api/options").ExplicitComponentOptionsFor<import("../mixin/i18n").I18nInstance>[];
        beforeConnect(this: IconInstance): void;
    };
    i18n: {
        label: string;
    };
    data: {
        role: null;
    };
};
export declare const PaginationPrevious: {
    extends: {
        extends: {
            args: boolean;
            extends: {
                args: string;
                props: {
                    icon: StringConstructor;
                    width: NumberConstructor;
                    height: NumberConstructor;
                    ratio: NumberConstructor;
                };
                data: {
                    ratio: number;
                };
                isIcon: boolean;
                beforeConnect(this: IconInstance): void;
                connected(this: IconInstance): void;
                disconnected(this: IconInstance): void;
            };
            data: (instance: ComponentInternalInstance) => {
                icon: string;
            };
            beforeConnect(this: IconInstance): void;
        };
        mixins: import("../api/options").ExplicitComponentOptionsFor<import("../mixin/i18n").I18nInstance>[];
        beforeConnect(this: IconInstance): void;
    };
    i18n: {
        label: string;
    };
    data: {
        role: null;
    };
};
