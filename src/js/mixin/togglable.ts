import {
    $$,
    addClass,
    Animation,
    css,
    dimensions,
    hasClass,
    includes,
    isBoolean,
    isVisible,
    propName,
    removeClass,
    startsWith,
    toFloat,
    toggleClass,
    toNode,
    toNodes,
    Transition,
    trigger,
    wrapInner,
} from 'uikit-util';
import { defineMixin } from '../api/options';
import type { CssProperties, Dimension, NodeInput } from '../types';
import type { TogglableInstance, ToggleAnimation, ToggleAnimationHandler } from './types';

export default defineMixin<TogglableInstance>()({
    props: {
        cls: Boolean,
        animation: 'list',
        duration: Number,
        velocity: Number,
        origin: String,
        transition: String,
    },

    data: {
        cls: false,
        animation: [false],
        duration: 200,
        velocity: 0.2,
        origin: false,
        transition: 'ease',
        clsEnter: 'uk-togglable-enter',
        clsLeave: 'uk-togglable-leave',
    },

    computed: {
        hasAnimation: ({ animation }: { animation: ToggleAnimation }) => !!animation[0],

        hasTransition: ({ animation }: { animation: ToggleAnimation }) =>
            ['slide', 'reveal'].some((transition) => startsWith(animation[0], transition)),
    },

    methods: {
        async toggleElement(
            targets: NodeInput,
            toggle?: boolean,
            animate?: boolean | ToggleAnimationHandler,
        ): Promise<boolean> {
            const CANCELLED = {};

            return (
                await Promise.all(
                    toNodes(targets).map((el) => {
                        if (!(el instanceof HTMLElement)) {
                            return CANCELLED;
                        }
                        const show = isBoolean(toggle) ? toggle : !this.isToggled(el);

                        if (!trigger(el, `before${show ? 'show' : 'hide'}`, [this])) {
                            return CANCELLED;
                        }

                        const handler: ToggleAnimationHandler =
                            typeof animate === 'function'
                                ? animate
                                : animate === false || !this.hasAnimation
                                  ? toggleInstant
                                  : this.hasTransition
                                    ? toggleTransition
                                    : toggleAnimation;
                        const promise = handler(el, show, this);

                        const cls = show ? this.clsEnter : this.clsLeave;

                        addClass(el, cls);

                        trigger(el, show ? 'show' : 'hide', [this]);

                        const done = (): void => {
                            removeClass(el, cls);
                            trigger(el, show ? 'shown' : 'hidden', [this]);

                            if (show) {
                                $$('[autofocus]', el)
                                    .find(isVisible)
                                    ?.focus({ preventScroll: true });
                            }
                        };

                        return promise
                            ? promise.then(done, () => {
                                  removeClass(el, cls);
                                  return CANCELLED;
                              })
                            : done();
                    }),
                )
            ).every((r) => r !== CANCELLED);
        },

        isToggled(this: TogglableInstance, element = this.$el): boolean {
            const el = toNode<HTMLElement>(element);
            return hasClass(el, this.clsEnter)
                ? true
                : hasClass(el, this.clsLeave)
                  ? false
                  : this.cls
                    ? hasClass(el, this.cls.split(' ')[0])
                    : isVisible(el);
        },

        _toggle(el: HTMLElement | undefined, toggled: boolean): void {
            if (!el) {
                return;
            }

            toggled = Boolean(toggled);

            let changed;
            if (this.cls) {
                changed = includes(this.cls, ' ') || toggled !== hasClass(el, this.cls);
                if (changed) {
                    toggleClass(el, this.cls, includes(this.cls, ' ') ? undefined : toggled);
                }
            } else {
                changed = toggled === el.hidden;
                if (changed) {
                    el.hidden = !toggled;
                }
            }

            if (changed) {
                trigger(el, 'toggled', [toggled, this]);
            }
        },
    },
});

function toggleInstant(el: HTMLElement, show: boolean, { _toggle }: TogglableInstance): void {
    Animation.cancel(el);
    Transition.cancel(el);
    return _toggle(el, show);
}

async function toggleTransition(
    el: HTMLElement,
    show: boolean,
    { animation, duration, velocity, transition, _toggle }: TogglableInstance,
): Promise<void> {
    const [mode = 'reveal', startProp = 'top'] =
        typeof animation[0] === 'string' ? animation[0].split('-') : [];

    const dirs = [
        ['left', 'right'],
        ['top', 'bottom'],
    ] as const;
    const dir = dirs[includes(dirs[0], startProp) ? 0 : 1];
    const end = dir[1] === startProp;
    const dimProp: Dimension = dir === dirs[0] ? 'width' : 'height';
    const marginProp = `margin-${dir[0]}`;
    const marginStartProp = `margin-${startProp}`;

    let currentDim = dimensions(el)[dimProp];

    const inProgress = Transition.inProgress(el);
    await Transition.cancel(el);

    if (show) {
        _toggle(el, true);
    }

    const previousPropertyNames = [
        'padding',
        'border',
        'width',
        'height',
        'minWidth',
        'minHeight',
        'overflowY',
        'overflowX',
        marginProp,
        marginStartProp,
    ];
    const prevProps: CssProperties = Object.fromEntries(
        previousPropertyNames.map((key) => [key, el.style.getPropertyValue(propName(key))]),
    );

    const dim = dimensions(el);
    const currentMargin = toFloat(css(el, marginProp));
    const marginStart = toFloat(css(el, marginStartProp));
    const endDim = dim[dimProp] + marginStart;

    if (!inProgress && !show) {
        currentDim += marginStart;
    }

    const [wrapper] = wrapInner(el, '<div>');
    if (!(wrapper instanceof HTMLElement)) {
        return;
    }
    css(wrapper, {
        boxSizing: 'border-box',
        height: dim.height,
        width: dim.width,
        ...css(el, [
            'overflow',
            'padding',
            'borderTop',
            'borderRight',
            'borderBottom',
            'borderLeft',
            'borderImage',
            marginStartProp,
        ]),
    });

    css(el, {
        padding: 0,
        border: 0,
        minWidth: 0,
        minHeight: 0,
        [marginStartProp]: 0,
        width: dim.width,
        height: dim.height,
        overflow: 'hidden',
        [dimProp]: currentDim,
    });

    const percent = currentDim / endDim;
    duration = (velocity * endDim + duration) * (show ? 1 - percent : percent);
    const endProps: CssProperties = { [dimProp]: show ? endDim : 0 };

    if (end) {
        css(el, marginProp, endDim - currentDim + currentMargin);
        endProps[marginProp] = show ? currentMargin : endDim + currentMargin;
    }

    if (!end !== (mode === 'reveal')) {
        css(wrapper, marginProp, -endDim + currentDim);
        Transition.start(wrapper, { [marginProp]: show ? 0 : -endDim }, duration, transition);
    }

    try {
        await Transition.start(el, endProps, duration, transition);
    } finally {
        css(el, prevProps);
        if (wrapper.firstChild) {
            wrapper.replaceWith(...wrapper.childNodes);
        }

        if (!show) {
            _toggle(el, false);
        }
    }
}

function toggleAnimation(
    el: HTMLElement,
    show: boolean,
    cmp: TogglableInstance,
): Promise<unknown> | void {
    const { animation, duration, _toggle } = cmp;

    if (show) {
        _toggle(el, true);
        return Animation.in(el, toAnimationName(animation[0]), duration, cmp.origin || undefined);
    }

    return Animation.out(
        el,
        toAnimationName(animation[1] || animation[0]),
        duration,
        cmp.origin || undefined,
    ).then(() => _toggle(el, false));
}

function toAnimationName(value: string | false | undefined): string {
    return typeof value === 'string' ? value : '';
}
