import { defineMixin } from '../api/options';
import type { SliderInstance } from './types';

export default defineMixin<SliderInstance>()({
    update: {
        write(): void {
            if (this.stack.length || this.dragging || this.parallax) {
                return;
            }

            const index = this.getValidIndex();

            if (!~this.prevIndex || this.index !== index) {
                void this.show(index);
            } else {
                this._translate(1);
            }
        },

        events: ['resize'],
    },
});
