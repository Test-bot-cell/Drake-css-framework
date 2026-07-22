import { toggleClass, addClass } from '../util/class.js';
import { last, includes, toFloat, toNumber, getIndex, findIndex, sumBy } from '../util/lang.js';
import { data } from '../util/attr.js';
import { children, isVisible } from '../util/filter.js';
import { css } from '../util/style.js';
import { dimensions } from '../util/dimensions.js';
import { $ } from '../util/dom.js';
import { resize, intersection } from '../api/observables.js';
import { defineComponent } from '../api/options.js';
import Class from '../mixin/class.js';
import Slider, { speedUp } from '../mixin/slider.js';
import SliderParallax from '../mixin/slider-parallax.js';
import SliderReactive from '../mixin/slider-reactive.js';
import SliderPreload from './internal/slider-preload.js';
import Transitioner, { getWidth, getMax } from './internal/slider-transitioner.js';

var slider = defineComponent()({
  mixins: [Class, Slider, SliderReactive, SliderParallax, SliderPreload],
  props: {
    center: Boolean,
    sets: Boolean,
    active: String
  },
  data: {
    center: false,
    sets: false,
    attrItem: "drk-slider-item",
    selList: ".drk-slider-items",
    selNav: ".drk-slider-nav",
    clsContainer: "drk-slider-container",
    active: "all",
    Transitioner
  },
  computed: {
    finite({ finite }) {
      return finite || isFinite(this.list, this.center);
    },
    maxIndex() {
      var _a;
      if (!this.finite || this.center && !this.sets) {
        return this.length - 1;
      }
      if (this.center) {
        return Array.isArray(this.sets) ? (_a = last(this.sets)) != null ? _a : this.length - 1 : this.length - 1;
      }
      let lft = 0;
      const max = getMax(this.list);
      const index = findIndex(this.slides, (el) => {
        if (lft >= max - 5e-3) {
          return true;
        }
        lft += dimensions(el).width;
        return false;
      });
      return ~index ? index : this.length - 1;
    },
    sets({ sets: enabled }) {
      if (!enabled || this.parallax) {
        return;
      }
      let left = 0;
      const sets = [];
      const width = dimensions(this.list).width;
      for (let i = 0; i < this.length; i++) {
        const slide = this.slides[i];
        if (!slide) {
          continue;
        }
        const slideWidth = dimensions(slide).width;
        if (left + slideWidth > width) {
          left = 0;
        }
        if (this.center) {
          if (left < width / 2 && left + slideWidth + dimensions(this.slides[getIndex(i + 1, this.slides)]).width / 2 > width / 2) {
            sets.push(i);
            left = (width - slideWidth) / 2;
          }
        } else if (left === 0) {
          sets.push(Math.min(i, this.maxIndex));
        }
        left += slideWidth;
      }
      if (sets.length) {
        return sets;
      }
    },
    transitionOptions() {
      return {
        center: this.center,
        list: this.list
      };
    },
    slides() {
      return children(this.list).filter(
        (slide) => slide instanceof HTMLElement && isVisible(slide)
      );
    }
  },
  connected() {
    toggleClass(this.$el, this.clsContainer, !$(`.${this.clsContainer}`, this.$el));
  },
  observe: [
    resize({
      target: ({ list, $el }) => [$el, ...children(list)]
    }),
    intersection({
      handler(entries) {
        for (const { target, isIntersecting } of entries) {
          const hidden = !isIntersecting;
          Reflect.set(target, "inert", hidden);
          target.ariaHidden = String(hidden);
        }
      },
      target: ({ list }) => children(list),
      args: { intersecting: false },
      options: ({ $el }) => ({
        root: $el,
        rootMargin: "0px -10px"
      })
    })
  ],
  update: {
    write() {
      for (const el of this.navItems) {
        const index = toNumber(data(el, this.attrItem));
        if (index !== false) {
          el.hidden = !this.maxIndex || index > this.maxIndex || Boolean(this.sets && !includes(this.sets, index));
        }
      }
      this.reorder();
      if (!this.parallax) {
        this._translate(1);
      }
      this.updateActiveClasses();
    },
    events: ["resize"]
  },
  events: [
    {
      name: "beforeitemshow",
      handler(e) {
        if (!this.dragging && this.sets && this.stack.length < 2 && !includes(this.sets, this.index)) {
          this.index = this.getValidIndex();
        }
        const diff = Math.abs(
          this.index - this.prevIndex + (this.dir > 0 && this.index < this.prevIndex || this.dir < 0 && this.index > this.prevIndex ? (this.maxIndex + 1) * this.dir : 0)
        );
        if (!this.dragging && diff > 1) {
          for (let i = 0; i < diff; i++) {
            this.stack.splice(1, 0, this.dir > 0 ? "next" : "previous");
          }
          e.preventDefault();
          return;
        }
        const index = this.dir < 0 || !this.slides[this.prevIndex] ? this.index : this.prevIndex;
        const avgWidth = getWidth(this.list) / this.length;
        this.duration = speedUp(avgWidth / this.velocity) * (dimensions(this.slides[index]).width / avgWidth);
        this.reorder();
      }
    },
    {
      name: "itemshow",
      handler() {
        if (~this.prevIndex) {
          addClass(this._getTransitioner().getItemIn(), this.clsActive);
        }
        this.updateActiveClasses(this.prevIndex);
      }
    },
    {
      name: "itemshown",
      handler() {
        this.updateActiveClasses();
      }
    }
  ],
  methods: {
    reorder() {
      if (this.finite) {
        css(this.slides, "order", "");
        return;
      }
      const index = this.dir > 0 && this.slides[this.prevIndex] ? this.prevIndex : this.index;
      this.slides.forEach(
        (slide, i) => css(
          slide,
          "order",
          this.dir > 0 && i < index ? 1 : this.dir < 0 && i >= this.index ? -1 : ""
        )
      );
      if (!this.center || !this.length) {
        return;
      }
      const next = this.slides[index];
      let width = (dimensions(this.list).width - dimensions(next).width) / 2;
      let j = 0;
      while (width > 0) {
        const slideIndex = this.getIndex(--j + index, index);
        const slide = this.slides[slideIndex];
        css(slide, "order", slideIndex > index ? -2 : -1);
        width -= dimensions(slide).width;
      }
    },
    updateActiveClasses(currentIndex = this.index) {
      let actives = this._getTransitioner(currentIndex).getActives();
      if (this.active !== "all") {
        const active = this.slides[this.getValidIndex(currentIndex)];
        actives = active ? [active] : [];
      }
      const activeClasses = [
        this.clsActive,
        !this.sets || includes(this.sets, toFloat(this.index)) ? this.clsActivated : ""
      ];
      for (const slide of this.slides) {
        toggleClass(slide, activeClasses, includes(actives, slide));
      }
    },
    getValidIndex(index = this.index, prevIndex = this.prevIndex) {
      index = this.getIndex(index, prevIndex);
      if (!this.sets) {
        return index;
      }
      let prev;
      do {
        if (includes(this.sets, index)) {
          return index;
        }
        prev = index;
        index = this.getIndex(index + this.dir, prevIndex);
      } while (index !== prev);
      return index;
    },
    getAdjacentSlides() {
      const { width } = dimensions(this.list);
      const left = -width;
      const right = width * 2;
      const slideWidth = dimensions(this.slides[this.index]).width;
      const slideLeft = this.center ? (width - slideWidth) / 2 : 0;
      const slides = /* @__PURE__ */ new Set();
      for (const i of [-1, 1]) {
        let currentLeft = slideLeft + (i > 0 ? slideWidth : 0);
        let j = 0;
        do {
          const slide = this.slides[this.getIndex(this.index + i + j++ * i)];
          if (!slide) {
            break;
          }
          currentLeft += dimensions(slide).width * i;
          slides.add(slide);
        } while (this.length > j && currentLeft > left && currentLeft < right);
      }
      return Array.from(slides);
    },
    getIndexAt(percent) {
      let index = -1;
      const scrollDist = this.center ? getWidth(this.list) - (dimensions(this.slides[0]).width + dimensions(last(this.slides)).width) / 2 : getWidth(this.list, this.maxIndex);
      let dist = percent * scrollDist;
      let slidePercent;
      do {
        const slideWidth = dimensions(this.slides[++index]).width;
        const slideDist = this.center ? (slideWidth + dimensions(this.slides[index + 1]).width) / 2 : slideWidth;
        slidePercent = dist / slideDist % 1;
        dist -= slideDist;
      } while (dist >= 0 && index < this.maxIndex);
      return [index, slidePercent];
    }
  }
});
function isFinite(list, center) {
  if (!list) {
    return true;
  }
  const rawLength = Reflect.get(list, "length");
  if (typeof rawLength === "number" && rawLength < 2) {
    return true;
  }
  const { width: listWidth } = dimensions(list);
  if (!center) {
    return Math.ceil(getWidth(list)) < Math.trunc(listWidth + getMaxElWidth(list));
  }
  const slides = children(list);
  const listHalf = Math.trunc(listWidth / 2);
  for (const index in slides) {
    const slide = slides[index];
    const slideWidth = dimensions(slide).width;
    const slidesInView = /* @__PURE__ */ new Set([slide]);
    let diff = 0;
    for (const i of [-1, 1]) {
      let left = slideWidth / 2;
      let j = 0;
      while (left < listHalf) {
        const nextSlide = slides[getIndex(+index + i + j++ * i, slides)];
        if (slidesInView.has(nextSlide)) {
          return true;
        }
        left += dimensions(nextSlide).width;
        slidesInView.add(nextSlide);
      }
      diff = Math.max(
        diff,
        (slideWidth + dimensions(slides[getIndex(+index + i, slides)]).width) / 2 - (left - listHalf)
      );
    }
    if (Math.trunc(diff) > sumBy(
      slides.filter((slide2) => !slidesInView.has(slide2)),
      (slide2) => dimensions(slide2).width
    )) {
      return true;
    }
  }
  return false;
}
function getMaxElWidth(list) {
  return Math.max(0, ...children(list).map((el) => dimensions(el).width));
}

export { slider as default };
