import { isTouch } from '../util/event.js';
import { hasAttr } from '../util/attr.js';
import { isTag } from '../util/dom.js';
import { pointerEnter, pointerLeave } from '../util/env.js';
import { parent } from '../util/filter.js';
import { play, mute, pause } from '../util/player.js';
import { query } from '../util/selector.js';
import { intersection } from '../api/observables.js';
import { defineComponent } from '../api/options.js';

var Video = defineComponent()({
  args: "autoplay",
  props: {
    automute: Boolean,
    autoplay: Boolean,
    restart: Boolean,
    hoverTarget: Boolean
  },
  data: {
    automute: false,
    autoplay: true,
    restart: false,
    hoverTarget: false
  },
  beforeConnect() {
    const isVideo = isVideoElement(this.$el);
    if (this.autoplay === "inview" && isVideo && !hasAttr(this.$el, "preload")) {
      this.$el.preload = "none";
    }
    if (!isVideo && !hasAttr(this.$el, "allow")) {
      this.$el.allow = "autoplay";
    }
    if (this.autoplay === "hover") {
      if (isVideo) {
        this.$el.tabIndex = 0;
      } else {
        this.autoplay = true;
      }
    }
    if (this.automute || hasAttr(this.$el, "muted")) {
      mute(this.$el);
    }
  },
  events: [
    {
      name: `${pointerEnter} focusin`,
      el: ({ hoverTarget, $el }) => (hoverTarget ? query(hoverTarget, $el) : void 0) || $el,
      filter: ({ autoplay }) => autoplay === "hover",
      handler(e) {
        if (!isTouch(e) || !isPlaying(this.$el)) {
          play(this.$el);
        } else {
          pauseHover(this.$el, this.restart);
        }
      }
    },
    {
      name: `${pointerLeave} focusout`,
      el: ({ hoverTarget, $el }) => (hoverTarget ? query(hoverTarget, $el) : void 0) || $el,
      filter: ({ autoplay }) => autoplay === "hover",
      handler(e) {
        if (!isTouch(e)) {
          pauseHover(this.$el, this.restart);
        }
      }
    }
  ],
  observe: [
    intersection({
      filter: ({ $el }) => isVideoElement($el) && $el.preload === "none",
      handler(entries) {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        const { target } = entry;
        if (isVideoElement(target)) {
          target.preload = "";
        }
        this.$reset();
      }
    }),
    intersection({
      filter: ({ $el, autoplay }) => autoplay !== "hover" && (!isVideoElement($el) || $el.preload !== "none"),
      handler(entries) {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        const { isIntersecting, target } = entry;
        if (!document.fullscreenElement) {
          if (isIntersecting) {
            if (this.autoplay) {
              play(target);
            }
          } else {
            pauseHover(target, this.restart);
          }
        }
      },
      args: { intersecting: false },
      options: ({ $el, autoplay }) => {
        var _a;
        const parentElement = parent($el);
        return {
          root: autoplay === "inview" ? null : (_a = parentElement == null ? void 0 : parentElement.closest(":not(a)")) != null ? _a : null
        };
      }
    })
  ]
});
function isVideoElement(element) {
  return isTag(element, "video");
}
function isPlaying(videoEl) {
  return !isVideoElement(videoEl) || !videoEl.paused && !videoEl.ended;
}
function pauseHover(el, restart) {
  pause(el);
  if (restart && isVideoElement(el)) {
    el.currentTime = 0;
  }
}

export { Video as default };
