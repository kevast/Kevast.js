import assert = require('assert');
import { Kevast } from '../src/index';
import { AsyncStorage } from './util/AsyncStorage';

describe('Test storage', () => {
  it('Initial with nothing', async () => {
    const kevast = new Kevast();
    await assertThrowsAsync(async () => {
      await kevast.set('key', 'value');
    }, 'There should be at least one storage');
    await assertThrowsAsync(async () => {
      await kevast.get('key');
    }, 'There should be at least one storage');
  });
  it('Initial with nothing but adding storage', async () => {
    const kevast = new Kevast();
    kevast.add(new AsyncStorage());
    await kevast.set('key', 'value');
    assert(await kevast.get('key') === 'value');
  });
});

/* tslint:disable: ban-types */
async function assertThrowsAsync(fn: Function, expected: string) {
  let actual: string | undefined;
  try {
    await fn();
  } catch (e) {
    actual = e.message;
  } finally {
    assert(actual === expected);
  }
}
