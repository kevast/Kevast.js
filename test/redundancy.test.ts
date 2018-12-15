import assert = require('assert');
import { Kevast } from '../src/index';
import {AStorage} from './util/AStorage';
import {SStorage} from './util/SStorage';
type Storage = AStorage | SStorage;

describe('Test redundancy', () => {
  it('Main sync redundancy sync', () => {
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    const kevast = new Kevast(new SStorage(map1), new SStorage(map2));
    kevast.set(Math.random().toString(), Math.random().toString());
    assert.deepEqual(map1, map2);
  });
  it('Main sync redundancy async', async () => {
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    const kevast = new Kevast(new SStorage(map1), new AStorage(map2));
    await kevast.set(Math.random().toString(), Math.random().toString());
    assert.deepEqual(map1, map2);
  });
  it('Main async redundancy sync', async () => {
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    const kevast = new Kevast(new AStorage(map1), new SStorage(map2));
    await kevast.set(Math.random().toString(), Math.random().toString());
    assert.deepEqual(map1, map2);
  });
  it('Main async redundancy async', async () => {
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    const kevast = new Kevast(new AStorage(map1), new AStorage(map2));
    kevast.set(Math.random().toString(), Math.random().toString());
    assert.deepEqual(map1, map2);
  });
  it('Random storage', async () => {
    const maps: Array<Map<string, string>> = [];
    const storages: Storage[] = [];
    for (let i = 0; i < 10; i++) {
      const map = new Map();
      maps.push(map);
      storages.push(Math.random() > 0.5 ? new SStorage(map) : new AStorage(map));
    }
    if (storages.every((storage) => storage instanceof SStorage)) {
      const map = new Map();
      maps.push(map);
      storages.push(new AStorage(map));
    }
    const kevast = new Kevast(storages[0], ...storages.slice(1));
    for (let i = 0; i < 10; i++) {
      kevast.set(Math.random().toString(), Math.random().toString());
    }
    for (let i = 1; i < maps.length; i++) {
      assert.deepEqual(maps[i - 1], maps[i]);
    }
  });
});
