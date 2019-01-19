import assert = require('assert');
import { Kevast } from '../src/index';
import { Pair } from '../src/Pair';
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

function basicFunction() {
  it('Get', async () => {
    await assertThrowsAsync(async () => {
      await kevast.get(1 as any as string);
    }, 'Key must be a string');
    assert(await kevast.get('key') === undefined);
  });
  it('Set', async () => {
    await assertThrowsAsync(async () => {
      await kevast.set(1 as any as string, 'value');
    }, 'Key must be string');
    await assertThrowsAsync(async () => {
      await kevast.set('key', 1 as any as string);
    }, 'Value must be string');
    await kevast.set('key', 'value');
    assert(await kevast.get('key') === 'value');
    await kevast.remove('key');
  });
  it('Bulk Set', async () => {
    await assertThrowsAsync(async () => {
      await kevast.bulkSet(1 as any as Pair[]);
    }, 'Pairs must be a array of pair');
    await kevast.bulkSet([
      {
        key: 'key1',
        value: 'value1',
      },
      {
        key: 'key2',
        value: 'value2',
      },
    ]);
    assert(await kevast.get('key1') === 'value1');
    assert(await kevast.get('key2') === 'value2');
    await kevast.bulkSet([
      {
        key: 'key1',
        value: undefined,
      },
    ]);
    assert(await kevast.get('key1') === undefined);
    assert(await kevast.get('key2') === 'value2');
    await kevast.remove('key1');
    await kevast.remove('key2');
  });
  it('Remove', async () => {
    await kevast.set('key', 'value');
    await assertThrowsAsync(async () => {
      await kevast.remove(1 as any as string);
    }, 'Key must be a string');
    await kevast.remove('key');
    assert(await kevast.get('key') === undefined);
  });
  it('Bulk Remove', async () => {
    await assertThrowsAsync(async () => {
      await kevast.bulkRemove(1 as any as string[]);
    }, 'Keys must be an array of string');
    await kevast.bulkSet([
      {
        key: 'key1',
        value: 'value1',
      },
      {
        key: 'key2',
        value: 'value2',
      },
    ]);
    assert(await kevast.get('key1') === 'value1');
    assert(await kevast.get('key2') === 'value2');
    await kevast.bulkRemove(['key1', 'key2']);
    assert(await kevast.get('key1') === undefined);
    assert(await kevast.get('key2') === undefined);
  });
  it('Clear', async () => {
    await kevast.set('key', 'value');
    await kevast.clear();
    assert(await kevast.get('key') === undefined);
  });
}

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
