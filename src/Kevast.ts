import AsyncStorage from './AsyncStorage';
import SyncStorage from './SyncStorage';
type Storage = AsyncStorage | SyncStorage;
type Pair = [string, string];

class Kevast {
  private redundancies: Storage[];
  private master: Storage;
  private mode: 'sync' | 'async';
  constructor(master: Storage, ...redundancies: Storage[]) {
    this.master = master;
    this.redundancies = redundancies;
    this.mode = 'sync';
  }
  public redundancy(storage: Storage): void {
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
  public entries(): Promise<IterableIterator<Pair>> | IterableIterator<Pair> {
    return this.master.entries();
  }
  public get(key: string, defaultValue: string): Promise<string> | string {
    return this.master.get(key, defaultValue);
  }
  public keys(): Promise<IterableIterator<string>> | IterableIterator<string> {
    return this.master.keys();
  }
  public set(key: string, value: string): Promise<void> | void {
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
}

export default Kevast;
