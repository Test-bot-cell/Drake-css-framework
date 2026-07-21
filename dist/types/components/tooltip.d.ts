import type { Axis, ComponentInternalInstance, ComponentOptions, Side } from '../types';
type Direction = Side | 'center';
type Alignment = [Direction, Direction];
interface TooltipInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $options: ComponentOptions & {
        name: string;
    };
    container: Element;
    tooltip: HTMLElement | null | undefined;
    pos: Alignment;
    axis: Axis;
    origin: string | false;
    showTimer: number | undefined;
    reset: (() => void) | undefined;
    show(): void;
    hide(): Promise<void>;
    _show(title: string, id: string): Promise<void>;
    isToggled(element: Element | null): boolean;
    toggleElement(element: Element, toggled: boolean, animate?: boolean): Promise<boolean>;
    positionAt(element: Element, target: Element): void;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<TooltipInstance>;
export default _default;
