import type { ComponentInternalInstance, CssProperties } from '../types';
interface NotificationInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    container: Element;
    message: string;
    status: string;
    timeout: number;
    group: string;
    pos: string;
    clsContainer: string;
    clsClose: string;
    clsMsg: string;
    marginProp: string;
    startProps: CssProperties;
    timer: number | undefined;
    close(immediate?: boolean): Promise<void>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<NotificationInstance>;
export default _default;
