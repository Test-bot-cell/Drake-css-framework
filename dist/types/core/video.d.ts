import type { ComponentInternalInstance } from '../types';
type AutoplayMode = boolean | 'hover' | 'inview';
type VideoHost = HTMLVideoElement | HTMLIFrameElement;
interface VideoInstance extends ComponentInternalInstance {
    readonly $el: VideoHost;
    automute: boolean;
    autoplay: AutoplayMode;
    restart: boolean;
    hoverTarget: string | false;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<VideoInstance>;
export default _default;
