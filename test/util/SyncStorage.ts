import { MutationEvent, Storage } from '../../src/Storage';

export class SyncStorage implements Storage {
  private storage: Map<string, string>;
  public constructor(storage: Map<string, string> = new Map()) {
    this.storage = storage;
  }
  public mutate(event: MutationEvent): void {
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
  public get(key: string): string | undefined {
    return this.storage.get(key);
  }
}
