import type { ComponentInternalInstance } from '../types';
import type { SlideshowAnimation, SlideshowAnimations, SlideshowTransitionerConstructor } from './types';
interface SlideshowInstance extends ComponentInternalInstance {
    animation: SlideshowAnimation & {
        name: string;
    };
    Animations: SlideshowAnimations;
    Transitioner: SlideshowTransitionerConstructor;
    clsActive: string;
    clsActivated: string;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<SlideshowInstance>;
export default _default;
