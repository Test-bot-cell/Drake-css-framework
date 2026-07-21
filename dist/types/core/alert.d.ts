import type { ComponentInternalInstance } from '../types';
interface AlertAnimationContext {
    duration: number;
    transition: string;
    velocity: number;
}
type AlertAnimation = (element: HTMLElement, show: boolean, context: AlertAnimationContext) => Promise<unknown>;
interface AlertInstance extends ComponentInternalInstance, AlertAnimationContext {
    readonly $el: HTMLElement;
    selClose: string;
    close(): Promise<void>;
    toggleElement(target: HTMLElement, toggle: boolean, animate: AlertAnimation): Promise<boolean>;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<AlertInstance>;
export default _default;
