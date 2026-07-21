import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';

const stopLessWatcher = watch('src/less', '.less', ['build/less.js']);
const runtime = spawn(process.execPath, ['build/build.js', 'watch', 'nominify'], {
    stdio: 'inherit',
});

let stopping = false;
runtime.once('exit', (code, signal) => {
    if (!stopping) {
        stopLessWatcher();
        console.error(`TypeScript watcher stopped (${signal || code || 0}).`);
        process.exitCode = code || 1;
    }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
        stopping = true;
        stopLessWatcher();
        runtime.kill(signal);
        process.exitCode = signal === 'SIGINT' ? 130 : 143;
    });
}

function watch(path, pattern, args) {
    let debounceTimer;

    execute();

    const watcher = fs.watch(path, { recursive: true }, (event, filename) => {
        if (filename?.endsWith(pattern)) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(execute, 100);
        }
    });

    function execute() {
        try {
            execFileSync(process.execPath, args, { stdio: 'inherit' });
        } catch {
            console.error('Less build failed; waiting for the next change.');
        }
    }

    return () => {
        clearTimeout(debounceTimer);
        watcher.close();
    };
}
