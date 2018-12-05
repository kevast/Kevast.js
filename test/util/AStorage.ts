import {AsyncStorage} from '../../src/AsyncStorage';
import {Pair} from '../../src/Pair';

export class AStorage extends AsyncStorage {
  private storage: Map<string, string>;
  public constructor(storage: Map<string, string> = new Map()) {
    super();
    this.storage = storage;
  }
  public clear(): Promise<void> {
    this.storage.clear();
    return Promise.resolve();
  }
  public has(key: string): Promise<boolean> {
    return Promise.resolve(this.storage.has(key));
  }
  public delete(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }
  public entries(): Promise<IterableIterator<Pair>> {
    return Promise.resolve(this.storage.entries());
  }
  public get(key: string): Promise<string | null | undefined> {
    return Promise.resolve(this.storage.get(key));
  }
  public keys(): Promise<IterableIterator<string>> {
    return Promise.resolve(this.storage.keys());
  }
  public set(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }
  public size(): Promise<number> {
    return Promise.resolve(this.storage.size);
  }
  public values(): Promise<IterableIterator<string>> {
    return Promise.resolve(this.storage.values());
  }
}
