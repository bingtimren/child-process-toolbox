import * as child_process from 'child_process';

/**
 * returns a Promise that resolves on the child process's exit event (
 * when the process exits or terminated by a signal), or rejects on the
 * child process's error event, or rejects upon timeout
 *
 * @param process - the child process
 * @param timeoutInMs - an optional timeout
 * @param killProcessIfTimeout - if upon timeout, whether or not to kill the child process
 * @returns the Promise
 */
export function promiseExit(
  process: child_process.ChildProcess,
  timeoutInMs?: number,
  killProcessIfTimeout: boolean = false
): Promise<[number | null, NodeJS.Signals | null]> {
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
    if (timeoutInMs !== undefined) {
      setTimeout(() => {
        if (!solveOrRejected) {
          if (killProcessIfTimeout) {
            process.kill();
          }
          solveOrRejected = true;
          reject(new Error('Wait timeout'));
        }
      }, timeoutInMs);
    }
  });
}
