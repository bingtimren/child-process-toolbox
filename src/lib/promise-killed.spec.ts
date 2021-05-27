// tslint:disable:no-expression-statement
import test from 'ava';
import * as child_process from 'child_process';
import { promiseKilled } from './promise-killed';
test('promise killed', async t => {
  await t.notThrowsAsync(async () => {
    const child = child_process.spawn('bash', [
      '-c',
      'echo THE answer is...;sleep 1000000000000000;echo 42'
    ]);
    const signal = await promiseKilled(child);
    t.is(signal, 'SIGTERM');
    t.is(child.killed, true);
  });
});

test('promise-kill when error should throw', async t => {
  const child = child_process.spawn('debracadebraonooi'); // error
  try {
    await promiseKilled(child);
  } catch (e) {
    t.is(e instanceof Error, true);
    return t.pass();
  }
  t.fail();
});
