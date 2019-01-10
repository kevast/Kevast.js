import assert = require('assert');
import { Kevast } from '../src/index';
import { AsyncStorage } from './util/AsyncStorage';
import { SyncStorage } from './util/SyncStorage';
let kevast: Kevast;

describe('Test basic function with sync storage', () => {
  before(() => {
    kevast = new Kevast(new SyncStorage());
  });
  basicFunction();
});

describe('Test basic function with async storage', () => {
  before(() => {
    kevast = new Kevast(new AsyncStorage());
  });
  basicFunction();
});

describe('Test instantiation', () => {
  it('Initial with data', async () => {
    const map = new Map([['key', 'value']]);
    kevast = new Kevast(new AsyncStorage(map));
    assert(await kevast.get('key') === 'value');
    kevast = new Kevast(new SyncStorage(map));
    assert(await kevast.get('key') === 'value');
  });
});

function basicFunction() {
  it('Get', async () => {
    try {
      await kevast.get(1 as any as string);
    } catch (err) {
      assert(err.message === 'Key should be a string');
    }
    try {
      await kevast.get('key', 1 as any as string);
    } catch (err) {
      assert(err.message === 'Default value should be a string');
    }
    assert(await kevast.get('key') === undefined);
    assert(await kevast.get('key', 'default') === 'default');
  });
  it('Set', async () => {
    try {
      await kevast.set(1 as any as string, 'value');
    } catch (err) {
      assert(err.message === 'Key or value must be string');
    }
    try {
      await kevast.set('key', 1 as any as string);
    } catch (err) {
      assert(err.message === 'Key or value must be string');
    }
    await kevast.set('key', 'value');
    assert(await kevast.get('key') === 'value');
  });
  it('Remove', async () => {
    // nothing should happen
    await kevast.remove(1 as any as string);
    await kevast.remove('key');
    assert(await kevast.get('key') === undefined);
  });
  it('Clear', async () => {
    await kevast.set('key', 'value');
    await kevast.clear();
    assert(await kevast.get('key') === undefined);
  });
}
