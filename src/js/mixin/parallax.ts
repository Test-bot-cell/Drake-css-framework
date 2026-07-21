import {
    clamp,
    createEvent,
    css,
    Dimensions,
    findIndex,
    isString,
    noop,
    once,
    propName,
    resetProps,
    toFloat,
    toPx,
    trigger,
    ucfirst,
    type DimensionsValue,
} from 'drake-util';
import { defineMixin } from '../api/options';
import Media from '../mixin/media';
import type { ComponentInternalInstance, CssProperties } from '../types';
import { getMaxPathLength } from '../util/svg';

type RawStop = string | number;
type RawStops = RawStop[];
type ParsedStop<T> = [T, number];
type ParsedStops<T> = Array<ParsedStop<T>>;
type NumericStops = ParsedStops<number>;
type StopCollection = Record<string, RawStops | NumericStops | undefined>;
type CssSetter = (styles: CssProperties, percent: number) => void;
type ParallaxFactory = (
    property: string,
    element: HTMLElement,
    stops: RawStops,
    properties: StopCollection,
) => CssSetter;

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
    bgy: backgroundFn,
} satisfies Record<string, ParallaxFactory>;

type ParallaxProperty = keyof typeof propertyFactories;
type ResolvedParallaxProperties = Partial<Record<ParallaxProperty, CssSetter>>;

interface ParallaxInstance extends ComponentInternalInstance {
    readonly $el: HTMLElement;
    props: ResolvedParallaxProperties;
    reset(): void;
    getCss(percent: number): CssProperties;
}

const { keys } = Object;

export default defineMixin<ParallaxInstance>()({
    mixins: [Media],

    props: fillObject(keys(propertyFactories), 'list'),

    data: fillObject(keys(propertyFactories), undefined),

    computed: {
        props(properties: Record<string, unknown>, $el: HTMLElement): ResolvedParallaxProperties {
            const stops: StopCollection = {};
            for (const property in properties) {
                const values = toRawStops(properties[property]);
                if (isParallaxProperty(property) && values) {
                    stops[property] = values.slice();
                }
            }
            const result: ResolvedParallaxProperties = {};
            for (const property in stops) {
                const values = stops[property];
                if (isParallaxProperty(property) && isRawStops(values)) {
                    result[property] = propertyFactories[property](property, $el, values, stops);
                }
            }
            return result;
        },
    },

    events: {
        name: 'load',
        handler(): void {
            this.$emit();
        },
    },

    methods: {
        reset(): void {
            resetProps(this.$el, this.getCss(0));
        },

        getCss(percent: number): CssProperties {
            const styles: CssProperties = {};
            for (const property in this.props) {
                if (isParallaxProperty(property)) {
                    this.props[property]?.(styles, clamp(percent));
                }
            }
            styles.willChange = Object.keys(styles).map(propName).join(',');
            return styles;
        },
    },
});

function transformFn(property: string, el: HTMLElement, inputStops: RawStops): CssSetter {
    let unit =
        getUnit(inputStops) ||
        (property === 'x' || property === 'y' ? 'px' : property === 'rotate' ? 'deg' : '');
    let transformName = property;
    let convert: (stop: RawStop) => number = toFloat;

    if (property === 'x' || property === 'y') {
        transformName = `translate${ucfirst(property)}`;
        convert = (stop: RawStop) => toFloat(toFloat(stop).toFixed(unit === 'px' ? 0 : 6));
    } else if (property === 'scale') {
        unit = '';
        convert = (stop: RawStop) =>
            getUnit([stop])
                ? toPx(stop, 'width', el, true) /
                  (typeof stop === 'string' && stop.endsWith('vh')
                      ? el.offsetHeight
                      : el.offsetWidth)
                : toFloat(stop);
    }

    if (inputStops.length === 1) {
        inputStops.unshift(property === 'scale' ? 1 : 0);
    }

    const stops = parseStops(inputStops, convert);

    return (styles, percent) => {
        styles.transform = `${styles.transform || ''} ${transformName}(${getValue(stops, percent)}${unit})`;
    };
}

function colorFn(property: string, el: HTMLElement, inputStops: RawStops): CssSetter {
    if (inputStops.length === 1) {
        inputStops.unshift(getCssValue(el, property, ''));
    }

    const stops = parseStops(inputStops, (stop) => parseColor(el, stop));

    return (styles, percent) => {
        const stop = getStop(stops, percent);
        if (!stop) {
            return;
        }
        const [start, end, progress] = stop;
        const value = start
            .map((value, i) => {
                value += progress * ((end[i] ?? value) - value);
                return i === 3 ? toFloat(value) : Number.parseInt(String(value), 10);
            })
            .join(',');
        styles[property] = `rgba(${value})`;
    };
}

function parseColor(el: HTMLElement, color: RawStop): number[] {
    const channels: RawStop[] = getCssValue(el, 'color', color).split(/[(),]/g).slice(1, -1);
    channels.push(1);
    return channels.slice(0, 4).map(toFloat);
}

function filterFn(property: string, _el: HTMLElement, inputStops: RawStops): CssSetter {
    if (inputStops.length === 1) {
        inputStops.unshift(0);
    }

    const unit =
        getUnit(inputStops) || (property === 'blur' ? 'px' : property === 'hue' ? 'deg' : '%');
    const filterName =
        property === 'fopacity' ? 'opacity' : property === 'hue' ? 'hue-rotate' : property;
    const stops = parseStops(inputStops, toFloat);

    return (styles, percent) => {
        const value = getValue(stops, percent);
        styles.filter = `${styles.filter || ''} ${filterName}(${value + unit})`;
    };
}

function cssPropFn(property: string, el: HTMLElement, inputStops: RawStops): CssSetter {
    if (inputStops.length === 1) {
        inputStops.unshift(getCssValue(el, property, ''));
    }

    const stops = parseStops(inputStops, toFloat);

    return (styles, percent) => {
        styles[property] = getValue(stops, percent);
    };
}

function strokeFn(_property: string, el: HTMLElement, inputStops: RawStops): CssSetter {
    if (inputStops.length === 1) {
        inputStops.unshift(0);
    }

    const unit = getUnit(inputStops);
    const length = getMaxPathLength(el);
    const stops = parseStops(inputStops.reverse(), (stop) => {
        const value = toFloat(stop);
        return unit === '%' ? (value * length) / 100 : value;
    });

    if (!stops.some(([value]) => value)) {
        return noop;
    }

    css(el, 'strokeDasharray', length);

    return (styles, percent) => {
        styles.strokeDashoffset = getValue(stops, percent);
    };
}

function backgroundFn(
    property: string,
    el: HTMLElement,
    inputStops: RawStops,
    properties: StopCollection,
): CssSetter {
    if (inputStops.length === 1) {
        inputStops.unshift(0);
    }

    const dimension = property === 'bgy' ? 'height' : 'width';
    properties[property] = parseStops(inputStops, (stop) => toPx(stop, dimension, el));

    const backgroundProperties = getBackgroundProperties(properties);
    if (backgroundProperties.length === 2 && property === 'bgx') {
        return noop;
    }

    if (getCssValue(el, 'backgroundSize', '') === 'cover') {
        return backgroundCoverFn(property, el, properties);
    }

    const positions: Record<string, string> = {};
    for (const backgroundProperty of backgroundProperties) {
        positions[backgroundProperty] = getBackgroundPos(el, backgroundProperty);
    }

    return setBackgroundPosFn(backgroundProperties, positions, properties);
}

function backgroundCoverFn(
    _property: string,
    el: HTMLElement,
    properties: StopCollection,
): CssSetter {
    const dimImage = getBackgroundImageDimensions(el);

    if (!dimImage.width) {
        return noop;
    }

    const dimEl = {
        width: el.offsetWidth,
        height: el.offsetHeight,
    };

    const backgroundProperties = getBackgroundProperties(properties);

    const positions: Record<string, string> = {};
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
        dimEl[property === 'bgy' ? 'height' : 'width'] += diff;
    }

    const dim = Dimensions.cover(dimImage, dimEl);

    for (const property of backgroundProperties) {
        const dimension = property === 'bgy' ? 'height' : 'width';
        const overflow = dim[dimension] - dimEl[dimension];
        positions[property] =
            `max(${getBackgroundPos(el, property)},-${overflow}px) + ${positions[property] ?? ''}`;
    }

    const setBackgroundPosition = setBackgroundPosFn(backgroundProperties, positions, properties);
    return (styles, percent) => {
        setBackgroundPosition(styles, percent);
        styles.backgroundSize = `${dim.width}px ${dim.height}px`;
        styles.backgroundRepeat = 'no-repeat';
    };
}

type BackgroundProperty = 'bgx' | 'bgy';

function getBackgroundPos(el: HTMLElement, property: BackgroundProperty): string {
    return getCssValue(el, `background-position-${property.slice(-1)}`, '');
}

function setBackgroundPosFn(
    backgroundProperties: BackgroundProperty[],
    positions: Record<string, string>,
    properties: StopCollection,
): CssSetter {
    return (styles, percent) => {
        for (const property of backgroundProperties) {
            const value = getValue(getNumericStops(properties[property]), percent);
            styles[`background-position-${property.slice(-1)}`] =
                `calc(${positions[property] ?? ''} + ${value}px)`;
        }
    };
}

const loading: Record<string, boolean> = {};
const dimensions: Record<string, DimensionsValue> = {};
function getBackgroundImageDimensions(el: HTMLElement): DimensionsValue {
    const src = css(el, 'backgroundImage').replace(/^none|url\(["']?(.+?)["']?\)$/, '$1');

    const cached = dimensions[src];
    if (cached) {
        return cached;
    }

    const image = new Image();
    if (src) {
        image.src = src;

        if (!image.naturalWidth && !loading[src]) {
            once(image, 'error load', () => {
                dimensions[src] = toDimensions(image);
                trigger(el, createEvent('load', false));
            });
            loading[src] = true;

            return toDimensions(image);
        }
    }

    return (dimensions[src] = toDimensions(image));
}

function toDimensions(image: HTMLImageElement): DimensionsValue {
    return {
        width: image.naturalWidth,
        height: image.naturalHeight,
    };
}

function parseStops<T>(stops: RawStops, convert: (value: RawStop) => T): ParsedStops<T> {
    const result: Array<[T, number | null]> = [];
    const { length } = stops;
    let nullIndex = 0;
    for (let i = 0; i < length; i++) {
        const rawStop = stops[i] ?? 0;
        const [rawValue = 0, rawPercent] = isString(rawStop)
            ? rawStop.trim().split(/ (?![^(]*\))/)
            : [rawStop];
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
            const leftPercent = left[1] ?? 0;
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

    return result.map(([value, percent]) => [value, percent ?? 0]);
}

function getStop<T>(stops: ParsedStops<T>, percent: number): [T, T, number] | undefined {
    const index = findIndex(stops.slice(1), ([, targetPercent]) => percent <= targetPercent) + 1;
    const start = stops[index - 1];
    const end = stops[index];
    if (!start || !end) {
        return undefined;
    }
    return [start[0], end[0], (percent - start[1]) / (end[1] - start[1])];
}

function getValue(stops: NumericStops, percent: number): number {
    const stop = getStop(stops, percent);
    if (!stop) {
        return 0;
    }
    const [start, end, progress] = stop;
    return start + (end - start) * progress;
}

const unitRe = /^-?\d+(?:\.\d+)?(\S+)?/;
function getUnit(stops: RawStops, defaultUnit?: string): string | undefined {
    for (const stop of stops) {
        const match = isString(stop) ? stop.match(unitRe) : null;
        if (match) {
            return match[1];
        }
    }
    return defaultUnit;
}

function getCssValue(el: HTMLElement, property: string, value: RawStop): string {
    const cssProperty = propName(property);
    const previous = el.style.getPropertyValue(cssProperty);
    const val = css(css(el, property, value), property);
    el.style.setProperty(cssProperty, previous);
    return val;
}

function fillObject(keys: string[], value: unknown): Record<string, unknown> {
    return keys.reduce<Record<string, unknown>>((data, property) => {
        data[property] = value;
        return data;
    }, {});
}

function isParallaxProperty(value: string): value is ParallaxProperty {
    return Object.hasOwn(propertyFactories, value);
}

function isRawStop(value: unknown): value is RawStop {
    return typeof value === 'string' || typeof value === 'number';
}

function toRawStops(value: unknown): RawStops | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }
    const stops: RawStops = [];
    for (const stop of value) {
        if (!isRawStop(stop)) {
            return undefined;
        }
        stops.push(stop);
    }
    return stops;
}

function isRawStops(value: RawStops | NumericStops | undefined): value is RawStops {
    return Boolean(value?.every(isRawStop));
}

function getNumericStops(value: RawStops | NumericStops | undefined): NumericStops {
    if (!value) {
        return [];
    }
    const stops: NumericStops = [];
    for (const stop of value) {
        if (Array.isArray(stop) && typeof stop[0] === 'number' && typeof stop[1] === 'number') {
            stops.push([stop[0], stop[1]]);
        }
    }
    return stops;
}

function getBackgroundProperties(properties: StopCollection): BackgroundProperty[] {
    return (['bgx', 'bgy'] as const).filter((property) => property in properties);
}

/*
 * Inspired by https://gist.github.com/gre/1650294?permalink_comment_id=3477425#gistcomment-3477425
 *
 * linear: 0
 * easeInSine: 0.5
 * easeOutSine: -0.5
 * easeInQuad: 1
 * easeOutQuad: -1
 * easeInCubic: 2
 * easeOutCubic: -2
 * easeInQuart: 3
 * easeOutQuart: -3
 * easeInQuint: 4
 * easeOutQuint: -4
 */
export function ease(percent: number, easing: number): number {
    return easing >= 0 ? Math.pow(percent, easing + 1) : 1 - Math.pow(1 - percent, 1 - easing);
}
