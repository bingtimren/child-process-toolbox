import child_process from 'child_process';
import readline from 'readline';
import { Readable } from 'stream';

function resolveOnPattern(
    stream: Readable,
    pattern: string | RegExp,
    action: () => void
): void {
    if (stream) {
        const reader = readline.createInterface({ input: stream });
        reader.on('line', line => {
            if (
                (typeof pattern === 'string' && line.indexOf(pattern) >= 0) ||
                (pattern instanceof RegExp && pattern.test(line))
            ) {
                action();
            }
        });
    }
}
/**
 * Return a Promise that resolve when a pattern to be outputed from the process's stdout or stderr
 * @param process
 * @param pattern - string or RegExp to match against the output
 * @param watchStdout
 * @param watchStderr
 * @param timeoutInMs - time in ms after which the Promise will be rejected
 * @param killProcessIfTimeout - when timeout, whether or not to kill the process before rejection
 */
export function promiseOutputPattern(
    process: child_process.ChildProcessWithoutNullStreams,
    pattern: string | RegExp,
    watchStdout: boolean = true,
    watchStderr: boolean = true,
    timeoutInMs?: number,
    killProcessIfTimeout: boolean = false
): Promise<child_process.ChildProcessWithoutNullStreams> {
    let solved = false;
    return new Promise((resolve, reject) => {
        // resolve function
        const res = ()=>{
            if (!solved){solved=true; resolve(process)};
        }
        // fail function
        function fail(message:string):()=>void{
            return () => {if (!solved){solved = true;reject(new Error(message))}}
        }
        if (watchStdout) {
            resolveOnPattern(process.stdout, pattern, res);
        }
        if (watchStderr) {
            resolveOnPattern(process.stderr, pattern, res);
        }
        process.on('exit',fail('Process ended without pattern found in output'))
        process.on('error',fail('Process error'))
        if (timeoutInMs !== undefined) {
            setTimeout(() => {
                if (!solved) {
                    if (killProcessIfTimeout) {
                        process.kill();
                    }
                    solved = true
                    reject(new Error('Wait timeout'));
                }
            }, timeoutInMs);
        }
    });
}
