import AsyncStorage from './AsyncStorage';
import IPair from './IPair';
import SyncStorage from './SyncStorage';
type Storage = AsyncStorage | SyncStorage;
type Interceptor = (pair: IPair) => void;

interface IMiddleware {
  onGet: Interceptor;
  onSet: Interceptor;
}

class Kevast {
  public onGet = {
    use: (interceptor: Interceptor) => {
      this.use({
        onGet: interceptor,
        onSet: (pair: IPair) => { return; }
      });
    }
  };
  public onSet = {
    use: (interceptor: Interceptor) => {
      this.use({
        onGet: (pair: IPair) => { return; },
        onSet: interceptor
      });
    }
  };
  private mode: 'sync' | 'async';
  private master: Storage;
  private redundancies: Storage[];
  private onGetInterceptors: Interceptor[];
  private onSetInterceptors: Interceptor[];
  constructor(master: Storage, ...redundancies: Storage[]) {
    this.master = master;
    this.redundancies = redundancies;
    this.mode = master instanceof SyncStorage ? 'sync' : 'async';
    this.onGetInterceptors = [];
    this.onSetInterceptors = [];
  }
  public use(middleware: IMiddleware) {
    this.onGetInterceptors.unshift(middleware.onGet);
    this.onSetInterceptors.push(middleware.onSet);
    return;
  }
  public redundancy(storage: Storage) {
    this.redundancies.push(storage);
    if (storage instanceof AsyncStorage) {
      this.mode = 'async';
    }
  }
  public getMode(): string {
    return this.mode;
  }
  public clear(): Promise<void> | void {
    if (this.mode === 'sync') {
      this.master.clear();
      this.redundancies.forEach((storage) => storage.clear());
    } else {
      return Promise.all([this.master, ...this.redundancies].map((storage) => storage.clear())).then(() => {
        return;
      });
    }
  }
  public contains(key: string): Promise<boolean> | boolean {
    return this.master.contains(key);
  }
  public delete(key: string): Promise<void> | void {
    if (this.mode === 'sync') {
      this.master.delete(key);
      this.redundancies.forEach((storage) => storage.delete(key));
    } else {
      return Promise.all([this.master, ...this.redundancies].map((storage) => storage.delete(key))).then(() => {
        return;
      });
    }
  }
  public entries(): Promise<IterableIterator<IPair>> | IterableIterator<IPair> {
    return this.master.entries();
  }
  public get(key: string, defaultValue: string | null = null): Promise<string | null> | (string | null) {
    let result = this.master.get(key);
    if (this.mode === 'sync') {
      result = result as string | null;
      return this.processValue(key, result, defaultValue);
    } else {
      result = result as Promise<string | null>;
      return result.then((value) => {
        return this.processValue(key, value, defaultValue);
      });
    }
  }
  public keys(): Promise<IterableIterator<string>> | IterableIterator<string> {
    return this.master.keys();
  }
  public set(key: string, value: string): Promise<void> | void {
    const pair: IPair = {key, value};
    this.onGetInterceptors.forEach((interceptor) => interceptor(pair));
    if (this.mode === 'sync') {
      this.master.set(key, value);
      this.redundancies.forEach((storage) => storage.delete(key));
    } else {
      return Promise.all([this.master, ...this.redundancies].map((storage) => storage.set(key, value))).then(() => {
        return;
      });
    }
  }
  public values(): Promise<IterableIterator<string>> | IterableIterator<string> {
    return this.master.values();
  }
  private processValue(key: string, value: string | null, defaultValue: string | null): string | null {
    if (value === null) {
      return defaultValue;
    } else {
      const pair: IPair = {
        key,
        value: value as string
      };
      this.onGetInterceptors.forEach((interceptor) => interceptor(pair));
      return pair.value;
    }
  }
}

export default Kevast;
