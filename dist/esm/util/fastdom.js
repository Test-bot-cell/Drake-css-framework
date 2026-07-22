const fastdom = { read, write, clear, flush };
const reads = [];
const writes = [];
function read(task) {
  reads.push(task);
  scheduleFlush();
  return task;
}
function write(task) {
  writes.push(task);
  scheduleFlush();
  return task;
}
function clear(task) {
  remove(reads, task);
  remove(writes, task);
}
let scheduled = false;
function flush() {
  runTasks(reads);
  runTasks(writes.splice(0));
  scheduled = false;
  if (reads.length || writes.length) {
    scheduleFlush();
  }
}
function scheduleFlush() {
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(flush);
  }
}
function runTasks(tasks) {
  let task;
  while (task = tasks.shift()) {
    try {
      task();
    } catch (error) {
      console.error(error);
    }
  }
}
function remove(array, item) {
  const index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

export { fastdom };
