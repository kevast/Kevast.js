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
  it('Get', () => {
    assert(this.kevast.get('key1') === null);
    assert(this.kevast.get('key1', 'default') === 'default');
  });
  it('Set', async () => {
    await this.kevast.set('key1', 'value1');
    assert(this.kevast.get('key1') === 'value1');
  });
  it('Has', () => {
    assert(this.kevast.has('key1') === true);
    assert(this.kevast.has('key2') === false);
  });
  it('Size', async () => {
    await this.kevast.set('key2', 'value2');
    await this.kevast.set('key3', 'value3');
    await this.kevast.set('key4', 'value4');
    assert(this.kevast.size() === 4);
  });
  it('Delete', async () => {
    assert(this.kevast.has('key4') === true);
    await this.kevast.delete('key4');
    assert(this.kevast.has('key4') === false);
  });
  it('Entries', () => {
    const source = [...this.kevast.entries()];
    const target = [['key1', 'value1'], ['key2', 'value2'], ['key3', 'value3']];
    assert.deepStrictEqual(source, target);
  });
  it('Keys', () => {
    const source = [...this.kevast.keys()];
    const target = ['key1', 'key2', 'key3'];
    assert.deepStrictEqual(source, target);
  });
  it('Values', () => {
    const source = [...this.kevast.values()];
    const target = ['value1', 'value2', 'value3'];
    assert.deepStrictEqual(source, target);
  });
  it('Clear', async () => {
    await this.kevast.clear();
    assert(this.kevast.size() === 0);
  });
}
