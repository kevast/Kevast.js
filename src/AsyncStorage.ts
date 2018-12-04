import IPair from './IPair';

abstract class AsyncStorage {
  public abstract clear(): Promise<void>;
  public abstract contains(key: string): Promise<boolean>;
  public abstract delete(key: string): Promise<void>;
  public abstract entries(): Promise<IterableIterator<IPair>>;
  public abstract get(key: string): Promise<string | null>;
  public abstract keys(): Promise<IterableIterator<string>>;
  public abstract set(key: string, value: string): Promise<void>;
  public abstract values(): Promise<IterableIterator<string>>;
}

export default AsyncStorage;
