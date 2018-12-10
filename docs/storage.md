# Storage
This documentation is to help you get to know `Storage` and provide a development guide.

Storage is where kevast save data. You can use any imaginable storage media, [memory](https://github.com/kevast/kevast-memory.js), [file](https://github.com/kevast/kevast-file.js), [Web Storage](https://developer.mozilla.org/docs/Web/API/Web_Storage_API), [Github Gist](https://gist.github.com/), [Dropbox](https://www.dropbox.com/), etc.

If kevast does not yet support the storage media you want, you can quickly create one and submit a PR according to the [guide](#how-to-create-a-storage). Thank you for your contribution to the kevast community.

## Synchronous & Asynchronous
Kevast has two kinds of storage, synchronous storage and asynchronous storage. It is easy to know from the name that the main difference between the two is whether the internal implementation is synchronous or asynchronous. Other than that, they are exactly the same.

For example, [kevast-memory](https://github.com/kevast/kevast-memory.js) is a synchronous storage and [kevast-file](https://github.com/kevast/kevast-file.js) is an asynchronous storage.

## Master & Redundancy
When creating a kevast instance, you need to provide a master storage and optionally multiple redundancy storages.

When performing some idempotent operations (like `get`, `size`, `keys`), kevast only uses the master storage. Other operations like `set`, `delete`, `clear` will be performed at all storages including master and redundancies.

## How to create a storage
It is strongly recommended to use TypeScript in kevast project.

### TypeScript
For practical detail, you can refer to [kevast-memory](https://github.com/kevast/kevast-memory.js) and [kevast-file](https://github.com/kevast/kevast-file.js) to learn how to develop, test and publish a new Storage.

For short:
```typescript
import { IAsyncStorage, ISyncStorage } from 'kevast/dist/nodejs/Storage';
class MySyncStorage implements ISyncStorage {
  public clear() {/* Code */}
  public has(key: string): boolean {/* Code */}
  public delete(key: string) {/* Code */}
  public entries(): IterableIterator<Pair> {/* Code */}
  public get(key: string): string {/* Code */}
  public keys(): IterableIterator<string> {/* Code */}
  public set(key: string, value: string) {/* Code */}
  public size(): number {/* Code */}
  public values(): IterableIterator<string> {/* Code */}
}
class MyAsyncStorage implements IAsyncStorage {
  public async clear() {/* Code */}
  public async has(key: string): Promise<boolean> {/* Code */}
  public async delete(key: string) {/* Code */}
  public async entries(): Promise<Iterable<Pair>> {/* Code */}
  public async get(key: string): Promise<string> {/* Code */}
  public async keys(): Promise<Iterable<string>> {/* Code */}
  public async set(key: string, value: string) {/* Code */}
  public async size(): Promise<number> {/* Code */}
  public async values(): Promise<Iterable<string>> {/* Code */}
  private async writeFile(): Promise<void> {/* Code */}
};
```
### JavaScript
```javascript
class MyStorage {
  clear() {/* Code */}
  has(key) {/* Code */}
  delete(key) {/* Code */}
  entries() {/* Code */}
  get(key) {/* Code */}
  keys() {/* Code */}
  set(key, value) {/* Code */}
  size() {/* Code */}
  values() {/* Code */}
}
```
