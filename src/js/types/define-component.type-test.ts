import { defineComponent } from '../api/options';
import type { ComponentInternalInstance, FrameworkEvent } from './index';

interface ExampleComponent extends ComponentInternalInstance {
    count: number;
    open: boolean;
    doubled: number;
    toggle(): number;
}

const component = defineComponent<ExampleComponent>()({
    props: { count: Number },
    data: { open: false },
    computed: {
        doubled() {
            return this.count * 2;
        },
    },
    methods: {
        toggle() {
            this.open = !this.open;
            return this.doubled;
        },
    },
    events: [
        {
            name: 'click',
            handler(event: FrameworkEvent) {
                this.toggle();
                return event.type;
            },
        },
    ],
    watch: {
        open(value) {
            this.toggle();
            return value;
        },
    },
    update: [
        {
            read() {
                return { doubled: this.doubled };
            },
        },
    ],
});

void component;
