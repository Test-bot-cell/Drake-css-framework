import type { ComponentInternalInstance } from '../types';
interface ContainerInstance extends ComponentInternalInstance {
    container: Element | false | '' | undefined;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<ContainerInstance>;
export default _default;
