import { offset } from './dimensions.js';
import { isArray, clamp } from './lang.js';
import { css } from './style.js';
import { offsetViewport, overflowParents } from './viewport.js';

const dirs = [
  ["width", "x", "left", "right"],
  ["height", "y", "top", "bottom"]
];
function positionAt(element, target, options = {}) {
  const resolved = resolveOptions(options);
  const targets = isArray(target) ? toPair(target) : [target, target];
  const coordinates = getPosition(element, targets, resolved);
  if (coordinates) {
    offset(element, coordinates);
  }
}
function resolveOptions(options) {
  var _a, _b, _c, _d, _e, _f;
  return {
    ...options,
    attach: {
      element: (_b = (_a = options.attach) == null ? void 0 : _a.element) != null ? _b : ["left", "top"],
      target: (_d = (_c = options.attach) == null ? void 0 : _c.target) != null ? _d : ["left", "top"]
    },
    offset: (_e = options.offset) != null ? _e : [0, 0],
    placement: (_f = options.placement) != null ? _f : [void 0, void 0]
  };
}
function getPosition(element, target, options) {
  const position = attachTo(element, target, options);
  const {
    boundary,
    viewportOffset = 0,
    placement
  } = options;
  let offsetPosition = position;
  for (const index of [0, 1]) {
    const [property, , start, end] = dirs[index];
    const viewport = getViewport(element, target[index], viewportOffset, boundary, index);
    if (isWithin(position, viewport, index)) {
      continue;
    }
    let offsetBy = 0;
    if (placement[index] === "flip") {
      const attach = options.attach.target[index];
      if (attach === end && position[end] <= viewport[end] || attach === start && position[start] >= viewport[start]) {
        continue;
      }
      offsetBy = flip(element, target, options, index)[start] - position[start];
      const scrollArea = getScrollArea(element, target[index], viewportOffset, index);
      if (!isWithin(applyOffset(position, offsetBy, index), scrollArea, index)) {
        if (isWithin(position, scrollArea, index)) {
          continue;
        }
        if (options.recursion) {
          return false;
        }
        const newPosition = flipAxis(element, target, options);
        if (newPosition && isWithin(newPosition, scrollArea, index === 0 ? 1 : 0)) {
          return newPosition;
        }
        continue;
      }
    } else if (placement[index] === "shift") {
      const targetDimensions = offset(target[index]);
      offsetBy = clamp(
        clamp(position[start], viewport[start], viewport[end] - position[property]),
        targetDimensions[start] - position[property] + options.offset[index],
        targetDimensions[end] - options.offset[index]
      ) - position[start];
    }
    offsetPosition = applyOffset(offsetPosition, offsetBy, index);
  }
  return offsetPosition;
}
function attachTo(element, target, options) {
  let elementOffset = offset(element);
  for (const index of [0, 1]) {
    const [property, , start, end] = dirs[index];
    const targetOffset = options.attach.target[index] === options.attach.element[index] ? offsetViewport(target[index]) : offset(target[index]);
    elementOffset = applyOffset(
      elementOffset,
      targetOffset[start] - elementOffset[start] + moveBy(options.attach.target[index], end, targetOffset[property]) - moveBy(options.attach.element[index], end, elementOffset[property]) + options.offset[index],
      index
    );
  }
  return elementOffset;
}
function applyOffset(position, value, index) {
  const [, axis, start, end] = dirs[index];
  const result = { ...position };
  result[start] = position[start] + value;
  result[end] = position[end] + value;
  result[axis] = result[start];
  return result;
}
function moveBy(attach, end, dimension) {
  return attach === "center" ? dimension / 2 : attach === end ? dimension : 0;
}
function getViewport(element, target, viewportOffset, boundary, index) {
  let viewport = getIntersectionArea(...commonScrollParents(element, target).map(offsetViewport));
  const [, , start, end] = dirs[index];
  if (viewportOffset) {
    viewport[start] += viewportOffset;
    viewport[end] -= viewportOffset;
  }
  if (boundary) {
    viewport = getIntersectionArea(
      viewport,
      offset(isArray(boundary) ? boundary[index] : boundary)
    );
  }
  return viewport;
}
function getScrollArea(element, target, viewportOffset, index) {
  var _a;
  const [property, axis, start, end] = dirs[index];
  const scrollElement = (_a = commonScrollParents(element, target)[0]) != null ? _a : document.documentElement;
  const viewport = offsetViewport(scrollElement);
  if (["auto", "scroll"].includes(css(scrollElement, `overflow-${axis}`))) {
    const scrollStart = start === "top" ? scrollElement.scrollTop : scrollElement.scrollLeft;
    const scrollSize = property === "height" ? scrollElement.scrollHeight : scrollElement.scrollWidth;
    viewport[start] -= scrollStart;
    viewport[end] = viewport[start] + scrollSize;
  }
  viewport[start] += viewportOffset;
  viewport[end] -= viewportOffset;
  return viewport;
}
function commonScrollParents(element, target) {
  return overflowParents(target).filter((parent) => parent.contains(element));
}
function getIntersectionArea(...rects) {
  const area = {
    top: 0,
    left: 0,
    bottom: Number.POSITIVE_INFINITY,
    right: Number.POSITIVE_INFINITY,
    width: 0,
    height: 0,
    x: 0,
    y: 0
  };
  for (const rect of rects) {
    area.top = Math.max(area.top, rect.top);
    area.left = Math.max(area.left, rect.left);
    area.bottom = Math.min(area.bottom, rect.bottom);
    area.right = Math.min(area.right, rect.right);
  }
  area.width = area.right - area.left;
  area.height = area.bottom - area.top;
  area.x = area.left;
  area.y = area.top;
  return area;
}
function isWithin(first, second, index) {
  const [, , start, end] = dirs[index];
  return first[start] >= second[start] && first[end] <= second[end];
}
function flip(element, target, options, index) {
  return attachTo(element, target, {
    attach: {
      element: flipAttach(options.attach.element, index),
      target: flipAttach(options.attach.target, index)
    },
    offset: flipOffset(options.offset, index)
  });
}
function flipAxis(element, target, options) {
  return getPosition(element, target, {
    ...options,
    attach: {
      element: toPair(options.attach.element.map(flipAttachAxis).reverse()),
      target: toPair(options.attach.target.map(flipAttachAxis).reverse())
    },
    offset: toPair([...options.offset].reverse()),
    placement: toPair([...options.placement].reverse()),
    recursion: true
  });
}
function flipAttach(attach, index) {
  const result = [...attach];
  const directionIndex = dirs[index].indexOf(attach[index]);
  if (directionIndex >= 0) {
    result[index] = dirs[index][1 - directionIndex % 2 + 2];
  }
  return result;
}
function flipAttachAxis(property) {
  for (const index of [0, 1]) {
    const directionIndex = dirs[index].indexOf(property);
    if (directionIndex >= 0) {
      return dirs[index === 0 ? 1 : 0][directionIndex % 2 + 2];
    }
  }
  return property;
}
function flipOffset(offset2, index) {
  const result = [...offset2];
  result[index] *= -1;
  return result;
}
function toPair(values) {
  if (values.length < 2 || values[0] === void 0 || values[1] === void 0) {
    throw new TypeError("Expected a pair of values.");
  }
  return [values[0], values[1]];
}

export { positionAt };
