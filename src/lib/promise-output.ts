import * as child_process from 'child_process';
import * as readline from 'readline';
import { Readable } from 'stream';

function resolveOnPattern(
  stream: Readable | null,
  pattern: string | RegExp,
  action: (line: string) => void
): void {
  /* istanbul ignore else */
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

interface Options {
  watchStdout: boolean;
  watchStderr: boolean;
  timeoutInMs: number | undefined;
  killProcessIfTimeout: boolean;
}

const defaultOption: Options = {
  killProcessIfTimeout: false,
  timeoutInMs: undefined,
  watchStderr: true,
  watchStdout: true
};

/**
 * Return a Promise that resolves to a string (line of output) when a pattern to be outputed from the process's stdout or stderr
 * @param process
 * @param pattern - string or RegExp to match against the output
 * @param options - (optional) options
 *      - watchStdout
 *      - watchStderr
 *      - timeoutInMs - time in ms after which the Promise will be rejected
 *      - killProcessIfTimeout - when timeout, whether or not to kill the process before rejection
 */
export function promiseOutputPattern(
  process: child_process.ChildProcess,
  pattern: string | RegExp,
  options: Partial<Options> = {}
): Promise<string> {
  options = { ...defaultOption, ...options };
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
    if (options.watchStdout) {
      resolveOnPattern(process.stdout, pattern, res);
    }
    if (options.watchStderr) {
      resolveOnPattern(process.stderr, pattern, res);
    }
    process.on('error', fail('Process error'));
    if (options.timeoutInMs !== undefined) {
      setTimeout(() => {
        if (!solved) {
          if (options.killProcessIfTimeout) {
            process.kill();
          }
          solved = true;
          reject(new Error('Wait timeout'));
        }
      }, options.timeoutInMs);
    }
  });
}
