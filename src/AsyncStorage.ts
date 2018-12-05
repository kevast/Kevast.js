export abstract class AsyncStorage {
  public abstract clear(): Promise<void>;
  public abstract has(key: string): Promise<boolean>;
  public abstract delete(key: string): Promise<void>;
  public abstract entries(): Promise<IterableIterator<[string, string]>>;
  public abstract get(key: string): Promise<string | null | undefined>;
  public abstract keys(): Promise<IterableIterator<string>>;
  public abstract set(key: string, value: string): Promise<void>;
  public abstract size(): Promise<number>;
  public abstract values(): Promise<IterableIterator<string>>;
}
