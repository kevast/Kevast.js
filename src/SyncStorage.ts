import {Pair} from './Pair';

export abstract class SyncStorage {
  public abstract clear(): void;
  public abstract has(key: string): boolean;
  public abstract delete(key: string): void;
  public abstract entries(): IterableIterator<Pair>;
  public abstract get(key: string): string | null | undefined;
  public abstract keys(): IterableIterator<string>;
  public abstract set(key: string, value: string): void;
  public abstract size(): number;
  public abstract values(): IterableIterator<string>;
}
