import {Pair} from '../../src/Pair';
import {ISyncStorage} from '../../src/Storage';

export class SStorage implements ISyncStorage {
  private storage: Map<string, string>;
  public constructor(storage: Map<string, string> = new Map()) {
    this.storage = storage;
  }
  public clear(): void {
    this.storage.clear();
  }
  public has(key: string): boolean {
    return this.storage.has(key);
  }
  public delete(key: string): void {
    this.storage.delete(key);
  }
  public entries(): IterableIterator<Pair> {
    return this.storage.entries();
  }
  public get(key: string): string | null | undefined {
    return this.storage.get(key);
  }
  public keys(): IterableIterator<string> {
    return this.storage.keys();
  }
  public set(key: string, value: string): void {
    this.storage.set(key, value);
  }
  public size(): number {
    return this.storage.size;
  }
  public values(): IterableIterator<string> {
    return this.storage.values();
  }
}
