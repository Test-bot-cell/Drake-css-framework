export type FastdomTask = () => unknown;
export declare const fastdom: {
    read: typeof read;
    write: typeof write;
    clear: typeof clear;
    flush: typeof flush;
};
declare function read<T extends FastdomTask>(task: T): T;
declare function write<T extends FastdomTask>(task: T): T;
declare function clear(task: FastdomTask): void;
declare function flush(): void;
export {};
