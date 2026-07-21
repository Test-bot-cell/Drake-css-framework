import type { ComponentInternalInstance } from '../types';
interface CountdownInstance extends ComponentInternalInstance {
    $props: ComponentInternalInstance['$props'] & {
        date: string;
    };
    date: number;
    clsWrapper: string;
    role: string;
    reload: boolean;
    started: boolean;
    end: boolean;
    timer: number | null | undefined;
    start(): void;
    stop(): void;
    update(): void;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<CountdownInstance>;
export default _default;
