import {
    attr,
    children,
    css,
    dimensions,
    includes,
    index,
    isInView,
    isVisible,
    parent,
    position,
    resetProps,
    Transition,
    trigger,
} from 'uikit-util';
import type { CssProperties } from '../../types';
import { awaitFrame } from '../../util/await';
import type { MixinAnimationAction } from '../animate';

type SlideProperties = CssProperties & {
    display?: string;
    opacity?: string | number;
};

export default async function animateSlide(
    action: MixinAnimationAction,
    target: HTMLElement,
    duration: number,
): Promise<void> {
    await awaitFrame();

    let nodes = htmlChildren(target);

    // Get current state
    const currentProps = nodes.map((el) => getProps(el, true));
    const targetProps = { ...css(target, ['height', 'padding']), display: 'block' };

    const transitionNodes = nodes.filter((node) => isInView(node));
    const targets = nodes.concat(target);

    // Cancel previous animations
    await Promise.all(targets.map(Transition.cancel));

    // Force transition to be canceled in Safari
    css(targets, 'transitionProperty', 'none');

    // Adding, sorting, removing nodes
    await action();

    // Find new nodes

    const newNodes = htmlChildren(target).filter((el) => !includes(nodes, el));

    nodes = nodes.concat(newNodes);

    // Wait for update to propagate
    await Promise.resolve();

    // Reset the forced transition property
    css(targets, 'transitionProperty', '');

    // Get new state
    const targetStyle = attr(target, 'style');
    const targetPropsTo = css(target, ['height', 'padding']);
    const [propsTo, propsFrom] = getTransitionProps(target, nodes, currentProps);
    const attrsTo = nodes.map((el) => ({ style: attr(el, 'style') ?? null }));

    transitionNodes.push(...nodes.filter((node) => isInView(node)));

    // Reset to previous state
    nodes.forEach((el, i) => propsFrom[i] && css(el, propsFrom[i]));
    css(target, targetProps);

    // Trigger update in e.g. parallax component
    trigger(target, 'scroll');

    // Start transitions on next frame
    await awaitFrame();

    const transitions = nodes
        .map((el, i) => {
            const properties = propsTo[i];
            if (properties && parent(el) === target && transitionNodes.includes(el)) {
                return Transition.start(el, properties, duration, 'ease', !newNodes.includes(el));
            }
        })
        .concat(Transition.start(target, targetPropsTo, duration, 'ease', true));

    try {
        await Promise.all(transitions);
        nodes.forEach((el, i) => {
            const attributes = attrsTo[i];
            if (attributes) {
                attr(el, attributes);
            }
            if (parent(el) === target) {
                const properties = propsTo[i];
                css(el, 'display', properties && properties.opacity === 0 ? 'none' : '');
            }
        });
        attr(target, 'style', targetStyle ?? null);
    } catch {
        attr(nodes, 'style', '');
        resetProps(target, targetProps);
    }
}

function getProps(el: HTMLElement, opacity = false): SlideProperties | false {
    const zIndex = css(el, 'zIndex');

    return isVisible(el)
        ? {
              display: '',
              opacity: opacity ? css(el, 'opacity') : '0',
              pointerEvents: 'none',
              position: 'absolute',
              zIndex: zIndex === 'auto' ? index(el) : zIndex,
              ...getPositionWithMargin(el),
          }
        : false;
}

function getTransitionProps(
    target: HTMLElement,
    nodes: HTMLElement[],
    currentProps: Array<SlideProperties | false>,
): [Array<SlideProperties | false>, Array<SlideProperties | false>] {
    const propsTo = nodes.map((el, i) =>
        parent(el) && i in currentProps
            ? currentProps[i]
                ? isVisible(el)
                    ? getPositionWithMargin(el)
                    : { opacity: 0 }
                : { opacity: isVisible(el) ? 1 : 0 }
            : false,
    );

    const propsFrom = propsTo.map((props, i) => {
        const node = nodes[i];
        const from = node && parent(node) === target && (currentProps[i] || getProps(node));

        if (!from) {
            return false;
        }

        if (!props) {
            delete from.opacity;
        } else if (!('opacity' in props)) {
            const { opacity } = from;

            if (Number(opacity) % 1) {
                props.opacity = 1;
            } else {
                delete from.opacity;
            }
        }

        return from;
    });

    return [propsTo, propsFrom];
}

function getPositionWithMargin(el: HTMLElement): SlideProperties {
    const { height, width } = dimensions(el);

    return {
        height,
        width,
        transform: '',
        ...position(el),
        ...css(el, ['marginTop', 'marginLeft']),
    };
}

function htmlChildren(target: HTMLElement): HTMLElement[] {
    return children(target).filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
    );
}
