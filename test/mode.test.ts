import assert = require('assert');
import {KevastAsync, KevastSync} from '../src/index';
import {AStorage} from './util/AStorage';
import {SStorage} from './util/SStorage';

describe('Test kevast mode', () => {
  it('Sync mode', () => {
    // In TypeScript， you can be sure that a KevastSync will not accept any AsyncStorage.
  });
  it('Async mode', () => {
    assert.doesNotThrow(() => {
      new KevastAsync(new AStorage()).clear();
    });
    assert.doesNotThrow(() => {
      new KevastAsync(new AStorage(), new AStorage()).clear();
    });
    assert.doesNotThrow(() => {
      new KevastAsync(new AStorage(), new SStorage()).clear();
    });
    assert.doesNotThrow(() => {
      new KevastAsync(new SStorage(), new AStorage()).clear();
    });
    assert.throws(() => {
      new KevastAsync(new SStorage()).clear();
    });
    assert.throws(() => {
      new KevastAsync(new SStorage(), new SStorage()).clear();
    });
  });
});
