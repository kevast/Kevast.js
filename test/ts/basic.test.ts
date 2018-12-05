import assert = require('assert');
import {KevastAsync, KevastSync} from '../../src/index';
import {AStorage} from '../util/AStorage';
import {SStorage} from '../util/SStorage';

describe('Test basic sync function', () => {
  let kevast: KevastSync;
  before(() => {
    kevast = new KevastSync(new SStorage());
  });
  it('Get', () => {
    assert(kevast.get('key1') === null);
    assert(kevast.get('key1', 'default') === 'default');
  });
  it('Set', () => {
    kevast.set('key1', 'value1');
    assert(kevast.get('key1') === 'value1');
  });
  it('Has', () => {
    assert(kevast.has('key1') === true);
    assert(kevast.has('key2') === false);
  });
  it('Size', () => {
    kevast.set('key2', 'value2');
    kevast.set('key3', 'value3');
    kevast.set('key4', 'value4');
    assert(kevast.size() === 4);
  });
  it('Delete', () => {
    assert(kevast.has('key4') === true);
    kevast.delete('key4');
    assert(kevast.has('key4') === false);
  });
  it('Entries', () => {
    const source = [...(kevast.entries() as IterableIterator<[string, string]>)];
    const target = [['key1', 'value1'], ['key2', 'value2'], ['key3', 'value3']];
    assert.deepStrictEqual(source, target);
  });
  it('Keys', () => {
    const source = [...(kevast.keys() as IterableIterator<string>)];
    const target = ['key1', 'key2', 'key3'];
    assert.deepStrictEqual(source, target);
  });
  it('Values', () => {
    const source = [...(kevast.values() as IterableIterator<string>)];
    const target = ['value1', 'value2', 'value3'];
    assert.deepStrictEqual(source, target);
  });
  it('Clear', () => {
    kevast.clear();
    assert(kevast.size() === 0);
  });
});

describe('Test basic async function', () => {
  let kevast: KevastAsync;
  before(() => {
    kevast = new KevastAsync(new AStorage());
  });
  it('Get', async () => {
    assert(await kevast.get('key1') === null);
    assert(await kevast.get('key1', 'default') === 'default');
  });
  it('Set', async () => {
    await kevast.set('key1', 'value1');
    assert(await kevast.get('key1') === 'value1');
  });
  it('Has', async () => {
    assert(await kevast.has('key1') === true);
    assert(await kevast.has('key2') === false);
  });
  it('Size', async () => {
    await kevast.set('key2', 'value2');
    await kevast.set('key3', 'value3');
    await kevast.set('key4', 'value4');
    assert(await kevast.size() === 4);
  });
  it('Delete', async () => {
    assert(await kevast.has('key4') === true);
    await kevast.delete('key4');
    assert(await kevast.has('key4') === false);
  });
  it('Entries', async () => {
    const source = [...(await kevast.entries() as IterableIterator<[string, string]>)];
    const target = [['key1', 'value1'], ['key2', 'value2'], ['key3', 'value3']];
    assert.deepStrictEqual(source, target);
  });
  it('Keys', async () => {
    const source = [...(await kevast.keys() as IterableIterator<string>)];
    const target = ['key1', 'key2', 'key3'];
    assert.deepStrictEqual(source, target);
  });
  it('Values', async () => {
    const source = [...(await kevast.values() as IterableIterator<string>)];
    const target = ['value1', 'value2', 'value3'];
    assert.deepStrictEqual(source, target);
  });
  it('Clear', async () => {
    await kevast.clear();
    assert(await kevast.size() === 0);
  });
});
