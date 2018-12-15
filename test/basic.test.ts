import assert = require('assert');
import { Kevast } from '../src/index';
import { AStorage } from './util/AStorage';
import { SStorage } from './util/SStorage';

describe('Test basic function with sync storage', () => {
  this.kevast = new Kevast(new SStorage());
  basicFunction.call(this);
});

describe('Test basic function with async storage', () => {
  this.kevast = new Kevast(new AStorage());
  basicFunction.call(this);
});

function basicFunction() {
  it('Get', async () => {
    assert(await this.kevast.get('key1') === null);
    assert(await this.kevast.get('key1', 'default') === 'default');
  });
  it('Set', async () => {
    await this.kevast.set('key1', 'value1');
    assert(await this.kevast.get('key1') === 'value1');
  });
  it('Has', async () => {
    assert(await this.kevast.has('key1') === true);
    assert(await this.kevast.has('key2') === false);
  });
  it('Size', async () => {
    await this.kevast.set('key2', 'value2');
    await this.kevast.set('key3', 'value3');
    await this.kevast.set('key4', 'value4');
    assert(await this.kevast.size() === 4);
  });
  it('Delete', async () => {
    assert(await this.kevast.has('key4') === true);
    await this.kevast.delete('key4');
    assert(await this.kevast.has('key4') === false);
  });
  it('Entries', async () => {
    const source = [...await this.kevast.entries()];
    const target = [['key1', 'value1'], ['key2', 'value2'], ['key3', 'value3']];
    assert.deepStrictEqual(source, target);
  });
  it('Keys', async () => {
    const source = [...await this.kevast.keys()];
    const target = ['key1', 'key2', 'key3'];
    assert.deepStrictEqual(source, target);
  });
  it('Values', async () => {
    const source = [...await this.kevast.values()];
    const target = ['value1', 'value2', 'value3'];
    assert.deepStrictEqual(source, target);
  });
  it('Clear', async () => {
    await this.kevast.clear();
    assert(await this.kevast.size() === 0);
  });
}
