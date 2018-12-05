import {AsyncStorage} from './AsyncStorage';
import { IMiddleware } from './IMiddleware';
import {SyncStorage} from './SyncStorage';
type Pair = [string, string];
type Interceptor = (pair: Pair) => void;

export class KevastSync {
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
  private master: SyncStorage;
  private redundancies: SyncStorage[];
  private onGetInterceptors: Interceptor[];
  private onSetInterceptors: Interceptor[];
  constructor(master: SyncStorage, ...redundancies: SyncStorage[]) {
    this.master = master;
    this.redundancies = redundancies;
    if ([master, ...redundancies].some((storage) => storage instanceof AsyncStorage)) {
      throw TypeError('KevastSync only accept SyncStorage');
    }
    this.onGetInterceptors = [];
    this.onSetInterceptors = [];
  }
  public use(middleware: IMiddleware) {
    this.onGetInterceptors.unshift(middleware.onGet);
    this.onSetInterceptors.push(middleware.onSet);
    return;
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
    const result = this.master.get(key);
    if (result === null || result === undefined) {
      return defaultValue;
    } else {
      const pair: Pair = [key, result as string];
      this.onGetInterceptors.forEach((interceptor) => interceptor(pair));
      return pair[1];
    }
  }
  public keys(): IterableIterator<string> {
    return this.master.keys();
  }
  public set(key: string, value: string): void {
    const pair: Pair = [key, value];
    this.onGetInterceptors.forEach((interceptor) => interceptor(pair));
    this.master.set(...pair);
    this.redundancies.forEach((storage) => storage.set(...pair));
  }
  public size(): number {
    return this.master.size();
  }
  public values(): IterableIterator<string> {
    return this.master.values();
  }
}
