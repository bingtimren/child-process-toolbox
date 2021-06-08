import * as child_process from 'child_process';
import * as readline from 'readline';
import { Readable } from 'stream';

function resolveOnPattern(
  stream: Readable | null,
  pattern: string | RegExp,
  action: (line: string) => void
): void {
  if (stream) {
    const reader = readline.createInterface({ input: stream });
    reader.on('line', line => {
      if (
        (typeof pattern === 'string' && line.indexOf(pattern) >= 0) ||
        (pattern instanceof RegExp && pattern.test(line))
      ) {
        action(line);
      }
    });
  }
}
/**
 * Return a Promise that resolves to a string (line of output) when a pattern to be outputed from the process's stdout or stderr
 * @param process
 * @param pattern - string or RegExp to match against the output
 * @param watchStdout
 * @param watchStderr
 * @param timeoutInMs - time in ms after which the Promise will be rejected
 * @param killProcessIfTimeout - when timeout, whether or not to kill the process before rejection
 */
export function promiseOutputPattern(
  process: child_process.ChildProcess,
  pattern: string | RegExp,
  watchStdout: boolean = true,
  watchStderr: boolean = true,
  timeoutInMs?: number,
  killProcessIfTimeout: boolean = false
): Promise<string> {
  let solved = false;
  return new Promise((resolve, reject) => {
    // resolve function
    const res = (line: string) => {
      if (!solved) {
        solved = true;
        resolve(line);
      }
    };
    // fail function
    function fail(message: string): () => void {
      return () => {
        if (!solved) {
          solved = true;
          reject(new Error(message));
        }
      };
    }
    if (watchStdout) {
      resolveOnPattern(process.stdout, pattern, res);
    }
    if (watchStderr) {
      resolveOnPattern(process.stderr, pattern, res);
    }
    process.on('exit', fail('Process ended without pattern found in output'));
    process.on('error', fail('Process error'));
    if (timeoutInMs !== undefined) {
      setTimeout(() => {
        if (!solved) {
          if (killProcessIfTimeout) {
            process.kill();
          }
          solved = true;
          reject(new Error('Wait timeout'));
        }
      }, timeoutInMs);
    }
  });
}
