import * as child_process from 'child_process';

interface Options {
  timeoutInMs: number | undefined;
  killProcessIfTimeout: boolean;
}

const defaultOption: Options = {
  killProcessIfTimeout: false,
  timeoutInMs: undefined
};

/**
 * returns a Promise that resolves on the child process's exit event (
 * when the process exits or terminated by a signal), or rejects on the
 * child process's error event, or rejects upon timeout
 *
 * @param process - the child process
 * @param options - (optional) options object
 *      timeoutInMs - an optional timeout
 *      killProcessIfTimeout - if upon timeout, whether or not to kill the child process
 * @returns the Promise
 */

export function promiseExit(
  process: child_process.ChildProcess,
  options: Partial<Options> = {}
): Promise<[number | null, NodeJS.Signals | null]> {
  options = { ...defaultOption, ...options };
  let solveOrRejected = false;
  return new Promise((resolve, reject) => {
    process.on('exit', (code, signal) => {
      solveOrRejected = true;
      resolve([code, signal]);
    });
    process.on('error', error => {
      solveOrRejected = true;
      reject(error);
    });
    if (options.timeoutInMs !== undefined) {
      setTimeout(() => {
        if (!solveOrRejected) {
          if (options.killProcessIfTimeout) {
            process.kill();
          }
          solveOrRejected = true;
          reject(new Error('Wait timeout'));
        }
      }, options.timeoutInMs);
    }
  });
}
