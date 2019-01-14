import { DuplexMiddleware, SimplexMiddleware } from './Middleware';
import { Pair } from './Pair';
import { MutationEvent, Storage } from './Storage';

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
  public constructor(...storages: Storage[]) {
    this.storages = storages;
    this.middlewares = [];
  }
  public use(middleware: DuplexMiddleware): Kevast {
    this.middlewares.push(middleware);
    return this;
  }
  public add(storage: Storage): Kevast {
    this.storages.push(storage);
    return this;
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
  public async get(key: string, defaultValue?: string): Promise<string | undefined> {
    if (this.storages.length === 0) {
      throw new Error('There must be at least one storage');
    }
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string');
    }
    if (typeof defaultValue !== 'string' && defaultValue !== undefined) {
      throw new TypeError('Default value must be a string');
    }
    let value: string | undefined;
    for (const storage of this.storages) {
      value = await storage.get(key);
      if (typeof value === 'string') {
        break;
      }
    }
    const pair: Pair = {key, value};
    this.middlewares.forEach((middleware) => middleware.afterGet(pair));
    if (typeof pair.value === 'string') {
      return pair.value;
    } else {
      return defaultValue;
    }
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
    pairs.map((pair) => {
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
