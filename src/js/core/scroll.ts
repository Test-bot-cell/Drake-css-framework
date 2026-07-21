import {
    $,
    getTargetedElement,
    isSameSiteAnchor,
    off,
    on,
    scrollIntoView,
    trigger,
} from 'drake-util';
import { defineComponent } from '../api/options';
import type { ComponentInternalInstance, FrameworkEvent } from '../types';

interface ScrollInstance extends ComponentInternalInstance {
    offset: number;
    scrollTo(element?: string | Element | null): Promise<void>;
}

export default defineComponent<ScrollInstance>()({
    props: {
        offset: Number,
    },

    data: {
        offset: 0,
    },

    connected() {
        registerClick(this);
    },

    disconnected() {
        unregisterClick(this);
    },

    methods: {
        async scrollTo(el?: string | Element | null) {
            el = (el && $(el)) || document.body;

            if (trigger(this.$el, 'beforescroll', [this, el])) {
                await scrollIntoView(el, { offset: this.offset });
                trigger(this.$el, 'scrolled', [this, el]);
            }
        },
    },
});

const instances = new Set<ScrollInstance>();
function registerClick(cmp: ScrollInstance): void {
    if (!instances.size) {
        on(document, 'click', clickHandler);
    }

    instances.add(cmp);
}

function unregisterClick(cmp: ScrollInstance): void {
    instances.delete(cmp);

    if (!instances.size) {
        off(document, 'click', clickHandler);
    }
}

function clickHandler(e: FrameworkEvent): void {
    if (e.defaultPrevented) {
        return;
    }

    for (const instance of instances) {
        if (
            e.target instanceof Node &&
            instance.$el.contains(e.target) &&
            isSameSiteAnchor(instance.$el)
        ) {
            e.preventDefault();
            if (window.location.href !== instance.$el.href) {
                window.history.pushState({}, '', instance.$el.href);
            }
            instance.scrollTo(getTargetedElement(instance.$el));
        }
    }
}
