import { KevastSync } from './KevastSync';
import {IDuplexMiddleware, SimplexMiddleware} from './Middleware';
import {Pair} from './Pair';
import {Storage} from './Storage';

export class Kevast {
  public static KevastSync = KevastSync;
  public onGet = {
    use: (middleware: SimplexMiddleware) => {
      if (!middleware) { return; }
      this.use({
        onGet: middleware,
        onSet: () => {}
      });
    }
  };
  public onSet = {
    use: (middleware: SimplexMiddleware) => {
      if (!middleware) { return; }
      this.use({
        onGet: () => {},
        onSet: middleware
      });
    }
  };
  private master: Storage;
  private redundancies: Storage[];
  private middlewares: IDuplexMiddleware[];
  constructor(master: Storage, ...redundancies: Storage[]) {
    if (!master) {
      throw TypeError('Master storage is required');
    }
    this.master = master;
    this.redundancies = redundancies;
    this.middlewares = [];
  }
  public use(middleware: IDuplexMiddleware) {
    if (!middleware) { return; }
    this.middlewares.push(middleware);
  }
  public async clear(): Promise<void> {
    await Promise.all([this.master, ...this.redundancies].map((storage) => storage.clear()));
  }
  public async has(key: string): Promise<boolean> {
    if (typeof key !== 'string') { return false; }
    return this.master.has(key);
  }
  public async delete(key: string): Promise<void> {
    if (typeof key !== 'string') { return; }
    await Promise.all([this.master, ...this.redundancies].map((storage) => storage.delete(key)));
  }
  public async entries(): Promise<IterableIterator<Pair>> {
    return this.master.entries();
  }
  public async get(key: string, defaultValue: string | null = null): Promise<string | null> {
    if (typeof key !== 'string') { return null; }
    if (typeof defaultValue !== 'string' && defaultValue !== null) { defaultValue = null; }
    const pair: Pair = [key, null];
    const handler = this.composeMiddleware(this.middlewares, 'onGet', async () => {
      pair[1] = await this.master.get(pair[0]);
    });
    await handler(pair);
    const result = pair[1];
    if (typeof result === 'string') {
      return result;
    } else {
      return defaultValue;
    }
  }
  public async keys(): Promise<IterableIterator<string>> {
    return this.master.keys();
  }
  public async set(key: string, value: string): Promise<void> {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw TypeError('Key or value must be string');
    }
    const pair: Pair = [key, value];
    const handler = this.composeMiddleware(this.middlewares, 'onSet', async () => {
      await Promise.all([this.master, ...this.redundancies].map((storage) => storage.set(pair[0], pair[1])));
    });
    return handler(pair);
  }
  public async size(): Promise<number> {
    return this.master.size();
  }
  public async values(): Promise<IterableIterator<string>> {
    return this.master.values();
  }
  private composeMiddleware(
    middlewares: IDuplexMiddleware[],
    direction: 'onGet' | 'onSet',
    final: () => Promise<void>
  ): (pair: Pair) => Promise<void> {
    if (direction === 'onGet') {
      middlewares = [...middlewares].reverse();
    }
    return (pair: Pair): Promise<void> => {
      let last = -1;
      return dispatch(0);
      async function dispatch(index: number): Promise<void> {
        if (index <= last) {
          return Promise.reject(new Error('next() called multiple times'));
        }
        last = index;
        if (index === middlewares.length) {
          return final();
        }
        const next: () => Promise<void> = dispatch.bind(null, index + 1);
        const middleware = middlewares[index][direction];
        await middleware(pair, next);
        // If next is not called, call it
        if (index === last) {
          await next();
        }
      }
    };
  }
}
