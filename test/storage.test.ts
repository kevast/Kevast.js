import assert = require('assert');
import { Kevast } from '../src/index';
import { AsyncStorage } from './util/AsyncStorage';

describe('Test storage', () => {
  it('Initial with nothing', async () => {
    const kevast = new Kevast();
    await kevast.clear();
    await kevast.remove('key');
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
    await kevast.set('key1', 'value1');
    await kevast.set('key2', 'value2');
    assert(await kevast.get('key1') === 'value1');
    assert(await kevast.get('key2') === 'value2');
    await kevast.remove('key2');
    assert(await kevast.get('key1') === 'value1');
    assert(await kevast.get('key2') === undefined);
    await kevast.clear();
    assert(await kevast.get('key1') === undefined);
    assert(await kevast.get('key2') === undefined);
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
