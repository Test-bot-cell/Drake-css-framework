import { $ } from 'drake-util';
import { defineMixin } from '../api/options';
import type { ComponentInternalInstance } from '../types';

type ContainerValue = boolean | string | Element;

interface ContainerInstance extends ComponentInternalInstance {
    container: Element | false | '' | undefined;
}

export default defineMixin<ContainerInstance>()({
    props: {
        container: Boolean,
    },

    data: {
        container: true,
    },

    computed: {
        container({ container }: { container: ContainerValue }): Element | false | '' | undefined {
            if (container === true) {
                return this.$container;
            }
            if (typeof container === 'string') {
                return container ? $(container) : '';
            }
            return container ? $(container) : false;
        },
    },
});
