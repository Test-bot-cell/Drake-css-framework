import { clamp, ucfirst, toFloat, noop, Dimensions, isString, findIndex } from '../util/lang.js';
import { once, trigger, createEvent } from '../util/event.js';
import { propName, resetProps, css } from '../util/style.js';
import { toPx } from '../util/dimensions.js';
import { defineMixin } from '../api/options.js';
import Media from './media.js';
import { getMaxPathLength } from '../util/svg.js';

const propertyFactories = {
  x: transformFn,
  y: transformFn,
  rotate: transformFn,
  scale: transformFn,
  color: colorFn,
  backgroundColor: colorFn,
  borderColor: colorFn,
  blur: filterFn,
  hue: filterFn,
  fopacity: filterFn,
  grayscale: filterFn,
  invert: filterFn,
  saturate: filterFn,
  sepia: filterFn,
  opacity: cssPropFn,
  stroke: strokeFn,
  bgx: backgroundFn,
  bgy: backgroundFn
};
const { keys } = Object;
var Parallax = defineMixin()({
  mixins: [Media],
  props: fillObject(keys(propertyFactories), "list"),
  data: fillObject(keys(propertyFactories), void 0),
  computed: {
    props(properties, $el) {
      const stops = {};
      for (const property in properties) {
        const values = toRawStops(properties[property]);
        if (isParallaxProperty(property) && values) {
          stops[property] = values.slice();
        }
      }
      const result = {};
      for (const property in stops) {
        const values = stops[property];
        if (isParallaxProperty(property) && isRawStops(values)) {
          result[property] = propertyFactories[property](property, $el, values, stops);
        }
      }
      return result;
    }
  },
  events: {
    name: "load",
    handler() {
      this.$emit();
    }
  },
  methods: {
    reset() {
      resetProps(this.$el, this.getCss(0));
    },
    getCss(percent) {
      var _a, _b;
      const styles = {};
      for (const property in this.props) {
        if (isParallaxProperty(property)) {
          (_b = (_a = this.props)[property]) == null ? void 0 : _b.call(_a, styles, clamp(percent));
        }
      }
      styles.willChange = Object.keys(styles).map(propName).join(",");
      return styles;
    }
  }
});
function transformFn(property, el, inputStops) {
  let unit = getUnit(inputStops) || (property === "x" || property === "y" ? "px" : property === "rotate" ? "deg" : "");
  let transformName = property;
  let convert = toFloat;
  if (property === "x" || property === "y") {
    transformName = `translate${ucfirst(property)}`;
    convert = (stop) => toFloat(toFloat(stop).toFixed(unit === "px" ? 0 : 6));
  } else if (property === "scale") {
    unit = "";
    convert = (stop) => getUnit([stop]) ? toPx(stop, "width", el, true) / (typeof stop === "string" && stop.endsWith("vh") ? el.offsetHeight : el.offsetWidth) : toFloat(stop);
  }
  if (inputStops.length === 1) {
    inputStops.unshift(property === "scale" ? 1 : 0);
  }
  const stops = parseStops(inputStops, convert);
  return (styles, percent) => {
    styles.transform = `${styles.transform || ""} ${transformName}(${getValue(stops, percent)}${unit})`;
  };
}
function colorFn(property, el, inputStops) {
  if (inputStops.length === 1) {
    inputStops.unshift(getCssValue(el, property, ""));
  }
  const stops = parseStops(inputStops, (stop) => parseColor(el, stop));
  return (styles, percent) => {
    const stop = getStop(stops, percent);
    if (!stop) {
      return;
    }
    const [start, end, progress] = stop;
    const value = start.map((value2, i) => {
      var _a;
      value2 += progress * (((_a = end[i]) != null ? _a : value2) - value2);
      return i === 3 ? toFloat(value2) : Number.parseInt(String(value2), 10);
    }).join(",");
    styles[property] = `rgba(${value})`;
  };
}
function parseColor(el, color) {
  const channels = getCssValue(el, "color", color).split(/[(),]/g).slice(1, -1);
  channels.push(1);
  return channels.slice(0, 4).map(toFloat);
}
function filterFn(property, _el, inputStops) {
  if (inputStops.length === 1) {
    inputStops.unshift(0);
  }
  const unit = getUnit(inputStops) || (property === "blur" ? "px" : property === "hue" ? "deg" : "%");
  const filterName = property === "fopacity" ? "opacity" : property === "hue" ? "hue-rotate" : property;
  const stops = parseStops(inputStops, toFloat);
  return (styles, percent) => {
    const value = getValue(stops, percent);
    styles.filter = `${styles.filter || ""} ${filterName}(${value + unit})`;
  };
}
function cssPropFn(property, el, inputStops) {
  if (inputStops.length === 1) {
    inputStops.unshift(getCssValue(el, property, ""));
  }
  const stops = parseStops(inputStops, toFloat);
  return (styles, percent) => {
    styles[property] = getValue(stops, percent);
  };
}
function strokeFn(_property, el, inputStops) {
  if (inputStops.length === 1) {
    inputStops.unshift(0);
  }
  const unit = getUnit(inputStops);
  const length = getMaxPathLength(el);
  const stops = parseStops(inputStops.reverse(), (stop) => {
    const value = toFloat(stop);
    return unit === "%" ? value * length / 100 : value;
  });
  if (!stops.some(([value]) => value)) {
    return noop;
  }
  css(el, "strokeDasharray", length);
  return (styles, percent) => {
    styles.strokeDashoffset = getValue(stops, percent);
  };
}
function backgroundFn(property, el, inputStops, properties) {
  if (inputStops.length === 1) {
    inputStops.unshift(0);
  }
  const dimension = property === "bgy" ? "height" : "width";
  properties[property] = parseStops(inputStops, (stop) => toPx(stop, dimension, el));
  const backgroundProperties = getBackgroundProperties(properties);
  if (backgroundProperties.length === 2 && property === "bgx") {
    return noop;
  }
  if (getCssValue(el, "backgroundSize", "") === "cover") {
    return backgroundCoverFn(property, el, properties);
  }
  const positions = {};
  for (const backgroundProperty of backgroundProperties) {
    positions[backgroundProperty] = getBackgroundPos(el, backgroundProperty);
  }
  return setBackgroundPosFn(backgroundProperties, positions, properties);
}
function backgroundCoverFn(_property, el, properties) {
  var _a;
  const dimImage = getBackgroundImageDimensions(el);
  if (!dimImage.width) {
    return noop;
  }
  const dimEl = {
    width: el.offsetWidth,
    height: el.offsetHeight
  };
  const backgroundProperties = getBackgroundProperties(properties);
  const positions = {};
  for (const property of backgroundProperties) {
    const stops = getNumericStops(properties[property]);
    if (!stops.length) {
      continue;
    }
    const values = stops.map(([value]) => value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const down = values.indexOf(min) < values.indexOf(max);
    const diff = max - min;
    positions[property] = `${(down ? -diff : 0) - (down ? min : max)}px`;
    dimEl[property === "bgy" ? "height" : "width"] += diff;
  }
  const dim = Dimensions.cover(dimImage, dimEl);
  for (const property of backgroundProperties) {
    const dimension = property === "bgy" ? "height" : "width";
    const overflow = dim[dimension] - dimEl[dimension];
    positions[property] = `max(${getBackgroundPos(el, property)},-${overflow}px) + ${(_a = positions[property]) != null ? _a : ""}`;
  }
  const setBackgroundPosition = setBackgroundPosFn(backgroundProperties, positions, properties);
  return (styles, percent) => {
    setBackgroundPosition(styles, percent);
    styles.backgroundSize = `${dim.width}px ${dim.height}px`;
    styles.backgroundRepeat = "no-repeat";
  };
}
function getBackgroundPos(el, property) {
  return getCssValue(el, `background-position-${property.slice(-1)}`, "");
}
function setBackgroundPosFn(backgroundProperties, positions, properties) {
  return (styles, percent) => {
    var _a;
    for (const property of backgroundProperties) {
      const value = getValue(getNumericStops(properties[property]), percent);
      styles[`background-position-${property.slice(-1)}`] = `calc(${(_a = positions[property]) != null ? _a : ""} + ${value}px)`;
    }
  };
}
const loading = {};
const dimensions = {};
function getBackgroundImageDimensions(el) {
  const src = css(el, "backgroundImage").replace(/^none|url\(["']?(.+?)["']?\)$/, "$1");
  const cached = dimensions[src];
  if (cached) {
    return cached;
  }
  const image = new Image();
  if (src) {
    image.src = src;
    if (!image.naturalWidth && !loading[src]) {
      once(image, "error load", () => {
        dimensions[src] = toDimensions(image);
        trigger(el, createEvent("load", false));
      });
      loading[src] = true;
      return toDimensions(image);
    }
  }
  return dimensions[src] = toDimensions(image);
}
function toDimensions(image) {
  return {
    width: image.naturalWidth,
    height: image.naturalHeight
  };
}
function parseStops(stops, convert) {
  var _a, _b;
  const result = [];
  const { length } = stops;
  let nullIndex = 0;
  for (let i = 0; i < length; i++) {
    const rawStop = (_a = stops[i]) != null ? _a : 0;
    const [rawValue = 0, rawPercent] = isString(rawStop) ? rawStop.trim().split(/ (?![^(]*\))/) : [rawStop];
    const value = convert(rawValue);
    let percent = rawPercent ? toFloat(rawPercent) / 100 : null;
    if (i === 0) {
      if (percent === null) {
        percent = 0;
      } else if (percent) {
        result.push([value, 0]);
      }
    } else if (i === length - 1) {
      if (percent === null) {
        percent = 1;
      } else if (percent !== 1) {
        result.push([value, percent]);
        percent = 1;
      }
    }
    result.push([value, percent]);
    if (percent === null) {
      nullIndex++;
    } else if (nullIndex) {
      const left = result[i - nullIndex - 1];
      if (!left) {
        continue;
      }
      const leftPercent = (_b = left[1]) != null ? _b : 0;
      const p = (percent - leftPercent) / (nullIndex + 1);
      for (let j = nullIndex; j > 0; j--) {
        const unresolved = result[i - j];
        if (unresolved) {
          unresolved[1] = leftPercent + p * (nullIndex - j + 1);
        }
      }
      nullIndex = 0;
    }
  }
  return result.map(([value, percent]) => [value, percent != null ? percent : 0]);
}
function getStop(stops, percent) {
  const index = findIndex(stops.slice(1), ([, targetPercent]) => percent <= targetPercent) + 1;
  const start = stops[index - 1];
  const end = stops[index];
  if (!start || !end) {
    return void 0;
  }
  return [start[0], end[0], (percent - start[1]) / (end[1] - start[1])];
}
function getValue(stops, percent) {
  const stop = getStop(stops, percent);
  if (!stop) {
    return 0;
  }
  const [start, end, progress] = stop;
  return start + (end - start) * progress;
}
const unitRe = /^-?\d+(?:\.\d+)?(\S+)?/;
function getUnit(stops, defaultUnit) {
  for (const stop of stops) {
    const match = isString(stop) ? stop.match(unitRe) : null;
    if (match) {
      return match[1];
    }
  }
  return defaultUnit;
}
function getCssValue(el, property, value) {
  const cssProperty = propName(property);
  const previous = el.style.getPropertyValue(cssProperty);
  const val = css(css(el, property, value), property);
  el.style.setProperty(cssProperty, previous);
  return val;
}
function fillObject(keys2, value) {
  return keys2.reduce((data, property) => {
    data[property] = value;
    return data;
  }, {});
}
function isParallaxProperty(value) {
  return Object.hasOwn(propertyFactories, value);
}
function isRawStop(value) {
  return typeof value === "string" || typeof value === "number";
}
function toRawStops(value) {
  if (!Array.isArray(value)) {
    return void 0;
  }
  const stops = [];
  for (const stop of value) {
    if (!isRawStop(stop)) {
      return void 0;
    }
    stops.push(stop);
  }
  return stops;
}
function isRawStops(value) {
  return Boolean(value == null ? void 0 : value.every(isRawStop));
}
function getNumericStops(value) {
  if (!value) {
    return [];
  }
  const stops = [];
  for (const stop of value) {
    if (Array.isArray(stop) && typeof stop[0] === "number" && typeof stop[1] === "number") {
      stops.push([stop[0], stop[1]]);
    }
  }
  return stops;
}
function getBackgroundProperties(properties) {
  return ["bgx", "bgy"].filter((property) => property in properties);
}
function ease(percent, easing) {
  return easing >= 0 ? Math.pow(percent, easing + 1) : 1 - Math.pow(1 - percent, 1 - easing);
}

export { Parallax as default, ease };
