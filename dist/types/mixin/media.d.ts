import type { ComponentInternalInstance, Teardown } from '../types';
type MediaValue = boolean | number | string;
interface MediaInstance extends ComponentInternalInstance {
    media: MediaValue;
    matchMedia: boolean;
    mediaObj: MediaQueryList;
    offMediaObj?: Teardown;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<MediaInstance>;
export default _default;
