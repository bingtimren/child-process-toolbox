// tslint:disable:no-expression-statement
import test from 'ava';
import child_process from 'child_process';
import { echoChildProcessOutput } from './echo';

test('echo child process (expect two lines of output)', async t => {
  await t.notThrowsAsync(async ()=>{
    const child = child_process.spawn('bash',['-c','echo answer 42']);
    echoChildProcessOutput(child);
    echoChildProcessOutput(child, {outPrefix:"life, universe and everything:"});
  }) 
});
