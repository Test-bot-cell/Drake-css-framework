function awaitFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
function awaitTimeout(timeout = 0) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export { awaitFrame, awaitTimeout };
