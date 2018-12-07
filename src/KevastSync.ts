import {IDuplexMiddleware, SimplexMiddleware} from './Middleware';
import {Pair} from './Pair';
import {ISyncStorage} from './Storage';

export class KevastSync {
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
  private master: ISyncStorage;
  private redundancies: ISyncStorage[];
  private middlewares: IDuplexMiddleware[];
  constructor(master: ISyncStorage, ...redundancies: ISyncStorage[]) {
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
  public clear() {
    this.master.clear();
    this.redundancies.forEach((storage) => storage.clear());
  }
  public has(key: string): boolean {
    if (typeof key !== 'string') { return false; }
    return this.master.has(key);
  }
  public delete(key: string) {
    if (typeof key !== 'string') { return; }
    this.master.delete(key);
    this.redundancies.forEach((storage) => storage.delete(key));
  }
  public entries(): Iterable<Pair> {
    return this.master.entries();
  }
  public get(key: string, defaultValue: string = null): string {
    if (typeof key !== 'string') { return null; }
    if (typeof defaultValue !== 'string' && defaultValue !== null) { defaultValue = null; }
    const pair: Pair = [key, null];
    const handler = this.composeMiddleware(this.middlewares, 'onGet', () => {
      pair[1] = this.master.get(pair[0]);
    });
    handler(pair);
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
  public set(key: string, value: string) {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw TypeError('Key or value must be string');
    }
    const pair: Pair = [key, value];
    const handler = this.composeMiddleware(this.middlewares, 'onSet', () => {
      this.master.set(pair[0], pair[1]);
      this.redundancies.forEach((storage) => storage.set(pair[0], pair[1]));
    });
    handler(pair);
  }
  public size(): number {
    return this.master.size();
  }
  public values(): Iterable<string> {
    return this.master.values();
  }
  private composeMiddleware(
    middlewares: IDuplexMiddleware[],
    direction: 'onGet' | 'onSet',
    final: () => void
  ): (pair: Pair) => void {
    if (direction === 'onGet') {
      middlewares = [...middlewares].reverse();
    }
    return (pair: Pair) => {
      let last = -1;
      return dispatch(0);
      function dispatch(index: number) {
        if (index <= last) {
          throw new Error('next() called multiple times');
        }
        last = index;
        if (index === middlewares.length) {
          return final();
        }
        const next: () => void  = dispatch.bind(null, index + 1);
        const middleware = middlewares[index][direction];
        middleware(pair, next);
        // If next is not called, call it
        if (index === last) {
          next();
        }
      }
    };
  }
}
