import {Pair} from './Pair';

export interface IAsyncStorage {
  clear: () => Promise<void>;
  has: (key: string) => Promise<boolean>;
  delete: (key: string) => Promise<void>;
  entries: () => Promise<Iterable<Pair>>;
  get: (key: string) => Promise<string>;
  keys: () => Promise<Iterable<string>>;
  set: (key: string, value: string) => Promise<void>;
  size: () => Promise<number>;
  values: () => Promise<Iterable<string>>;
}

export interface ISyncStorage {
  clear: () => void;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  entries: () => Iterable<Pair>;
  get: (key: string) => string;
  keys: () => Iterable<string>;
  set: (key: string, value: string) => void;
  size: () => number;
  values: () => Iterable<string>;
}

export type Storage = IAsyncStorage | ISyncStorage;
