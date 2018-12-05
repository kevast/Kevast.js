const assert = require('assert');
const {KevastAsync, KevastSync} = require('./temp/src/index');
const {AStorage} = require('./temp/test/util/AStorage');
const {SStorage} = require('./temp/test/util/SStorage');

describe('JavaScript: test sync mode middleware', () => {
  it('Single onGet middleware', () => {
    const tracer = [];
    const kevast = new KevastSync(new SStorage());
    kevast.set('key0', 'value');
    kevast.onGet.use(onSyncGet.bind(null, tracer, '0'));
    const value = kevast.get('key');
    assert.deepEqual(tracer, ['beforeGet:0', 'afterGet:0']);
    assert(value === 'value0');
  });
  it('Multiple onGet middlewares', () => {
    const tracer = [];
    const kevast = new KevastSync(new SStorage());
    kevast.set('key321', 'value');
    kevast.onGet.use(onSyncGet.bind(null, tracer, '1'));
    kevast.onGet.use(onSyncGet.bind(null, tracer, '2'));
    kevast.onGet.use(onSyncGet.bind(null, tracer, '3'));
    const value = kevast.get('key');
    assert.deepEqual(tracer, ['beforeGet:3', 'beforeGet:2', 'beforeGet:1', 'afterGet:1', 'afterGet:2', 'afterGet:3']);
    assert(value === 'value123');
  });
  it('Single onSet middleware', () => {
    const tracer = [];
    const map = new Map();
    const kevast = new KevastSync(new SStorage(map));
    kevast.onSet.use(onSyncSet.bind(null, tracer, '0'));
    kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key0');
    const value = kevast.get('key0');
    assert(value === 'value0');
    assert.deepEqual(tracer, ['beforeSet:0', 'afterSet:0']);
  });
  it('Multiple onSet middlewares', () => {
    const tracer = [];
    const map = new Map();
    const kevast = new KevastSync(new SStorage(map));
    kevast.onSet.use(onSyncSet.bind(null, tracer, '1'));
    kevast.onSet.use(onSyncSet.bind(null, tracer, '2'));
    kevast.onSet.use(onSyncSet.bind(null, tracer, '3'));
    kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key123');
    const value = kevast.get('key123');
    assert(value === 'value123');
    assert.deepEqual(tracer, ['beforeSet:1', 'beforeSet:2', 'beforeSet:3', 'afterSet:3', 'afterSet:2', 'afterSet:1']);
  });
  it('Single Duplex middleware', () => {
    const tracer = [];
    const map = new Map();
    const kevast = new KevastSync(new SStorage(map));
    kevast.use(syncDuplex(tracer, '0'));
    kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key');
    assert([...map.values()][0] === 'value0');
    const value = kevast.get('key');
    assert(value === 'value');
    assert.deepEqual(tracer, ['beforeSet:0', 'afterSet:0', 'beforeGet:0', 'afterGet:0']);
  });
  it('Multiple Duplex middlewares', () => {
    const tracer = [];
    const map = new Map();
    const kevast = new KevastSync(new SStorage(map));
    kevast.use(syncDuplex(tracer, '1'));
    kevast.use(syncDuplex(tracer, '2'));
    kevast.use(syncDuplex(tracer, '3'));
    kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key');
    assert([...map.values()][0] === 'value123');
    const value = kevast.get('key');
    assert(value === 'value');
    assert.deepEqual(tracer, [
      'beforeSet:1', 'beforeSet:2', 'beforeSet:3', 'afterSet:3', 'afterSet:2', 'afterSet:1',
      'beforeGet:3', 'beforeGet:2', 'beforeGet:1', 'afterGet:1', 'afterGet:2', 'afterGet:3'
    ]);
  });
  it('Never call next', () => {
    const kevast = new KevastSync(new SStorage());
    kevast.onGet.use(() => {});
    kevast.onGet.use(() => {});
    kevast.onSet.use(() => {});
    kevast.onSet.use(() => {});
    kevast.set('key', 'value');
    const value = kevast.get('key');
    assert(value === 'value');
  });
  it('Call next multiple times', () => {
    let kevast = new KevastSync(new SStorage());
    kevast.onGet.use((_, next) => {
      next();
      next();
    });
    assert.throws(() => kevast.get('key'));
    kevast = new KevastSync(new SStorage());
    kevast.onSet.use((_, next) => {
      next();
      next();
    });
    assert.throws(() => kevast.set('key', 'value'));
  });
});

describe('JavaScript: test async mode middleware', () => {
  it('Single onGet middleware', async () => {
    const tracer = [];
    const kevast = new KevastAsync(new AStorage());
    await kevast.set('key0', 'value');
    kevast.onGet.use(onAsyncGet.bind(null, tracer, '0'));
    const value = await kevast.get('key');
    assert.deepEqual(tracer, ['beforeGet:0', 'afterGet:0']);
    assert(value === 'value0');
  });
  it('Multiple onGet middlewares', async () => {
    const tracer = [];
    const kevast = new KevastAsync(new AStorage());
    await kevast.set('key321', 'value');
    kevast.onGet.use(onAsyncGet.bind(null, tracer, '1'));
    kevast.onGet.use(onAsyncGet.bind(null, tracer, '2'));
    kevast.onGet.use(onAsyncGet.bind(null, tracer, '3'));
    const value = await kevast.get('key');
    assert.deepEqual(tracer, ['beforeGet:3', 'beforeGet:2', 'beforeGet:1', 'afterGet:1', 'afterGet:2', 'afterGet:3']);
    assert(value === 'value123');
  });
  it('Single onSet middleware', async () => {
    const tracer = [];
    const map = new Map();
    const kevast = new KevastAsync(new AStorage(map));
    kevast.onSet.use(onAsyncSet.bind(null, tracer, '0'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key0');
    const value = await kevast.get('key0');
    assert(value === 'value0');
    assert.deepEqual(tracer, ['beforeSet:0', 'afterSet:0']);
  });
  it('Multiple onSet middlewares', async () => {
    const tracer = [];
    const map = new Map();
    const kevast = new KevastAsync(new AStorage(map));
    kevast.onSet.use(onSyncSet.bind(null, tracer, '1'));
    kevast.onSet.use(onSyncSet.bind(null, tracer, '2'));
    kevast.onSet.use(onSyncSet.bind(null, tracer, '3'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key123');
    const value = await kevast.get('key123');
    assert(value === 'value123');
    assert.deepEqual(tracer, ['beforeSet:1', 'beforeSet:2', 'beforeSet:3', 'afterSet:3', 'afterSet:2', 'afterSet:1']);
  });
  it('Single Duplex middleware', async () => {
    const tracer = [];
    const map = new Map();
    const kevast = new KevastAsync(new AStorage(map));
    kevast.use(asyncDuplex(tracer, '0'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key');
    assert([...map.values()][0] === 'value0');
    const value = await kevast.get('key');
    assert(value === 'value');
    assert.deepEqual(tracer, ['beforeSet:0', 'afterSet:0', 'beforeGet:0', 'afterGet:0']);
  });
  it('Multiple Duplex middlewares', async () => {
    const tracer = [];
    const map = new Map();
    const kevast = new KevastAsync(new AStorage(map));
    kevast.use(asyncDuplex(tracer, '1'));
    kevast.use(asyncDuplex(tracer, '2'));
    kevast.use(asyncDuplex(tracer, '3'));
    await kevast.set('key', 'value');
    assert([...map.keys()][0] === 'key');
    assert([...map.values()][0] === 'value123');
    const value = await kevast.get('key');
    assert(value === 'value');
    assert.deepEqual(tracer, [
      'beforeSet:1', 'beforeSet:2', 'beforeSet:3', 'afterSet:3', 'afterSet:2', 'afterSet:1',
      'beforeGet:3', 'beforeGet:2', 'beforeGet:1', 'afterGet:1', 'afterGet:2', 'afterGet:3'
    ]);
  });
  it('Never call next', async () => {
    const kevast = new KevastAsync(new AStorage());
    kevast.onGet.use(() => {});
    kevast.onGet.use(() => {});
    kevast.onSet.use(() => {});
    kevast.onSet.use(() => {});
    await kevast.set('key', 'value');
    const value = await kevast.get('key');
    assert(value === 'value');
  });
  it('Call next multiple times', async () => {
    let kevast = new KevastAsync(new AStorage());
    kevast.onGet.use(async (pair, next) => {
      await next();
      await next();
    });
    try {
      await kevast.get('key');
      assert.fail('Missing expected exception.');
    } catch (err) {
      assert(err.message === 'next() called multiple times');
    }
    kevast = new KevastAsync(new AStorage());
    kevast.onSet.use(async (pair, next) => {
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

function onSyncGet(tracer, tag, pair, next) {
  tracer.push(`beforeGet:${tag}`);
  pair[0] += tag;
  next();
  if (pair[1]) {
    pair[1] += tag;
  }
  tracer.push(`afterGet:${tag}`);
}

async function onAsyncGet(tracer, tag, pair, next) {
  tracer.push(`beforeGet:${tag}`);
  pair[0] += tag;
  await next();
  if (pair[1]) {
    pair[1] += tag;
  }
  tracer.push(`afterGet:${tag}`);
}

function onSyncSet(tracer, tag, pair, next) {
  tracer.push(`beforeSet:${tag}`);
  pair[0] += tag;
  pair[1] += tag;
  next();
  tracer.push(`afterSet:${tag}`);
}

async function onAsyncSet(tracer, tag, pair, next) {
  tracer.push(`beforeSet:${tag}`);
  pair[0] += tag;
  pair[1] += tag;
  await next();
  tracer.push(`afterSet:${tag}`);
}

function syncDuplex(tracer, tag) {
  return {
    onGet: (pair, next) => {
      tracer.push(`beforeGet:${tag}`);
      next();
      if (pair[1]) {
        pair[1] = pair[1].replace(tag, '');
      }
      tracer.push(`afterGet:${tag}`);
    },
    onSet: (pair, next) => {
      tracer.push(`beforeSet:${tag}`);
      pair[1] += tag;
      next();
      tracer.push(`afterSet:${tag}`);
    }
  };
}

function asyncDuplex(tracer, tag) {
  return {
    onGet: async (pair, next) => {
      tracer.push(`beforeGet:${tag}`);
      await next();
      if (pair[1]) {
        pair[1] = pair[1].replace(tag, '');
      }
      tracer.push(`afterGet:${tag}`);
    },
    onSet: async (pair, next) => {
      tracer.push(`beforeSet:${tag}`);
      pair[1] += tag;
      await next();
      tracer.push(`afterSet:${tag}`);
    }
  };
}
