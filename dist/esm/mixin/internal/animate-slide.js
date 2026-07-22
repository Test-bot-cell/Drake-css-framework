import { Transition } from '../../util/animation.js';
import { attr } from '../../util/attr.js';
import { includes } from '../../util/lang.js';
import { dimensions, position } from '../../util/dimensions.js';
import { trigger } from '../../util/event.js';
import { parent, children, isVisible, index } from '../../util/filter.js';
import { css, resetProps } from '../../util/style.js';
import { isInView } from '../../util/viewport.js';
import { awaitFrame } from '../../util/await.js';

async function animateSlide(action, target, duration) {
  await awaitFrame();
  let nodes = htmlChildren(target);
  const currentProps = nodes.map((el) => getProps(el, true));
  const targetProps = { ...css(target, ["height", "padding"]), display: "block" };
  const transitionNodes = nodes.filter((node) => isInView(node));
  const targets = nodes.concat(target);
  await Promise.all(targets.map(Transition.cancel));
  css(targets, "transitionProperty", "none");
  await action();
  const newNodes = htmlChildren(target).filter((el) => !includes(nodes, el));
  nodes = nodes.concat(newNodes);
  await Promise.resolve();
  css(targets, "transitionProperty", "");
  const targetStyle = attr(target, "style");
  const targetPropsTo = css(target, ["height", "padding"]);
  const [propsTo, propsFrom] = getTransitionProps(target, nodes, currentProps);
  const attrsTo = nodes.map((el) => {
    var _a;
    return { style: (_a = attr(el, "style")) != null ? _a : null };
  });
  transitionNodes.push(...nodes.filter((node) => isInView(node)));
  nodes.forEach((el, i) => propsFrom[i] && css(el, propsFrom[i]));
  css(target, targetProps);
  trigger(target, "scroll");
  await awaitFrame();
  const transitions = nodes.map((el, i) => {
    const properties = propsTo[i];
    if (properties && parent(el) === target && transitionNodes.includes(el)) {
      return Transition.start(el, properties, duration, "ease", !newNodes.includes(el));
    }
  }).concat(Transition.start(target, targetPropsTo, duration, "ease", true));
  try {
    await Promise.all(transitions);
    nodes.forEach((el, i) => {
      const attributes = attrsTo[i];
      if (attributes) {
        attr(el, attributes);
      }
      if (parent(el) === target) {
        const properties = propsTo[i];
        css(el, "display", properties && properties.opacity === 0 ? "none" : "");
      }
    });
    attr(target, "style", targetStyle != null ? targetStyle : null);
  } catch {
    attr(nodes, "style", "");
    resetProps(target, targetProps);
  }
}
function getProps(el, opacity = false) {
  const zIndex = css(el, "zIndex");
  return isVisible(el) ? {
    display: "",
    opacity: opacity ? css(el, "opacity") : "0",
    pointerEvents: "none",
    position: "absolute",
    zIndex: zIndex === "auto" ? index(el) : zIndex,
    ...getPositionWithMargin(el)
  } : false;
}
function getTransitionProps(target, nodes, currentProps) {
  const propsTo = nodes.map(
    (el, i) => parent(el) && i in currentProps ? currentProps[i] ? isVisible(el) ? getPositionWithMargin(el) : { opacity: 0 } : { opacity: isVisible(el) ? 1 : 0 } : false
  );
  const propsFrom = propsTo.map((props, i) => {
    const node = nodes[i];
    const from = node && parent(node) === target && (currentProps[i] || getProps(node));
    if (!from) {
      return false;
    }
    if (!props) {
      delete from.opacity;
    } else if (!("opacity" in props)) {
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
function getPositionWithMargin(el) {
  const { height, width } = dimensions(el);
  return {
    height,
    width,
    transform: "",
    ...position(el),
    ...css(el, ["marginTop", "marginLeft"])
  };
}
function htmlChildren(target) {
  return children(target).filter(
    (element) => element instanceof HTMLElement
  );
}

export { animateSlide as default };
