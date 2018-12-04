abstract class AsyncStorage {
  public abstract clear(): Promise<void>;
  public abstract contains(key: string): Promise<boolean>;
  public abstract delete(key: string): Promise<void>;
  public abstract entries(): Promise<IterableIterator<[string, string]>>;
  public abstract get(key: string, defaultValue: string): Promise<string>;
  public abstract keys(): Promise<IterableIterator<string>>;
  public abstract set(key: string, value: string): Promise<void>;
  public abstract values(): Promise<IterableIterator<string>>;
}

export default AsyncStorage;
