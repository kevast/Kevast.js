import assert = require('assert');
import { Kevast } from '../src/index';
import { AStorage } from './util/AStorage';
import { SStorage } from './util/SStorage';

describe('Instantiation test', () => {
  let kevast: Kevast;
  it('Instantiation without parameters', async () => {
    kevast = await Kevast.create();
    assert(kevast.size() === 0);
    const map = new Map([['key', 'value']]);
    await kevast.set('key', 'value');
    assert.deepStrictEqual(kevast.entries(), map.entries());
  });
  it('Instantiation with single storage', async () => {
    kevast = await Kevast.create(new AStorage());
    assert(kevast.size() === 0);
    kevast = await Kevast.create(new SStorage());
    assert(kevast.size() === 0);
    const map = new Map([['key', 'value']]);
    kevast = await Kevast.create(new AStorage(map));
    assert.deepStrictEqual(kevast.entries(), map.entries());
    kevast = await Kevast.create(new SStorage(map));
    assert.deepStrictEqual(kevast.entries(), map.entries());
  });
  it('Instantiation with multiple empty storages', async () => {
    kevast = await Kevast.create(new SStorage(), new SStorage());
    assert(kevast.size() === 0);
    kevast = await Kevast.create(new AStorage(), new AStorage());
    assert(kevast.size() === 0);
    kevast = await Kevast.create(new SStorage(), new AStorage());
    assert(kevast.size() === 0);
  });
  it('Instantiation with multiple consistent storages', async () => {
    const map = new Map([['key', 'value']]);
    kevast = await Kevast.create(new SStorage(map), new SStorage(map));
    assert.deepStrictEqual(kevast.entries(), map.entries());
    kevast = await Kevast.create(new AStorage(map), new AStorage(map));
    assert.deepStrictEqual(kevast.entries(), map.entries());
    kevast = await Kevast.create(new SStorage(map), new AStorage(map));
    assert.deepStrictEqual(kevast.entries(), map.entries());
  });
  it('Instantiation with multiple inconsistent storages', async () => {
    const createMap = () => new Map([[Math.random().toString(), Math.random().toString()]]);
    kevast = await Kevast.create(new SStorage(createMap()), new SStorage(createMap()));
    assert(kevast.size() === 1);
    kevast = await Kevast.create(new AStorage(createMap()), new AStorage(createMap()));
    assert(kevast.size() === 1);
    kevast = await Kevast.create(new SStorage(createMap()), new AStorage(createMap()));
    assert(kevast.size() === 1);
  });
});
