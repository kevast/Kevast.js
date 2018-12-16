import { Pair } from '../../src/Pair';
import { IMutationEvent, IStorage } from '../../src/Storage';

export class SStorage implements IStorage {
  private storage: Map<string, string>;
  public constructor(storage: Map<string, string> = new Map()) {
    this.storage = storage;
  }
  public mutate(event: IMutationEvent) {
    for (const pair of event.added) {
      this.storage.set(pair[0], pair[1]);
    }
    for (const pair of event.changed) {
      this.storage.set(pair[0], pair[1]);
    }
    for (const pair of event.removed) {
      this.storage.delete(pair[0]);
    }
  }
  public init() {
    return this.storage;
  }
}
