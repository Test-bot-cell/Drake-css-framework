import {
    $,
    $$,
    append,
    css,
    data,
    fastdom,
    children as getChildren,
    hasClass,
    includes,
    isEmpty,
    isEqual,
    isNumeric,
    isTag,
    isUndefined,
    matches,
    toggleClass,
    trigger,
} from 'drake-util';
import { defineComponent, parseOptions } from '../api/options';
import Animate from '../mixin/animate';
import { maybeDefaultPreventClick } from '../mixin/event';
import type { ComponentInternalInstance, FrameworkEvent } from '../types';
import { keyMap } from '../util/keys';

interface FilterState {
    filter: Record<string, string>;
    sort: [string?, string?];
}

interface FilterOptions {
    filter?: string;
    group?: string;
    sort?: string;
    order?: string;
}

interface FilterInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    target: string;
    selActive: string | false;
    attrItem: string;
    cls: string;
    children: HTMLElement[];
    toggles: HTMLElement[];
    animate(action: () => unknown, target?: HTMLElement): Promise<void>;
    apply(element: HTMLElement): void;
    getState(): FilterState;
    setState(state: Partial<FilterState>, animate?: boolean): Promise<void>;
    updateState(): void;
}

export default defineComponent<FilterInstance>()({
    mixins: [Animate],

    args: 'target',

    props: {
        target: String,
        selActive: Boolean,
    },

    data: {
        target: '',
        selActive: false,
        attrItem: 'drk-filter-control',
        cls: 'drk-active',
        duration: 250,
    },

    computed: {
        children: ({ target }: { target: string }, $el: HTMLElement) => $$(`${target} > *`, $el),

        toggles: ({ attrItem }: { attrItem: string }, $el: HTMLElement) =>
            $$(`[${attrItem}],[data-${attrItem}]`, $el),
    },

    watch: {
        toggles(value: unknown) {
            const toggles = toHtmlElements(value);
            this.updateState();

            const actives = this.selActive === false ? [] : $$(this.selActive, this.$el);
            for (const toggle of toggles) {
                if (this.selActive !== false) {
                    toggleClass(toggle, this.cls, includes(actives, toggle));
                }
                const button = findButton(toggle);
                if (isTag(button, 'a')) {
                    button.role = 'button';
                }
            }
        },

        children(_list: unknown, previous: unknown) {
            if (previous) {
                this.updateState();
            }
        },
    },

    events: {
        name: 'click keydown',

        delegate: ({ attrItem }: FilterInstance) => `[${attrItem}],[data-${attrItem}]`,

        handler(e: FrameworkEvent) {
            if (
                e.type === 'keydown' &&
                (!(e instanceof KeyboardEvent) || e.keyCode !== keyMap.SPACE)
            ) {
                return;
            }

            if (hasElementTarget(e) && e.target?.closest('a,button')) {
                maybeDefaultPreventClick(e);
                if (e.current instanceof HTMLElement) {
                    this.apply(e.current);
                }
            }
        },
    },

    methods: {
        apply(el: HTMLElement) {
            const prevState = this.getState();
            const newState = mergeState(el, this.attrItem, this.getState());

            if (!isEqualState(prevState, newState)) {
                this.setState(newState);
            }
        },

        getState(): FilterState {
            return this.toggles
                .filter((item) => hasClass(item, this.cls))
                .reduce<FilterState>((state, el) => mergeState(el, this.attrItem, state), {
                    filter: { '': '' },
                    sort: [],
                });
        },

        async setState(state: Partial<FilterState>, animate = true) {
            const nextState: FilterState = {
                filter: state.filter ?? { '': '' },
                sort: state.sort ?? [],
            };

            trigger(this.$el, 'beforeFilter', [this, nextState]);

            for (const toggle of this.toggles) {
                toggleClass(toggle, this.cls, matchFilter(toggle, this.attrItem, nextState));
            }

            await Promise.all(
                $$(this.target, this.$el).map((target) => {
                    const filterFn = () => applyState(nextState, target, getChildren(target));
                    return animate ? this.animate(filterFn, target) : filterFn();
                }),
            );

            trigger(this.$el, 'afterFilter', [this]);
        },

        updateState() {
            fastdom.write(() => this.setState(this.getState(), false));
        },
    },
});

function getFilter(el: Element, attr: string): FilterOptions {
    const options = parseOptions(data(el, attr), ['filter']);
    return {
        filter: stringOption(options.filter),
        group: stringOption(options.group),
        sort: stringOption(options.sort),
        order: stringOption(options.order),
    };
}

function isEqualState(stateA: FilterState, stateB: FilterState): boolean {
    return isEqual(stateA.filter, stateB.filter) && isEqual(stateA.sort, stateB.sort);
}

function applyState(state: FilterState, target: HTMLElement, children: Element[]): void {
    for (const el of children) {
        css(
            el,
            'display',
            Object.values(state.filter).every((selector) => !selector || matches(el, selector))
                ? ''
                : 'none',
        );
    }

    const [sort, order] = state.sort;

    if (sort) {
        const sorted = sortItems(children, sort, order);
        if (!isEqual(sorted, children)) {
            append(target, sorted);
        }
    }
}

function mergeState(el: Element, attr: string, state: FilterState): FilterState {
    const { filter, group, sort, order = 'asc' } = getFilter(el, attr);

    if (filter || isUndefined(sort)) {
        if (group) {
            if (filter) {
                delete state.filter[''];
                state.filter[group] = filter;
            } else {
                delete state.filter[group];

                if (isEmpty(state.filter) || '' in state.filter) {
                    state.filter = { '': filter || '' };
                }
            }
        } else {
            state.filter = { '': filter || '' };
        }
    }

    if (!isUndefined(sort)) {
        state.sort = [sort, order];
    }

    return state;
}

function matchFilter(
    el: Element,
    attr: string,
    { filter: stateFilter = { '': '' }, sort: [stateSort, stateOrder] }: FilterState,
): boolean {
    const { filter = '', group = '', sort, order = 'asc' } = getFilter(el, attr);
    const defaultFilterMatches = !group && filter === stateFilter[''];
    const groupFilterMatches = Boolean(group) && filter === stateFilter[group];
    const groupResetMatches =
        !filter && Boolean(group) && !(group in stateFilter) && !stateFilter[''];
    const filterMatches = defaultFilterMatches || groupFilterMatches || groupResetMatches;

    if (isUndefined(sort)) {
        return filterMatches;
    }

    const sortMatches = stateSort === sort && stateOrder === order;
    const hasFilter = Boolean(filter || group);

    return sortMatches && (!hasFilter || filterMatches);
}

function sortItems(nodes: Element[], sort: string, order?: string): Element[] {
    return [...nodes].sort((a, b) => {
        const valA = data(a, sort) || '';
        const valB = data(b, sort) || '';
        const cmp =
            isNumeric(valA) && isNumeric(valB)
                ? Number(valA) - Number(valB)
                : valA.localeCompare(valB, undefined, { numeric: true });
        return cmp * (order === 'asc' ? 1 : -1);
    });
}

function findButton(el: HTMLElement): HTMLElement {
    return $('a,button', el) || el;
}

function stringOption(value: unknown): string | undefined {
    return value === undefined ? undefined : String(value);
}

function toHtmlElements(value: unknown): HTMLElement[] {
    return Array.isArray(value)
        ? value.filter((item): item is HTMLElement => item instanceof HTMLElement)
        : [];
}

function hasElementTarget(event: FrameworkEvent): event is FrameworkEvent<Element> {
    return event.target instanceof Element;
}
