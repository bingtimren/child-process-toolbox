# child-process-tools

Helper functions to spawn and manage child processes, especially for writing shell utilities with Javascript / Typescript

## Usage

```Javascript
child_process = require('child_process')
tools = require('child-process-toolbox')
const child = child_process.spawn('bash',['-c','echo answer 42'])
// channel child process's stderr & stdout to the current process's stderr & stdout, so that 
// the spawned child process's output can be seen on console
tools.echoChildProcessOutput(child);
// wait for a pattern to be outputed from the child process's outputs (stderr & stdout)
await promiseOutputPattern(child, 'answer 24')
await promiseOutputPattern(child, /answer [0-9]{2}/)
```

See unit test cases in "*.spec.ts" for example usages.

## echoChildProcessOutput

This function watches the outputs from the child process and forward the outputs to the current process's outputs, so that the outputs of the child process can be observed from console. Useful for writing scripts that calls child_process.spawn() & wants the output be seen.

```Typescript
function echoChildProcessOutput(
  childProcess: child_process.ChildProcessWithoutNullStreams, // child process returned from child_process.spawn()
  options: {
    parentProcess?: NodeJS.Process; // default the global 'process'
    outPrefix?: string; // prefix string before each line of output from stdout
    errPrefix?: string; // prefix string before each line from stderr
    echoStdout?: boolean; // default true
    echoStderr?: boolean; // default true
  } = {}
)
```

## promiseOutputPattern

Returns a Promise that resolves when a line of output from child process matches the given pattern. This is useful when starts a service using child_process.spawn(), and wish to wait until a line of output indicating the service is ready (like listening on an address, etc.)

If the process exits or encounter an error before the expected output, the returned Promise will reject.

```Typescript
export function promiseOutputPattern(
    process: child_process.ChildProcessWithoutNullStreams, // the child process
    pattern: string | RegExp, 
    watchStdout: boolean = true,
    watchStderr: boolean = true,
    timeoutInMs?: number, // if provided, will wait for timeout and, if not resolved, reject with an error
    killProcessIfTimeout: boolean = false // if timed out & this option is true, kill the child process before rejects
): Promise<child_process.ChildProcessWithoutNullStreams> 
```