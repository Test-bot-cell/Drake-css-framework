import { defineMixin } from '../api/options';
import type { ComponentInternalInstance, ComponentOptions } from '../types';

type Messages = Record<string, string>;

export interface I18nInstance extends ComponentInternalInstance {
    $options: ComponentOptions & { i18n?: Messages };
    i18n: Messages | null;
    t(key: string, ...params: string[]): string;
}

export default defineMixin<I18nInstance>()({
    props: {
        i18n: Object,
    },

    data: {
        i18n: null,
    },

    methods: {
        t(key: string, ...params: string[]): string {
            let i = 0;
            return (
                (this.i18n?.[key] || this.$options.i18n?.[key])?.replace(
                    /%s/g,
                    () => params[i++] || '',
                ) || ''
            );
        },
    },
});
