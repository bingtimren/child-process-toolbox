import { ChildProcess } from 'child_process';
/**
 * Kill the process and return a promise that resolves the string killSignal or a numerical code on the process's "exit" event.
 * Normally it should resolves a string killSignal cause the process was terminated on a killSignal.
 * On "error" event of the process, the promise will be rejected.
 *
 * @param process
 * @param killSignal
 */
export async function promiseKilled(
  process: ChildProcess,
  signal?: number | NodeJS.Signals
): Promise<number | NodeJS.Signals> {
  return new Promise((resolve, reject) => {
    process.on('exit', (code, killSignal) => {
      /* istanbul ignore next */
      resolve(code !== null ? code : (killSignal as NodeJS.Signals)); // one of the two will be non-null per Node documentation
    });
    process.on('error', err => {
      reject(err);
    });
    if (typeof process.exitCode === 'number' || process.killed) {
      resolve(
        process.exitCode !== null
          ? process.exitCode
          : (process.signalCode as NodeJS.Signals)
      );
    }
    process.kill(signal);
  });
}
