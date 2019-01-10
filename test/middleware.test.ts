import assert = require('assert');
import { Kevast } from '../src/index';
import { Pair } from '../src/Pair';
import { AsyncStorage } from './util/AsyncStorage';

describe('Test middleware', () => {
  it('Single onGet middleware', async () => {
    const tracer: string[] = [];
    const kevast = new Kevast(new AsyncStorage());
    kevast.afterGet.use(onGet.bind(null, tracer, '0'));
    await kevast.set('key', 'value');
    const value = await kevast.get('key');
    assert.deepEqual(tracer, ['Get:0']);
    assert(value as string === 'value0');
  });
  it('Multiple onGet middlewares', async () => {
    const tracer: string[] = [];
    const kevast = new Kevast(new AsyncStorage());
    await kevast.set('key', 'value');
    kevast.afterGet.use(onGet.bind(null, tracer, '1'));
    kevast.afterGet.use(onGet.bind(null, tracer, '2'));
    kevast.afterGet.use(onGet.bind(null, tracer, '3'));
    const value = await kevast.get('key');
    assert.deepEqual(tracer, ['Get:1', 'Get:2', 'Get:3']);
    assert(value as string === 'value123');
  });
  it('Single onSet middleware', async () => {
    const tracer: string[] = [];
    const map = new Map<string, string>();
    const kevast = new Kevast(new AsyncStorage(map));
    kevast.beforeSet.use(onSet.bind(null, tracer, '0'));
    await kevast.set('key', 'value');
    assert([...map.values()][0] === 'value0');
    const value = await kevast.get('key');
    assert(value as string === 'value0');
    assert.deepEqual(tracer, ['Set:0']);
  });
  it('Multiple onSet middlewares', async () => {
    const tracer: string[] = [];
    const map = new Map<string, string>();
    const kevast = new Kevast(new AsyncStorage(map));
    kevast.beforeSet.use(onSet.bind(null, tracer, '1'));
    kevast.beforeSet.use(onSet.bind(null, tracer, '2'));
    kevast.beforeSet.use(onSet.bind(null, tracer, '3'));
    await kevast.set('key', 'value');
    assert([...map.values()][0] === 'value123');
    const value = await kevast.get('key');
    assert(value as string === 'value123');
    assert.deepEqual(tracer, ['Set:1', 'Set:2', 'Set:3']);
  });
  it('Single Duplex middleware', async () => {
    const tracer: string[] = [];
    const map = new Map<string, string>();
    const kevast = new Kevast(new AsyncStorage(map));
    kevast.use(duplex(tracer, '0'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key');
    assert([...map.values()][0] === 'value0');
    const value = await kevast.get('key');
    assert(value as string === 'value00');
    assert.deepEqual(tracer, ['Set:0', 'Get:0']);
  });
  it('Multiple Duplex middlewares', async () => {
    const tracer: string[] = [];
    const map = new Map<string, string>();
    const kevast = new Kevast(new AsyncStorage(map));
    kevast.use(duplex(tracer, '1'));
    kevast.use(duplex(tracer, '2'));
    kevast.use(duplex(tracer, '3'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key');
    assert([...map.values()][0] === 'value123');
    const value = await kevast.get('key');
    assert(value as string === 'value123123');
    assert.deepEqual(tracer, [
      'Set:1', 'Set:2', 'Set:3',
      'Get:1', 'Get:2', 'Get:3',
    ]);
  });
});

function onGet(tracer: string[], tag: string, pair: Pair) {
  if (pair.value) {
    pair.value += tag;
  }
  tracer.push(`Get:${tag}`);
}

function onSet(tracer: string[], tag: string, pair: Pair) {
  tracer.push(`Set:${tag}`);
  pair.value += tag;
}

function duplex(tracer: string[], tag: string) {
  return {
    onGet: (pair: Pair) => {
      if (pair.value) {
        pair.value += tag;
      }
      tracer.push(`Get:${tag}`);
    },
    onSet: (pair: Pair) => {
      tracer.push(`Set:${tag}`);
      pair.value += tag;
    },
  };
}
