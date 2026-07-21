import { $, $$, isInput, matches, parent, selInput } from 'uikit-util';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import type { ComponentInternalInstance } from '../types';

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;

interface FormCustomProps {
    target: boolean | string;
}

interface FormCustomInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    input: FormControl;
    state: Element | null;
    target: HTMLElement | false | undefined;
}

export default defineComponent<FormCustomInstance>()({
    mixins: [Class],

    args: 'target',

    props: {
        target: Boolean,
    },

    data: {
        target: false,
    },

    computed: {
        input: (_props: FormCustomProps, $el: Element) => $<FormControl>(selInput, $el),

        state() {
            return this.input.nextElementSibling;
        },

        target({ target }: FormCustomProps, $el: Element) {
            return (
                target &&
                ((target === true && parent(this.input) === $el && this.input.nextElementSibling) ||
                    (typeof target === 'string' ? $(target, $el) : undefined))
            );
        },
    },

    update() {
        const { target, input } = this;

        if (!target) {
            return;
        }

        const inputTarget = isInput(target) && 'value' in target;
        const prev = inputTarget ? String(target.value) : target.textContent;
        const selectedOption =
            input instanceof HTMLSelectElement
                ? $$<HTMLOptionElement>('option', input).find((el) => el.selected)
                : undefined;
        const value =
            input instanceof HTMLInputElement && input.files?.[0]
                ? input.files[0].name
                : matches(input, 'select') && selectedOption
                  ? selectedOption.textContent
                  : input.value;

        if (prev !== value) {
            if (inputTarget) {
                target.value = value ?? '';
            } else {
                target.textContent = value;
            }
        }
    },

    events: [
        {
            name: 'change',

            handler() {
                this.$emit();
            },
        },

        {
            name: 'reset',

            el: ({ $el }: FormCustomInstance) => $el.closest('form'),

            handler() {
                this.$emit();
            },
        },
    ],
});
