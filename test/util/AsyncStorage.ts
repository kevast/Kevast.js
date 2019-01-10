import { MutationEvent, Storage } from '../../src/Storage';

export class AsyncStorage implements Storage {
  private storage: Map<string, string>;
  public constructor(storage: Map<string, string> = new Map()) {
    this.storage = storage;
  }
  public async mutate(event: MutationEvent): Promise<void> {
    for (const pair of event.set) {
      this.storage.set(pair.key, pair.value as string);
    }
    for (const one of event.removed) {
      this.storage.delete(one);
    }
    if (event.clear) {
      this.storage.clear();
    }
  }
  public async get(key: string): Promise<string | undefined> {
    return this.storage.get(key);
  }
}
