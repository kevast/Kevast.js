import assert = require('assert');
import { Kevast } from '../src/index';
import { AsyncStorage } from './util/AsyncStorage';

describe('Test storage', () => {
  it('Tow storage', async () => {
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    const kevast = new Kevast(new AsyncStorage(map1), new AsyncStorage(map2));
    const r1 = Math.random().toString();
    const r2 = Math.random().toString();
    await kevast.set(r1, r2);
    assert.deepStrictEqual(map1, map2);
    assert.deepStrictEqual([...map1.entries()], [[r1, r2]]);
  });
  it('Random storages', async () => {
    const maps: Array<Map<string, string>> = [];
    const storages: AsyncStorage[] = [];
    for (let i = 0; i < 10; i++) {
      const map = new Map();
      maps.push(map);
      storages.push(Math.random() > 0.5 ? new AsyncStorage(map) : new AsyncStorage(map));
    }
    const expected = [];
    const kevast = new Kevast(...storages);
    for (let i = 0; i < 10; i++) {
      const r1 = Math.random().toString();
      const r2 = Math.random().toString();
      await kevast.set(r1, r2);
      expected.push([r1, r2]);
    }
    for (let i = 1; i < maps.length; i++) {
      assert.deepStrictEqual(maps[i - 1], maps[i]);
    }
    assert.deepStrictEqual([...maps[0].entries()], expected);
  });
  it('Initial with nothing', async () => {
    const kevast = new Kevast();
    await kevast.clear();
    await kevast.remove('key');
    await assertThrowsAsync(async () => {
      await kevast.set('key', 'value');
    }, 'There must be at least one storage');
    await assertThrowsAsync(async () => {
      await kevast.get('key');
    }, 'There must be at least one storage');
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
  it('Initial with data', async () => {
    const map = new Map([['key', 'value']]);
    const kevast = new Kevast(new AsyncStorage(map));
    assert(await kevast.get('key') === 'value');
  });

  it('Fallback getting', async () => {
    const map = new Map([['key', 'value']]);
    const s1 = new AsyncStorage();
    const s2 = new AsyncStorage(map);
    let kevast = new Kevast(s1, s2);
    assert(await kevast.get('key') === 'value');
    kevast = new Kevast(s1);
    assert(await kevast.get('key') === undefined);
  });

  it('Backward update', async () => {
    const map = new Map([['key', 'value']]);
    const s1 = new AsyncStorage();
    const s2 = new AsyncStorage(map);
    let kevast = new Kevast(s1, s2);
    kevast.config({
      backwardUpdate: true,
    });
    assert(await kevast.get('key') === 'value');
    kevast = new Kevast(s1);
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
