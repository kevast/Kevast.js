import {AsyncStorage} from './AsyncStorage';
import {GetMiddleware, IMiddleware, SetMiddleware} from './Middleware';
import {NullablePair, Pair} from './Pair';
import {SyncStorage} from './SyncStorage';
type Storage = AsyncStorage | SyncStorage;

export class KevastAsync {
  public onGet = {
    use: (middleware: GetMiddleware) => {
      this.use({
        onGet: middleware,
        onSet: () => {}
      });
    }
  };
  public onSet = {
    use: (middleware: SetMiddleware) => {
      this.use({
        onGet: () => {},
        onSet: middleware
      });
    }
  };
  private master: Storage;
  private redundancies: Storage[];
  private middlewares: IMiddleware[];
  constructor(master: Storage, ...redundancies: Storage[]) {
    this.master = master;
    this.redundancies = redundancies;
    if ([master, ...redundancies].every((storage) => storage instanceof SyncStorage)) {
      throw TypeError('All storages are SyncStorage, please use KevastSync');
    }
    this.middlewares = [];
  }
  public use(middleware: IMiddleware) {
    this.middlewares.push(middleware);
  }
  public clear(): Promise<void> {
    return Promise.all([this.master, ...this.redundancies].map((storage) => storage.clear())).then(() => {});
  }
  public has(key: string): Promise<boolean> {
    if (this.master instanceof SyncStorage) {
      return Promise.resolve(this.master.has(key));
    }
    return this.master.has(key);
  }
  public delete(key: string): Promise<void> {
    return Promise.all([this.master, ...this.redundancies].map((storage) => storage.delete(key))).then(() => {});
  }
  public entries(): Promise<IterableIterator<Pair>> {
    if (this.master instanceof SyncStorage) {
      return Promise.resolve(this.master.entries());
    }
    return this.master.entries();
  }
  public async get(key: string, defaultValue: string | null = null): Promise<string | null> {
    const pair: NullablePair = [key, null];
    const handler = this.composeMiddleware(this.middlewares, 'onGet', async () => {
      pair[1] = await this.master.get(pair[0]);
    });
    await handler(pair);
    const result = pair[1];
    if (result === null || result === undefined) {
      return defaultValue;
    } else {
      return result;
    }
  }
  public keys(): Promise<IterableIterator<string>> {
    if (this.master instanceof SyncStorage) {
      return Promise.resolve(this.master.keys());
    }
    return this.master.keys();
  }
  public set(key: string, value: string): Promise<void> {
    const pair: Pair = [key, value];
    const handler = this.composeMiddleware(this.middlewares, 'onSet', async () => {
      return Promise.all(
              [this.master, ...this.redundancies].map((storage) => storage.set(pair[0], pair[1]))
            ).then(() => {});
    });
    return handler(pair);
  }
  public size(): Promise<number> {
    if (this.master instanceof SyncStorage) {
      return Promise.resolve(this.master.size());
    }
    return this.master.size();
  }
  public values(): Promise<IterableIterator<string>> {
    if (this.master instanceof SyncStorage) {
      return Promise.resolve(this.master.values());
    }
    return this.master.values();
  }
  private composeMiddleware(middlewares: IMiddleware[],
                            direction: 'onGet' | 'onSet',
                            final: () => Promise<void>)
                            : (pair: Pair | NullablePair) => Promise<void> {
    if (direction === 'onGet') {
      middlewares = [...middlewares].reverse();
    }
    return (pair: Pair | NullablePair): Promise<void> => {
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
        const next: () => Promise<void>  = dispatch.bind(null, index + 1);
        if (direction === 'onGet') {
          const fn = middlewares[index][direction] as GetMiddleware;
          await fn(pair as NullablePair, next);
        } else {
          const fn = middlewares[index][direction] as SetMiddleware;
          await fn(pair as Pair, next);
        }
        // If next is not called, call it
        if (index === last) {
          await next();
        }
      }
    };
  }
}
