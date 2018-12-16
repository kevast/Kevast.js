import * as assert from 'assert';
import { GetMiddleware, IMiddleware, SetMiddleware } from './Middleware';
import { Pair } from './Pair';
import { IMutationEvent, IStorage } from './Storage';

export class Kevast {
  public static async create(...storages: IStorage[]): Promise<Kevast> {
    let inits: Array<Map<string, string>> = [];
    if (storages.length > 0) {
      inits = await Promise.all(storages.map((storage) => storage.current()));
      if (storages.length > 1) {
        for (let i = 1; i < inits.length; i++) {
          assert.deepStrictEqual(inits[i - 1], inits[i], 'Fail to create instance: inconsistent storage content');
        }
      }
    }
    const instance = new Kevast();
    instance.master = new Map<string, string>(inits[0]);
    instance.storages = storages;
    instance.middlewares = [];
    instance.composedGet = instance.composeGetMiddlewares();
    instance.composedSet = instance.composeSetMiddlewares();
    return instance;
  }
  public onGet = {
    use: (middleware: GetMiddleware) => {
      if (!middleware) { return; }
      this.use({
        onGet: middleware,
        onSet: () => Promise.resolve(),
      });
    },
  };
  public onSet = {
    use: (middleware: SetMiddleware) => {
      if (!middleware) { return; }
      this.use({
        onGet: () => {},
        onSet: middleware,
      });
    },
  };
  private master: Map<string, string>;
  private storages: IStorage[];
  private middlewares: IMiddleware[];
  private composedGet: (pair: Pair) => void;
  private composedSet: (pair: Pair) => Promise<void>;
  private constructor() {}
  public use(middleware: IMiddleware): Kevast {
    if (!middleware) { return this; }
    this.middlewares.push(middleware);
    this.composedGet = this.composeGetMiddlewares();
    this.composedSet = this.composeSetMiddlewares();
    return this;
  }
  public async clear() {
    const removed: Pair[] = [...this.master.entries()];
    this.master.clear();
    if (this.storages.length === 0) { return; }
    const event: IMutationEvent = {
      added: [],
      changed: [],
      current: Object.assign({}, this.master),
      removed,
    };
    await Promise.all(this.storages.map((storage) => storage.mutate(event)));
  }
  public has(key: string): boolean {
    if (typeof key !== 'string') { return false; }
    return this.master.has(key);
  }
  public async delete(key: string) {
    if (typeof key !== 'string') { return; }
    if (!this.master.has(key)) { return; }
    const removed: Pair[] = [[key, this.master.get(key)]];
    this.master.delete(key);
    if (this.storages.length === 0) { return; }
    const event: IMutationEvent = {
      added: [],
      changed: [],
      current: Object.assign({}, this.master),
      removed,
    };
    await Promise.all(this.storages.map((storage) => storage.mutate(event)));
  }
  public entries(): Iterable<Pair> {
    return this.master.entries();
  }
  public get(key: string, defaultValue: string = null): string {
    if (typeof key !== 'string') {
      throw new TypeError('Key should be a string');
    }
    if (typeof defaultValue !== 'string' && defaultValue !== null) {
      throw new TypeError('Default value should be a string');
    }
    const pair: Pair = [key, null];
    this.composedGet(pair);
    const result = pair[1];
    if (typeof result === 'string') {
      return result;
    } else {
      return defaultValue;
    }
  }
  public keys(): Iterable<string> {
    return this.master.keys();
  }
  public async set(key: string, value: string) {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw TypeError('Key or value must be string');
    }
    const pair: Pair = [key, value];
    await this.composedSet(pair);
  }
  public size(): number {
    return this.master.size;
  }
  public values(): Iterable<string> {
    return this.master.values();
  }
  private _get(pair: Pair) {
    pair[1] = this.master.get(pair[0]);
  }
  private async _set(pair: Pair) {
    this.master.set(pair[0], pair[1]);
    if (this.storages.length === 0) { return; }
    const event: IMutationEvent = {
      added: [pair],
      changed: [],
      current: Object.assign({}, this.master),
      removed: [],
    };
    await Promise.all(this.storages.map((storage) => storage.mutate(event)));
  }
  private composeGetMiddlewares(): (pair: Pair) => void {
    const middlewares = [...this.middlewares].reverse();
    return (pair: Pair) => {
      let last = -1;
      const dispatch = (index: number) => {
        if (index <= last) {
          throw new Error('next() called multiple times');
        }
        last = index;
        if (index === middlewares.length) {
          return this._get(pair);
        }
        const next: () => Promise<void> = dispatch.bind(null, index + 1);
        const middleware = middlewares[index].onGet.bind(middlewares[index]);
        middleware(pair, next);
        // If next is not called, call it
        if (index === last) {
          next();
        }
      };
      return dispatch(0);
    };
  }
  private composeSetMiddlewares(): (pair: Pair) => Promise<void> {
    const middlewares = this.middlewares;
    return async (pair: Pair) => {
      let last = -1;
      const dispatch = async (index: number) => {
        if (index <= last) {
          return Promise.reject(new Error('next() called multiple times'));
        }
        last = index;
        if (index === middlewares.length) {
          return this._set(pair);
        }
        const next: () => Promise<void> = dispatch.bind(null, index + 1);
        const middleware = middlewares[index].onSet.bind(middlewares[index]);
        await middleware(pair, next);
        // If next is not called, call it
        if (index === last) {
          await next();
        }
      };
      return dispatch(0);
    };
  }
}
