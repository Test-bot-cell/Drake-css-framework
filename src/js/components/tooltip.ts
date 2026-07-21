import {
    append,
    attr,
    flipPosition,
    data as getData,
    isFocusable,
    isTouch,
    matches,
    offset,
    on,
    once,
    overflowParents,
    pointerDown,
    pointerEnter,
    pointerLeave,
    remove,
} from 'drake-util';
import { generateId } from '../api/instance';
import { defineComponent, parseOptions } from '../api/options';
import Container from '../mixin/container';
import Position from '../mixin/position';
import Togglable from '../mixin/togglable';
import type {
    Axis,
    ComponentInternalInstance,
    ComponentOptions,
    FrameworkEvent,
    Side,
} from '../types';
import { keyMap } from '../util/keys';

type Direction = Side | 'center';
type Alignment = [Direction, Direction];

interface TooltipInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    $options: ComponentOptions & { name: string };
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

interface TooltipProps {
    delay: number;
    title: string;
}

export default defineComponent<TooltipInstance>()({
    mixins: [Container, Togglable, Position],

    data: {
        pos: 'top',
        animation: ['drk-animation-scale-up'],
        duration: 100,
        cls: 'drk-active',
    },

    connected() {
        makeFocusable(this.$el);
    },

    disconnected() {
        this.hide();
    },

    methods: {
        show() {
            if (this.isToggled(this.tooltip || null)) {
                return;
            }

            const { delay = 0, title } = parseProps(this.$options);

            if (!title) {
                return;
            }

            const titleAttr = attr(this.$el, 'title');
            const off = on(this.$el, ['blur', pointerLeave], (e) => !isTouch(e) && this.hide());

            this.reset = () => {
                attr(this.$el, { title: titleAttr ?? null, 'aria-describedby': null });
                off();
            };

            const id = generateId(this);
            attr(this.$el, { title: null, 'aria-describedby': id });

            clearTimeout(this.showTimer);
            this.showTimer = setTimeout(() => this._show(title, id), delay);
        },

        async hide() {
            if (matches(this.$el, 'input:focus')) {
                return;
            }

            clearTimeout(this.showTimer);

            const tooltip = this.tooltip;
            if (tooltip && this.isToggled(tooltip)) {
                await this.toggleElement(tooltip, false, false);
            }

            this.reset?.();
            remove(this.tooltip);
            this.tooltip = null;
        },

        async _show(title: string, id: string) {
            const tooltip = append(
                this.container,
                `<div id="${id}" class="drk-${this.$options.name}" role="tooltip">
                    <div class="drk-${this.$options.name}-inner">${title}</div>
                 </div>`,
            );
            if (!(tooltip instanceof HTMLElement)) {
                return;
            }
            this.tooltip = tooltip;

            on(tooltip, 'toggled', (_event, toggled) => {
                if (!toggled) {
                    return;
                }

                const update = () => this.positionAt(tooltip, this.$el);
                update();

                const [dir, align] = getAlignment(tooltip, this.$el, this.pos);

                this.origin =
                    this.axis === 'y'
                        ? `${flipPosition(dir)}-${align}`
                        : `${align}-${flipPosition(dir)}`;

                const handlers = [
                    once(document, `keydown ${pointerDown}`, this.hide, false, (e) => {
                        const outsidePointer =
                            e.type === pointerDown &&
                            (!(e.target instanceof Node) || !this.$el.contains(e.target));
                        const escapeKey =
                            e.type === 'keydown' &&
                            e instanceof KeyboardEvent &&
                            e.keyCode === keyMap.ESC;
                        return outsidePointer || escapeKey;
                    }),
                    on([document, ...overflowParents(this.$el)], 'scroll', update, {
                        passive: true,
                    }),
                ];
                once(tooltip, 'hide', () => handlers.forEach((handler) => handler()), {
                    self: true,
                });
            });

            if (!(await this.toggleElement(tooltip, true))) {
                this.hide();
            }
        },
    },

    events: {
        name: `focus ${pointerEnter} ${pointerDown}`,
        // Clicking a button does not give it focus on all browsers and platforms
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#clicking_and_focus
        handler(e: FrameworkEvent) {
            if ((!isTouch(e) || e.type === pointerDown) && document.readyState !== 'loading') {
                this.show();
            }
        },
    },
});

function makeFocusable(el: HTMLElement): void {
    if (!isFocusable(el)) {
        el.tabIndex = 0;
    }
}

function getAlignment(el: Element, target: Element, [dir, align]: Alignment): Alignment {
    const elOffset = offset(el);
    const targetOffset = offset(target);
    const properties: readonly [readonly [Side, Side], readonly [Side, Side]] = [
        ['left', 'right'],
        ['top', 'bottom'],
    ];

    for (const props of properties) {
        if (elOffset[props[0]] >= targetOffset[props[1]]) {
            dir = props[1];
            break;
        }
        if (elOffset[props[1]] <= targetOffset[props[0]]) {
            dir = props[0];
            break;
        }
    }

    const props = dir === 'left' || dir === 'right' ? properties[1] : properties[0];
    align = props.find((prop) => elOffset[prop] === targetOffset[prop]) || 'center';

    return [dir, align];
}

function parseProps(options: ComponentOptions): TooltipProps {
    const { el, id, data } = options;
    const optionData =
        typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {};
    const values: Record<string, unknown> = {
        ...parseOptions(getData(el, id ?? ''), ['title']),
        ...optionData,
    };
    for (const key of ['delay', 'title']) {
        if (!(key in values)) {
            values[key] = getData(el, key);
        }
    }
    return {
        delay: Number(values.delay) || 0,
        title: values.title ? String(values.title) : '',
    };
}
