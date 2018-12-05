import {AsyncStorage} from './AsyncStorage';
import {IMiddleware} from './IMiddleware';
import {SyncStorage} from './SyncStorage';
type Pair = [string, string];
type Interceptor = (pair: Pair) => void;

export class KevastAsync {
  public onGet = {
    use: (interceptor: Interceptor) => {
      this.use({
        onGet: interceptor,
        onSet: (_: Pair) => { return; }
      });
    }
  };
  public onSet = {
    use: (interceptor: Interceptor) => {
      this.use({
        onGet: (_: Pair) => { return; },
        onSet: interceptor
      });
    }
  };
  private master: AsyncStorage;
  private redundancies: AsyncStorage[];
  private onGetInterceptors: Interceptor[];
  private onSetInterceptors: Interceptor[];
  constructor(master: AsyncStorage, ...redundancies: AsyncStorage[]) {
    this.master = master;
    this.redundancies = redundancies;
    if ([master, ...redundancies].every((storage) => storage instanceof SyncStorage)) {
      throw TypeError('All storages are SyncStorage, please use KevastSync');
    }
    this.onGetInterceptors = [];
    this.onSetInterceptors = [];
  }
  public use(middleware: IMiddleware) {
    this.onGetInterceptors.unshift(middleware.onGet);
    this.onSetInterceptors.push(middleware.onSet);
    return;
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
    return this.master.get(key).then((value) => {
      if (value === null || value === undefined) {
        return defaultValue;
      } else {
        const pair: Pair = [key, value as string];
        this.onGetInterceptors.forEach((interceptor) => interceptor(pair));
        return pair[1];
      }
    });
  }
  public keys(): Promise<IterableIterator<string>> {
    return this.master.keys();
  }
  public set(key: string, value: string): Promise<void> {
    const pair: Pair = [key, value];
    this.onGetInterceptors.forEach((interceptor) => interceptor(pair));
    return Promise.all([this.master, ...this.redundancies].map((storage) => storage.set(...pair))).then(() => {});
  }
  public size(): Promise<number> {
    return this.master.size();
  }
  public values(): Promise<IterableIterator<string>> {
    return this.master.values();
  }
}
