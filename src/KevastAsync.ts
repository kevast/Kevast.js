import {AsyncStorage} from './AsyncStorage';
import {IDuplexMiddleware, SimplexMiddleware} from './Middleware';
import {Pair} from './Pair';
import {SyncStorage} from './SyncStorage';

export class KevastAsync {
  public onGet = {
    use: (middleware: SimplexMiddleware) => {
      this.use({
        onGet: middleware,
        onSet: (_: Pair) => { return; }
      });
    }
  };
  public onSet = {
    use: (middleware: SimplexMiddleware) => {
      this.use({
        onGet: (_: Pair) => { return; },
        onSet: middleware
      });
    }
  };
  private master: AsyncStorage;
  private redundancies: AsyncStorage[];
  private middlewares: IDuplexMiddleware[];
  constructor(master: AsyncStorage, ...redundancies: AsyncStorage[]) {
    this.master = master;
    this.redundancies = redundancies;
    if ([master, ...redundancies].every((storage) => storage instanceof SyncStorage)) {
      throw TypeError('All storages are SyncStorage, please use KevastSync');
    }
    this.middlewares = [];
  }
  public use(middleware: IDuplexMiddleware) {
    this.middlewares.push(middleware);
  }
  public clear(): Promise<void> {
    return Promise.all([this.master, ...this.redundancies].map((storage) => storage.clear())).then(() => {});
  }
  public has(key: string): Promise<boolean> {
    return this.master.has(key);
  }
  public delete(key: string): Promise<void> {
    return Promise.all([this.master, ...this.redundancies].map((storage) => storage.delete(key))).then(() => {});
  }
  public entries(): Promise<IterableIterator<Pair>> {
    return this.master.entries();
  }
  public get(key: string, defaultValue: string | null = null): Promise<string | null> {
    const pair: Pair = [key, null];
    const handler = this.composeMiddleware(this.middlewares, 'onGet', async (innerPair: Pair) => {
      pair[1] = await this.master.get(key);
    });
    return handler(pair).then(() => {
      const result = pair[1];
      if (result === null || result === undefined) {
        return defaultValue;
      } else {
        return result;
      }
    });
  }
  public keys(): Promise<IterableIterator<string>> {
    return this.master.keys();
  }
  public set(key: string, value: string): Promise<void> {
    const pair: Pair = [key, value];
    const handler = this.composeMiddleware(this.middlewares, 'onSet', async (innerPair: Pair) => {
      return Promise.all(
              [this.master, ...this.redundancies].map((storage) => storage.set(pair[0], pair[1] as string))
            ).then(() => {});
    });
    return handler(pair);
  }
  public size(): Promise<number> {
    return this.master.size();
  }
  public values(): Promise<IterableIterator<string>> {
    return this.master.values();
  }
  private composeMiddleware(middlewares: IDuplexMiddleware[],
                            direction: 'onGet' | 'onSet',
                            final: (pair: Pair) => Promise<void>): (pair: Pair) => Promise<void> {
    if (direction === 'onGet') {
      middlewares = [...middlewares].reverse();
    }
    return (pair: Pair): Promise<void> => {
      const index = -1;
      return dispatch(0);
      function dispatch(i: number): Promise<void> {
        if (i <= index) {
          return Promise.reject(new Error('next() called multiple times'));
        }
        if (i === middlewares.length) {
          return final(pair);
        }
        const fn = middlewares[i][direction];
        return Promise.resolve(fn(pair, dispatch.bind(null, i + 1)));
      }
    };
  }
}
