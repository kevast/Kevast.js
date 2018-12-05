const assert = require('assert');
const {KevastAsync, KevastSync} = require('./temp/src/index');
const {AStorage} = require('./temp/test/util/AStorage');
const {SStorage} = require('./temp/test/util/SStorage');

describe('JavaScript: test redundancy', () => {
  it('Main sync redundancy sync', () => {
    const map1 = new Map();
    const map2 = new Map();
    const kevast = new KevastSync(new SStorage(map1), new SStorage(map2));
    kevast.set(Math.random().toString(), Math.random().toString());
    assert.deepEqual(map1, map2);
  });
  it('Main sync redundancy async', async () => {
    const map1 = new Map();
    const map2 = new Map();
    const kevast = new KevastAsync(new SStorage(map1), new AStorage(map2));
    await kevast.set(Math.random().toString(), Math.random().toString());
    assert.deepEqual(map1, map2);
  });
  it('Main async redundancy sync', async () => {
    const map1 = new Map();
    const map2 = new Map();
    const kevast = new KevastAsync(new AStorage(map1), new SStorage(map2));
    await kevast.set(Math.random().toString(), Math.random().toString());
    assert.deepEqual(map1, map2);
  });
  it('Main async redundancy async', async () => {
    const map1 = new Map();
    const map2 = new Map();
    const kevast = new KevastAsync(new AStorage(map1), new AStorage(map2));
    kevast.set(Math.random().toString(), Math.random().toString());
    assert.deepEqual(map1, map2);
  });
  it('Random storage', async () => {
    const maps = [];
    const storages = [];
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
    const kevast = new KevastAsync(storages[0], ...storages.slice(1));
    for (let i = 0; i < 10; i++) {
      kevast.set(Math.random().toString(), Math.random().toString());
    }
    for (let i = 1; i < maps.length; i++) {
      assert.deepEqual(maps[i - 1], maps[i]);
    }
  });
});
