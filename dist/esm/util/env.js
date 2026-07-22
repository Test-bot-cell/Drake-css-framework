const inBrowser = typeof window !== "undefined";
const isRtl = inBrowser && document.dir === "rtl";
const hasTouch = inBrowser && "ontouchstart" in window;
const hasPointerEvents = inBrowser && window.PointerEvent;
const pointerDown = hasPointerEvents ? "pointerdown" : hasTouch ? "touchstart" : "mousedown";
const pointerMove = hasPointerEvents ? "pointermove" : hasTouch ? "touchmove" : "mousemove";
const pointerUp = hasPointerEvents ? "pointerup" : hasTouch ? "touchend" : "mouseup";
const pointerEnter = hasPointerEvents ? "pointerenter" : hasTouch ? "" : "mouseenter";
const pointerLeave = hasPointerEvents ? "pointerleave" : hasTouch ? "" : "mouseleave";
const pointerCancel = hasPointerEvents ? "pointercancel" : "touchcancel";

export { hasTouch, inBrowser, isRtl, pointerCancel, pointerDown, pointerEnter, pointerLeave, pointerMove, pointerUp };
