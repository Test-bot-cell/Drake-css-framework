import type { ComponentInternalInstance, ComponentOptions } from '../types';
type Messages = Record<string, string>;
export interface I18nInstance extends ComponentInternalInstance {
    $options: ComponentOptions & {
        i18n?: Messages;
    };
    i18n: Messages | null;
    t(key: string, ...params: string[]): string;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<I18nInstance>;
export default _default;
