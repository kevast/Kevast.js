import { Pair } from './Pair';

export interface IMutationEvent {
  added: Pair[];
  changed: Pair[];
  current: any;
  removed: Pair[];
}

export interface IStorage {
  mutate: (event: IMutationEvent) => Promise<void> | void;
  current: () => Promise<Map<string, string>> | Map<string, string>;
}
