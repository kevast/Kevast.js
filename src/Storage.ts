import {Pair} from './Pair';

export interface IAsyncStorage {
  clear: () => Promise<void>;
  has: (key: string) => Promise<boolean>;
  delete: (key: string) => Promise<void>;
  entries: () => Promise<IterableIterator<Pair>>;
  get: (key: string) => Promise<string>;
  keys: () => Promise<IterableIterator<string>>;
  set: (key: string, value: string) => Promise<void>;
  size: () => Promise<number>;
  values: () => Promise<IterableIterator<string>>;
}

export interface ISyncStorage {
  clear: () => void;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  entries: () => IterableIterator<Pair>;
  get: (key: string) => string;
  keys: () => IterableIterator<string>;
  set: (key: string, value: string) => void;
  size: () => number;
  values: () => IterableIterator<string>;
}

export type Storage = IAsyncStorage | ISyncStorage;
