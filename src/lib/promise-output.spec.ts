// tslint:disable:no-expression-statement
import test from 'ava';
import * as child_process from 'child_process';
import { promiseOutputPattern } from './promise-output';

test('check output pattern (string)', async t => {
  await t.notThrowsAsync(async () => {
    const child = child_process.spawn('bash', ['-c', 'echo answer 42']);
    await promiseOutputPattern(child, 'answer 42');
  });
});

test('check output pattern (not found till end)', async t => {
  const child = child_process.spawn('bash', ['-c', 'echo answer 42']);
  try {
    await promiseOutputPattern(child, 'answer 24');
  } catch (e) {
    t.is((e as Error).message, 'Process ended without pattern found in output');
    return t.pass();
  }
  t.fail();
});

test('check output pattern (error in process)', async t => {
  const child = child_process.spawn('debracadebraonooi'); // error
  try {
    await promiseOutputPattern(child, 'answer 24');
  } catch (e) {
    t.is((e as Error).message, 'Process error');
    return t.pass();
  }
  t.fail();
});

test('check output pattern (stderr)', async t => {
  await t.notThrowsAsync(async () => {
    const child = child_process.spawn('bash', ['-c', '>&2 echo answer 42']);
    await promiseOutputPattern(child, 'answer 42');
  });
});

test('check output pattern (pattern)', async t => {
  await t.notThrowsAsync(async () => {
    const child = child_process.spawn('bash', ['-c', 'echo THE answer 42']);
    t.is('THE answer 42', await promiseOutputPattern(child, /answer [0-9]{2}/));
  });
});

test('check output pattern (timeout)', async t => {
  const child = child_process.spawn('bash', [
    '-c',
    'echo ABC;sleep 5;echo DEF'
  ]);
  await t.throwsAsync(
    async () => {
      await promiseOutputPattern(child, 'DEF', true, true, 10);
    },
    null,
    'Wait timeout'
  );
  t.is(child.killed, false);
});

test('check output pattern (with timeout but in time)', async t => {
  const child = child_process.spawn('bash', [
    '-c',
    'sleep 1;echo 0123ABC4567;sleep 2;echo ***DEF***'
  ]);
  await t.notThrowsAsync(async () => {
    t.is(
      '0123ABC4567',
      await promiseOutputPattern(child, 'ABC', true, true, 2000, true)
    );
    // sleep 3 seconds where timeout trigger would have been fired
    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
    t.is(child.killed, false);
    t.is('***DEF***', await promiseOutputPattern(child, 'DEF')); // still able to catch DEF output
  });
  t.is(child.killed, false);
});

test('check output pattern (timeout, only stderr)', async t => {
  const child = child_process.spawn('bash', [
    '-c',
    'echo ABC;sleep 10;echo DEF'
  ]);
  await t.throwsAsync(
    async () => {
      await promiseOutputPattern(child, 'ABC', false, true, 2000, true);
    },
    null,
    'Wait timeout'
  );
});

test('check output pattern (timeout & kill)', async t => {
  const child = child_process.spawn('bash', [
    '-c',
    'echo ABC;sleep 60;echo DEF'
  ]);
  await t.throwsAsync(
    async () => {
      await promiseOutputPattern(child, 'DEF', true, true, 10, true);
    },
    null,
    'Wait timeout'
  );
  t.is(child.killed, true);
});
