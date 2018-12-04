abstract class SyncStorage {
  public abstract clear(): void;
  public abstract contains(key: string): boolean;
  public abstract delete(key: string): void;
  public abstract entries(): IterableIterator<[string, string]>;
  public abstract get(key: string, defaultValue: string): string;
  public abstract keys(): IterableIterator<string>;
  public abstract set(key: string, value: string): void;
  public abstract values(): IterableIterator<string>;
}

export default SyncStorage;
