import {AsyncStorage} from './AsyncStorage';
import {GetMiddleware, IMiddleware, SetMiddleware} from './Middleware';
import {NullablePair, Pair} from './Pair';
import {SyncStorage} from './SyncStorage';

export class KevastSync {
  public onGet = {
    use: (middleware: GetMiddleware) => {
      this.use({
        onGet: middleware,
        onSet: (_: Pair) => {}
      });
    }
  };
  public onSet = {
    use: (middleware: SetMiddleware) => {
      this.use({
        onGet: (_: NullablePair) => {},
        onSet: middleware
      });
    }
  };
  private master: SyncStorage;
  private redundancies: SyncStorage[];
  private middlewares: IMiddleware[];
  constructor(master: SyncStorage, ...redundancies: SyncStorage[]) {
    this.master = master;
    this.redundancies = redundancies;
    if ([master, ...redundancies].some((storage) => storage instanceof AsyncStorage)) {
      throw TypeError('KevastSync only accept SyncStorage');
    }
    this.middlewares = [];
  }
  public use(middleware: IMiddleware) {
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
    const pair: NullablePair = [key, null];
    const handler = this.composeMiddleware(this.middlewares, 'onGet', (innerPair: Pair | NullablePair) => {
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
    const handler = this.composeMiddleware(this.middlewares, 'onSet', (innerPair: Pair | NullablePair) => {
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
  private composeMiddleware(middlewares: IMiddleware[],
                            direction: 'onGet' | 'onSet',
                            final: (pair: Pair | NullablePair) => void): (pair: Pair | NullablePair) => void {
    if (direction === 'onGet') {
      middlewares = [...middlewares].reverse();
    }
    return (pair: Pair | NullablePair): void => {
      const index = -1;
      return dispatch(0);
      function dispatch(i: number): void {
        if (i <= index) {
          throw new Error('next() called multiple times');
        }
        if (i === middlewares.length) {
          return final(pair);
        }
        if (direction === 'onGet') {
          const fn = middlewares[i][direction] as GetMiddleware;
          return fn(pair as NullablePair, dispatch.bind(null, i + 1));
        } else {
          const fn = middlewares[i][direction] as SetMiddleware;
          return fn(pair as Pair, dispatch.bind(null, i + 1));
        }
      }
    };
  }
}
