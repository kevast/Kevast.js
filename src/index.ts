import { DuplexMiddleware, SimplexMiddleware } from './Middleware';
import { Pair } from './Pair';
import { MutationEvent, Storage } from './Storage';

export class Kevast {
  public onGet = {
    use: (middleware: SimplexMiddleware) => {
      this.use({
        onGet: middleware,
        onSet: () => {},
      });
    },
  };
  public onSet = {
    use: (middleware: SimplexMiddleware) => {
      this.use({
        onGet: () => {},
        onSet: middleware,
      });
    },
  };
  private master: Storage;
  private redundancies: Storage[];
  private middlewares: DuplexMiddleware[];
  public constructor(master: Storage, redundancies?: Storage[]) {
    this.master = master;
    this.redundancies = redundancies || [];
    this.middlewares = [];
  }
  public use(middleware: DuplexMiddleware): Kevast {
    this.middlewares.push(middleware);
    return this;
  }
  public async clear(): Promise<void> {
    const event: MutationEvent = {
      clear: true,
      removed: [],
      set: [],
    };
    const promises = [this.master, ...this.redundancies].map((storage) => storage.mutate(event));
    await Promise.all(promises);
  }
  public async remove(key: string) {
    if (typeof key !== 'string') { return; }
    const event: MutationEvent = {
      clear: false,
      removed: [key],
      set: [],
    };
    const promises = [this.master, ...this.redundancies].map((storage) => storage.mutate(event));
    await Promise.all(promises);
  }
  public async get(key: string, defaultValue?: string): Promise<string | undefined> {
    if (typeof key !== 'string') {
      throw new TypeError('Key should be a string');
    }
    if (typeof defaultValue !== 'string' && defaultValue !== undefined) {
      throw new TypeError('Default value should be a string');
    }
    const value = await this.master.get(key);
    const pair: Pair = {key, value};
    this.middlewares.map((m) => m.onGet).forEach((onGet) => onGet(pair));
    if (typeof pair.value === 'string') {
      return pair.value;
    } else {
      return defaultValue;
    }
  }
  public async set(key: string, value: string): Promise<void> {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw TypeError('Key or value must be string');
    }
    const pair: Pair = {key, value};
    this.middlewares.map((m) => m.onSet).forEach((onSet) => onSet(pair));
    const event: MutationEvent = {
      clear: false,
      removed: [],
      set: [pair],
    };
    const promises = [this.master, ...this.redundancies].map((storage) => storage.mutate(event));
    await Promise.all(promises);
  }
}
