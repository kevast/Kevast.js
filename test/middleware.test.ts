import assert = require('assert');
import { Kevast } from '../src/index';
import { AStorage } from './util/AStorage';

describe('Test middleware', () => {
  it('Single onGet middleware', async () => {
    const tracer: string[] = [];
    const kevast = await Kevast.create(new AStorage());
    await kevast.set('key0', 'value');
    kevast.onGet.use(onGet.bind(null, tracer, '0'));
    const value = kevast.get('key');
    assert.deepEqual(tracer, ['beforeGet:0', 'afterGet:0']);
    assert(value === 'value0');
  });
  it('Multiple onGet middlewares', async () => {
    const tracer: string[] = [];
    const kevast = await Kevast.create(new AStorage());
    await kevast.set('key321', 'value');
    kevast.onGet.use(onGet.bind(null, tracer, '1'));
    kevast.onGet.use(onGet.bind(null, tracer, '2'));
    kevast.onGet.use(onGet.bind(null, tracer, '3'));
    const value = kevast.get('key');
    assert.deepEqual(tracer, ['beforeGet:3', 'beforeGet:2', 'beforeGet:1', 'afterGet:1', 'afterGet:2', 'afterGet:3']);
    assert(value === 'value123');
  });
  it('Single onSet middleware', async () => {
    const tracer: string[] = [];
    const map = new Map<string, string>();
    const kevast = await Kevast.create(new AStorage(map));
    kevast.onSet.use(onSet.bind(null, tracer, '0'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key0');
    const value = kevast.get('key0');
    assert(value === 'value0');
    assert.deepEqual(tracer, ['beforeSet:0', 'afterSet:0']);
  });
  it('Multiple onSet middlewares', async () => {
    const tracer: string[] = [];
    const map = new Map<string, string>();
    const kevast = await Kevast.create(new AStorage(map));
    kevast.onSet.use(onSet.bind(null, tracer, '1'));
    kevast.onSet.use(onSet.bind(null, tracer, '2'));
    kevast.onSet.use(onSet.bind(null, tracer, '3'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key123');
    const value = kevast.get('key123');
    assert(value === 'value123');
    assert.deepEqual(tracer, ['beforeSet:1', 'beforeSet:2', 'beforeSet:3', 'afterSet:3', 'afterSet:2', 'afterSet:1']);
  });
  it('Single Duplex middleware', async () => {
    const tracer: string[] = [];
    const map = new Map<string, string>();
    const kevast = await Kevast.create(new AStorage(map));
    kevast.use(asyncDuplex(tracer, '0'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key');
    assert([...map.values()][0] === 'value0');
    const value = kevast.get('key');
    assert(value === 'value');
    assert.deepEqual(tracer, ['beforeSet:0', 'afterSet:0', 'beforeGet:0', 'afterGet:0']);
  });
  it('Multiple Duplex middlewares', async () => {
    const tracer: string[] = [];
    const map = new Map<string, string>();
    const kevast = await Kevast.create(new AStorage(map));
    kevast.use(asyncDuplex(tracer, '1'));
    kevast.use(asyncDuplex(tracer, '2'));
    kevast.use(asyncDuplex(tracer, '3'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key');
    assert([...map.values()][0] === 'value123');
    const value = kevast.get('key');
    assert(value === 'value');
    assert.deepEqual(tracer, [
      'beforeSet:1', 'beforeSet:2', 'beforeSet:3', 'afterSet:3', 'afterSet:2', 'afterSet:1',
      'beforeGet:3', 'beforeGet:2', 'beforeGet:1', 'afterGet:1', 'afterGet:2', 'afterGet:3',
    ]);
  });
  it('Never call next', async () => {
    const kevast = await Kevast.create(new AStorage());
    kevast.onGet.use(() => {});
    kevast.onGet.use(() => {});
    kevast.onSet.use(async () => {});
    kevast.onSet.use(async () => {});
    await kevast.set('key', 'value');
    const value = kevast.get('key');
    assert(value === 'value');
  });
  it('Call next multiple times', async () => {
    let kevast = await Kevast.create(new AStorage());
    kevast.onGet.use((_: [string, string], next: () => void) => {
      next();
      next();
    });
    try {
      kevast.get('key');
      assert.fail('Missing expected exception.');
    } catch (err) {
      assert(err.message === 'next() called multiple times');
    }
    kevast = await Kevast.create(new AStorage());
    kevast.onSet.use(async (_: [string, string], next: () => Promise<void>) => {
      await next();
      await next();
    });
    try {
      await kevast.set('key', 'value');
      assert.fail('Missing expected exception.');
    } catch (err) {
      assert(err.message === 'next() called multiple times');
    }
  });
});

function onGet(tracer: string[], tag: string, pair: [string, string], next: () => void) {
  tracer.push(`beforeGet:${tag}`);
  pair[0] += tag;
  next();
  if (pair[1]) {
    pair[1] += tag;
  }
  tracer.push(`afterGet:${tag}`);
}

async function onSet(tracer: string[], tag: string, pair: [string, string], next: () => Promise<void>) {
  tracer.push(`beforeSet:${tag}`);
  pair[0] += tag;
  pair[1] += tag;
  await next();
  tracer.push(`afterSet:${tag}`);
}

function asyncDuplex(tracer: string[], tag: string) {
  return {
    onGet: (pair: [string, string], next: () => void) => {
      tracer.push(`beforeGet:${tag}`);
      next();
      if (pair[1]) {
        pair[1] = pair[1].replace(tag, '');
      }
      tracer.push(`afterGet:${tag}`);
    },
    onSet: async (pair: [string, string], next: () => Promise<void>) => {
      tracer.push(`beforeSet:${tag}`);
      pair[1] += tag;
      await next();
      tracer.push(`afterSet:${tag}`);
    },
  };
}
