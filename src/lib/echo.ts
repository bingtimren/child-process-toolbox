import * as child_process from 'child_process';
import * as readline from 'readline';
import { Readable, Writable } from 'stream';

function echoReadable(
  input: Readable | null,
  output: Writable,
  prefix?: string
): void {
  /* istanbul ignore else */
  if (input) {
    const reader = readline.createInterface({ input });
    reader.on('line', line => {
      output.write(prefix ? prefix + ' ' + line + '\n' : line + '\n');
    });
  }
}
/**
 * Echo childProcess's stderr and/or stdout to the parent process's stderr/stdout
 * @param childProcess
 * @param options - optional options
 * @param options.parentProcess - default the current process
 * @param options.outPrefix - prefix of each line from stdout
 * @param options.errPrefix - prefix of each line from stderr
 */
export function echoChildProcessOutput(
  childProcess: child_process.ChildProcess,
  options: {
    parentProcess?: NodeJS.Process;
    outPrefix?: string;
    errPrefix?: string;
    echoStdout?: boolean;
    echoStderr?: boolean;
  } = {}
) {
  // apply default options
  const opt = {
    echoStderr: true,
    echoStdout: true,
    parentProcess: process,
    ...options
  };
  if (opt.echoStdout) {
    echoReadable(childProcess.stdout, opt.parentProcess.stdout, opt.outPrefix);
  }
  if (opt.echoStderr) {
    echoReadable(childProcess.stderr, opt.parentProcess.stderr, opt.errPrefix);
  }
}
