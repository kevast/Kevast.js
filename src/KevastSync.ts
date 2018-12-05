import {AsyncStorage} from './AsyncStorage';
import {IDuplexMiddleware, SimplexMiddleware} from './Middleware';
import {Pair} from './Pair';
import {SyncStorage} from './SyncStorage';

export class KevastSync {
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
  private master: SyncStorage;
  private redundancies: SyncStorage[];
  private middlewares: IDuplexMiddleware[];
  constructor(master: SyncStorage, ...redundancies: SyncStorage[]) {
    this.master = master;
    this.redundancies = redundancies;
    if ([master, ...redundancies].some((storage) => storage instanceof AsyncStorage)) {
      throw TypeError('KevastSync only accept SyncStorage');
    }
    this.middlewares = [];
  }
  public use(middleware: IDuplexMiddleware) {
    this.middlewares.push(middleware);
  }
  public clear(): void {
    this.master.clear();
    this.redundancies.forEach((storage) => storage.clear());
  }
  public has(key: string): boolean {
    return this.master.has(key);
  }
  public delete(key: string): void {
    this.master.delete(key);
    this.redundancies.forEach((storage) => storage.delete(key));
  }
  public entries(): IterableIterator<Pair> {
    return this.master.entries();
  }
  public get(key: string, defaultValue: string | null = null): string | null {
    const pair: Pair = [key, null];
    const handler = this.composeMiddleware(this.middlewares, 'onGet', (innerPair: Pair) => {
      pair[1] = this.master.get(key);
    });
    handler(pair);
    const result = pair[1];
    if (result === null || result === undefined) {
      return defaultValue;
    } else {
      return result;
    }
  }
  public keys(): IterableIterator<string> {
    return this.master.keys();
  }
  public set(key: string, value: string): void {
    const pair: Pair = [key, value];
    const handler = this.composeMiddleware(this.middlewares, 'onSet', (innerPair: Pair) => {
      this.master.set(pair[0], pair[1] as string);
      this.redundancies.forEach((storage) => storage.set(pair[0], pair[1] as string));
    });
    handler(pair);
  }
  public size(): number {
    return this.master.size();
  }
  public values(): IterableIterator<string> {
    return this.master.values();
  }
  private composeMiddleware(middlewares: IDuplexMiddleware[],
                            direction: 'onGet' | 'onSet',
                            final: (pair: Pair) => void): (pair: Pair) => void {
    if (direction === 'onGet') {
      middlewares = [...middlewares].reverse();
    }
    return (pair: Pair): void => {
      const index = -1;
      return dispatch(0);
      function dispatch(i: number): void {
        if (i <= index) {
          throw new Error('next() called multiple times');
        }
        if (i === middlewares.length) {
          return final(pair);
        }
        const fn = middlewares[i][direction];
        return fn(pair, dispatch.bind(null, i + 1));
      }
    };
  }
}
