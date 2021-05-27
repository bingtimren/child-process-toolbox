// tslint:disable:no-expression-statement
import test from 'ava';
import * as child_process from 'child_process';
import { promiseExit } from './promise-exit';

test('check normal exit', async t => {
  const child = child_process.spawn('bash', ['-c', 'echo answer 42']);
  const result = await promiseExit(child);
  t.is(result[0], 0);
  t.is(result[1], null);
});

test('check signal exit', async t => {
  const child = child_process.spawn('bash', [
    '-c',
    'sleep 100000000000000000000000000;echo answer 42'
  ]);
  setTimeout(() => {
    child.kill('SIGINT');
  }, 100);
  const result = await promiseExit(child);
  t.is(result[0], null);
  t.is(result[1], 'SIGINT');
});

test('when error should throw', async t => {
  const child = child_process.spawn('debracadebraonooi'); // error
  try {
    await promiseExit(child);
  } catch (e) {
    t.is(e instanceof Error, true);
    return t.pass();
  }
  t.fail();
});

test('check timeout without kill', async t => {
  const child = child_process.spawn('bash', ['-c', 'sleep 5;echo something']);
  const normalExitPromise = promiseExit(child);
  await t.throwsAsync(
    async () => {
      await promiseExit(child, 500, false);
    },
    null,
    'Wait timeout'
  );
  const normalExitResult = await normalExitPromise;
  t.is(normalExitResult[0], 0);
  t.is(normalExitResult[1], null);
});

test('check timeout and kill', async t => {
  const child = child_process.spawn('bash', ['-c', 'sleep 5;echo something']);
  const normalExitPromise = promiseExit(child);
  await t.throwsAsync(
    async () => {
      await promiseExit(child, 500, true);
    },
    null,
    'Wait timeout'
  );
  const normalExitResult = await normalExitPromise;
  t.is(normalExitResult[0], null);
  t.is(typeof normalExitResult[1], 'string');
});

// test('check output pattern (with timeout but in time)', async t => {
//   const child = child_process.spawn('bash', [
//     '-c',
//     'sleep 1;echo 0123ABC4567;sleep 2;echo ***DEF***'
//   ]);
//   await t.notThrowsAsync(async () => {
//     t.is(
//       '0123ABC4567',
//       await promiseOutputPattern(child, 'ABC', true, true, 2000, true)
//     );
//     // sleep 3 seconds where timeout trigger would have been fired
//     await new Promise(resolve => {
//       setTimeout(() => {
//         resolve();
//       }, 2000);
//     });
//     t.is(child.killed, false);
//     t.is('***DEF***', await promiseOutputPattern(child, 'DEF')); // still able to catch DEF output
//   });
//   t.is(child.killed, false);
// });

// test('check output pattern (timeout, only stderr)', async t => {
//   const child = child_process.spawn('bash', [
//     '-c',
//     'echo ABC;sleep 10;echo DEF'
//   ]);
//   await t.throwsAsync(
//     async () => {
//       await promiseOutputPattern(child, 'ABC', false, true, 2000, true);
//     },
//     null,
//     'Wait timeout'
//   );
// });

// test('check output pattern (timeout & kill)', async t => {
//   const child = child_process.spawn('bash', [
//     '-c',
//     'echo ABC;sleep 60;echo DEF'
//   ]);
//   await t.throwsAsync(
//     async () => {
//       await promiseOutputPattern(child, 'DEF', true, true, 10, true);
//     },
//     null,
//     'Wait timeout'
//   );
//   t.is(child.killed, true);
// });
