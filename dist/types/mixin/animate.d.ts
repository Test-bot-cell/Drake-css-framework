import type { ComponentInternalInstance } from '../types';
export type MixinAnimationAction = () => unknown;
interface AnimateInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    animation: boolean | string;
    duration: number;
    animate(action: MixinAnimationAction, target?: HTMLElement): Promise<void>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<AnimateInstance>;
export default _default;
