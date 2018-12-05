const assert = require('assert');
const {KevastAsync, KevastSync} = require('./temp/src/index');
const {AStorage} = require('./temp/test/util/AStorage');
const {SStorage} = require('./temp/test/util/SStorage');

describe('JavaScript: test Kevast mode', () => {
  it('Sync mode', () => {
    assert.doesNotThrow(() => {
      new KevastSync(new SStorage()).clear();
    });
    assert.doesNotThrow(() => {
      new KevastSync(new SStorage(), new SStorage()).clear();
    });
    assert.throws(() => {
      new KevastSync(new SStorage(), new AStorage()).clear();
    });
    assert.throws(() => {
      new KevastSync(new AStorage()).clear();
    });
    assert.throws(() => {
      new KevastSync(new AStorage(), new SStorage()).clear();
    });
    assert.throws(() => {
      new KevastSync(new AStorage(), new AStorage()).clear();
    });
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
