import child_process from 'child_process';

export function promiseExit(
  process: child_process.ChildProcessWithoutNullStreams,
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
