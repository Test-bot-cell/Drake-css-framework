import type { ComponentInternalInstance } from '../types';
type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;
interface FormCustomInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    input: FormControl;
    state: Element | null;
    target: HTMLElement | false | undefined;
}
declare const _default: import("../api/options").ExplicitComponentOptionsFor<FormCustomInstance>;
export default _default;
