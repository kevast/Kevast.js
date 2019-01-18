import { DuplexMiddleware, SimplexMiddleware } from './Middleware';
import { Pair } from './Pair';
import { MutationEvent, Storage } from './Storage';

interface Options {
  backwardUpdate?: boolean;
}

export class Kevast {
  public afterGet = {
    use: (middleware: SimplexMiddleware) => {
      this.use({
        afterGet: middleware,
        beforeSet: () => {},
      });
    },
  };
  public beforeSet = {
    use: (middleware: SimplexMiddleware) => {
      this.use({
        afterGet: () => {},
        beforeSet: middleware,
      });
    },
  };
  private storages: Storage[];
  private middlewares: DuplexMiddleware[];
  private options: Options;
  public constructor(...storages: Storage[]) {
    this.storages = storages;
    this.middlewares = [];
    this.options = {
      backwardUpdate: false,
    };
  }
  public use(middleware: DuplexMiddleware): Kevast {
    this.middlewares.push(middleware);
    return this;
  }
  public add(storage: Storage): Kevast {
    this.storages.push(storage);
    return this;
  }
  public config(options: Options) {
    Object.assign(this.options, options);
  }
  public async clear(): Promise<void> {
    const event: MutationEvent = {
      clear: true,
      removed: [],
      set: [],
    };
    const promises = this.storages.map((storage) => storage.mutate(event));
    await Promise.all(promises);
  }
  public async remove(key: string): Promise<void> {
    await this.bulkRemove([key]);
  }
  public async bulkRemove(keys: string[]): Promise<void> {
    if (!(keys instanceof Array)) {
      throw new TypeError('Keys must be an array of string');
    }
    for (const key of keys) {
      if (typeof key !== 'string') {
        throw new TypeError('Key must be a string');
      }
    }
    const event: MutationEvent = {
      clear: false,
      removed: keys,
      set: [],
    };
    const promises = this.storages.map((storage) => storage.mutate(event));
    await Promise.all(promises);
  }
  public async get(key: string): Promise<string | undefined> {
    if (this.storages.length === 0) {
      throw new Error('There must be at least one storage');
    }
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string');
    }
    let value: string | undefined;
    const missStorages: Storage[] = [];
    for (const storage of this.storages) {
      value = await storage.get(key);
      if (typeof value !== 'string') {
        missStorages.push(storage);
      } else {
        break;
      }
    }
    if (this.options.backwardUpdate && typeof value === 'string') {
      const event: MutationEvent = {
        clear: false,
        removed: [],
        set: [{key, value}],
      };
      await Promise.all(missStorages.map((storage) => storage.mutate(event)));
    }
    const pair: Pair = {key, value};
    this.middlewares.forEach((middleware) => middleware.afterGet(pair));
    return pair.value;
  }
  public async set(key: string, value: string): Promise<void> {
    await this.bulkSet([{key, value}]);
  }
  public async bulkSet(pairs: Pair[]): Promise<void> {
    if (this.storages.length === 0) {
      throw new Error('There must be at least one storage');
    }
    if (!(pairs instanceof Array)) {
      throw new TypeError('Pairs must be a array of pair');
    }
    for (const pair of pairs) {
      if (typeof pair.key !== 'string' || typeof pair.value !== 'string') {
        throw TypeError('Key or value must be string');
      }
    }
    pairs = [...pairs].map((pair) => {
      this.middlewares.forEach((middleware) => middleware.beforeSet(pair));
      return pair;
    });
    const event: MutationEvent = {
      clear: false,
      removed: [],
      set: pairs,
    };
    const promises = this.storages.map((storage) => storage.mutate(event));
    await Promise.all(promises);
  }
}
