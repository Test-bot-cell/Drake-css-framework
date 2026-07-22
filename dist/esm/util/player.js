import { isTag } from './dom.js';
import { once } from './event.js';
import { noop, isObject, includes } from './lang.js';

function play(element) {
  const node = firstElement(element);
  if (isIFrame(node)) {
    void call(node, { func: "playVideo", method: "play" });
  }
  if (isHTML5(node)) {
    node.play().catch(noop);
  }
}
function pause(element) {
  const node = firstElement(element);
  if (isIFrame(node) && node._ukPlayer) {
    void call(node, { func: "pauseVideo", method: "pause" });
  }
  if (isHTML5(node)) {
    node.pause();
  }
}
function mute(element) {
  const node = firstElement(element);
  if (isIFrame(node)) {
    void call(node, { func: "mute", method: "setVolume", value: 0 });
  }
  if (isHTML5(node)) {
    node.muted = true;
  }
}
function firstElement(element) {
  if (element instanceof Element) {
    return element;
  }
  return Array.from(element != null ? element : []).find((item) => item instanceof Element);
}
function isHTML5(element) {
  return element instanceof HTMLVideoElement || isTag(element, "video");
}
function isIFrame(element) {
  return (element instanceof HTMLIFrameElement || isTag(element, "iframe")) && isFrameProvider(element);
}
function isFrameProvider(element) {
  return element instanceof HTMLIFrameElement && (isYoutube(element) || isVimeo(element));
}
function isYoutube(element) {
  return /\/\/.*?youtube(-nocookie)?\.[a-z]+\/(watch\?v=[^&\s]+|embed)|youtu\.be\/.*/.test(
    element.src
  );
}
function isVimeo(element) {
  return /vimeo\.com\/video\/.*/.test(element.src);
}
async function call(element, command) {
  await enableApi(element);
  post(element, command);
}
function post(element, command) {
  var _a;
  (_a = element.contentWindow) == null ? void 0 : _a.postMessage(JSON.stringify({ event: "command", ...command }), "*");
}
let counter = 0;
function enableApi(element) {
  if (element._ukPlayer) {
    return element._ukPlayer;
  }
  const youtube = isYoutube(element);
  const vimeo = isVimeo(element);
  const id = ++counter;
  let poller;
  element._ukPlayer = new Promise((resolve) => {
    if (youtube) {
      once(element, "load", () => {
        const listener = () => post(element, { event: "listening", id });
        poller = setInterval(listener, 100);
        listener();
      });
    }
    once(
      window,
      "message",
      () => resolve(),
      false,
      (event) => {
        if (!(event instanceof MessageEvent) || typeof event.data !== "string") {
          return false;
        }
        try {
          const data = JSON.parse(event.data);
          return isObject(data) && (youtube && data.id === id && data.event === "onReady" || vimeo && Number(data.player_id) === id);
        } catch {
          return false;
        }
      }
    );
    element.src = `${element.src}${includes(element.src, "?") ? "&" : "?"}${youtube ? "enablejsapi=1" : `api=1&player_id=${id}`}`;
  }).then(() => {
    if (poller) {
      clearInterval(poller);
    }
  });
  return element._ukPlayer;
}

export { mute, pause, play };
