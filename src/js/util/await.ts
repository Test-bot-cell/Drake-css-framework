export function awaitFrame(): Promise<DOMHighResTimeStamp> {
    return new Promise((resolve) => requestAnimationFrame(resolve));
}

export function awaitTimeout(timeout: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
