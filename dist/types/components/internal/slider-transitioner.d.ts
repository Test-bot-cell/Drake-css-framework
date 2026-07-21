interface SliderTransitionOptions {
    center: boolean;
    easing: string;
    list: HTMLElement;
}
export interface SliderTransitioner {
    dir: number;
    show(duration: number, percent?: number, linear?: boolean): Promise<void>;
    cancel(): Promise<void>;
    reset(): void;
    forward(duration: number, percent?: number): Promise<void>;
    translate(percent: number): void;
    percent(): number;
    getDistance(): number;
    getItemIn(out?: boolean): HTMLElement | undefined;
    getActives(): HTMLElement[];
}
type Slide = HTMLElement | false | undefined;
export default function (prev: Slide, next: Slide, dir: number, { center, easing, list }: SliderTransitionOptions): SliderTransitioner;
export declare function getMax(list: HTMLElement): number;
export declare function getWidth(list: HTMLElement, index?: number): number;
export {};
