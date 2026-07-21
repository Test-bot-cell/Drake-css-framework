export type FastdomTask = () => unknown;

export const fastdom = { read, write, clear, flush };

const reads: FastdomTask[] = [];
const writes: FastdomTask[] = [];

function read<T extends FastdomTask>(task: T): T {
    reads.push(task);
    scheduleFlush();
    return task;
}

function write<T extends FastdomTask>(task: T): T {
    writes.push(task);
    scheduleFlush();
    return task;
}

function clear(task: FastdomTask): void {
    remove(reads, task);
    remove(writes, task);
}

let scheduled = false;
function flush(): void {
    runTasks(reads);
    runTasks(writes.splice(0));
    scheduled = false;
    if (reads.length || writes.length) {
        scheduleFlush();
    }
}

function scheduleFlush(): void {
    if (!scheduled) {
        scheduled = true;
        queueMicrotask(flush);
    }
}

function runTasks(tasks: FastdomTask[]): void {
    let task: FastdomTask | undefined;
    while ((task = tasks.shift())) {
        try {
            task();
        } catch (error) {
            console.error(error);
        }
    }
}

function remove(array: FastdomTask[], item: FastdomTask): void {
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
}
