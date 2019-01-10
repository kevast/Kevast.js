import assert = require('assert');
import { Kevast } from '../src/index';
import { AsyncStorage } from './util/AsyncStorage';
import { SyncStorage } from './util/SyncStorage';
type Storage = AsyncStorage | SyncStorage;

describe('Test storage', () => {
  it('Tow sync storage', async () => {
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    const kevast = new Kevast(new SyncStorage(map1), [new SyncStorage(map2)]);
    const r1 = Math.random().toString();
    const r2 = Math.random().toString();
    await kevast.set(r1, r2);
    assert.deepStrictEqual(map1, map2);
    assert.deepStrictEqual([...map1.entries()], [[r1, r2]]);
  });
  it('One sync, one async', async () => {
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    const kevast = new Kevast(new SyncStorage(map1), [new AsyncStorage(map2)]);
    const r1 = Math.random().toString();
    const r2 = Math.random().toString();
    await kevast.set(r1, r2);
    assert.deepStrictEqual(map1, map2);
    assert.deepStrictEqual([...map1.entries()], [[r1, r2]]);
  });
  it('One async, one sync', async () => {
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    const kevast = new Kevast(new AsyncStorage(map1), [new SyncStorage(map2)]);
    const r1 = Math.random().toString();
    const r2 = Math.random().toString();
    await kevast.set(r1, r2);
    assert.deepStrictEqual(map1, map2);
    assert.deepStrictEqual([...map1.entries()], [[r1, r2]]);
  });
  it('Tow async storage', async () => {
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    const kevast = new Kevast(new AsyncStorage(map1), [new AsyncStorage(map2)]);
    const r1 = Math.random().toString();
    const r2 = Math.random().toString();
    await kevast.set(r1, r2);
    assert.deepStrictEqual(map1, map2);
    assert.deepStrictEqual([...map1.entries()], [[r1, r2]]);
  });
  it('Random storage', async () => {
    const maps: Array<Map<string, string>> = [];
    const storages: Storage[] = [];
    for (let i = 0; i < 10; i++) {
      const map = new Map();
      maps.push(map);
      storages.push(Math.random() > 0.5 ? new SyncStorage(map) : new AsyncStorage(map));
    }
    const expected = [];
    const kevast = new Kevast(storages[0], storages.slice(1));
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
});
