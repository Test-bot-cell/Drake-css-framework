import { dimensions } from './dimensions.js';
import { on, getEventPos } from './event.js';
import { last, pointInRect } from './lang.js';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class MouseTracker {
  constructor() {
    __publicField(this, "positions", []);
    __publicField(this, "unbind");
    __publicField(this, "interval");
  }
  init() {
    this.positions = [];
    let position;
    this.unbind = on(document, "mousemove", (event) => {
      position = getEventPos(event);
    });
    this.interval = setInterval(() => {
      if (!position) {
        return;
      }
      this.positions.push(position);
      if (this.positions.length > 5) {
        this.positions.shift();
      }
    }, 50);
  }
  cancel() {
    var _a;
    (_a = this.unbind) == null ? void 0 : _a.call(this);
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  movesTo(target) {
    if (this.positions.length < 2) {
      return false;
    }
    const rect = dimensions(target);
    const previous = this.positions[0];
    const position = last(this.positions);
    if (!previous || !position || pointInRect(position, rect)) {
      return false;
    }
    const { left, right, top, bottom } = rect;
    const path = [previous, position];
    const diagonals = [
      [
        { x: left, y: top },
        { x: right, y: bottom }
      ],
      [
        { x: left, y: bottom },
        { x: right, y: top }
      ]
    ];
    return diagonals.some((diagonal) => {
      const intersection = intersect(path, diagonal);
      return Boolean(intersection && pointInRect(intersection, rect));
    });
  }
}
function intersect([{ x: x1, y: y1 }, { x: x2, y: y2 }], [{ x: x3, y: y3 }, { x: x4, y: y4 }]) {
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denominator === 0) {
    return false;
  }
  const ratio = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  return ratio < 0 ? false : { x: x1 + ratio * (x2 - x1), y: y1 + ratio * (y2 - y1) };
}

export { MouseTracker };
