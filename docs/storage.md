# Storage
Storage is where kevast save data. You can use any imaginable storage media, [memory](https://github.com/kevast/kevast-memory.js), [file](https://github.com/kevast/kevast-file.js), [Web Storage](https://developer.mozilla.org/docs/Web/API/Web_Storage_API), [Github Gist](https://gist.github.com/), [Dropbox](https://www.dropbox.com/), etc.

If kevast does not yet support the storage media you want, you can quickly create one according to the guide below. Thank you for your contribution to the kevast community.

## How to Create a Storage
It is strongly recommended to use TypeScript in kevast project.

### TypeScript
For practical detail, you can refer to [kevast-memory](https://github.com/kevast/kevast-memory.js), [kevast-file](https://github.com/kevast/kevast-file.js) and [kevast-gist](https://github.com/kevast/kevast-gist.js) to learn how to develop, test and publish a new storage.

For short:
```typescript
import { MutationEvent, Storage } from 'kevast/dist/Storage';

export class MyStorage implements Storage {
  public mutate(event: MutationEvent): Promise<void> | void {
    // Pairs set
    for (const pair of event.set) {
      console.log(pair.key);
      console.log(pair.value);
    }
    // Keys of pairs removed
    for (const key of event.removed) {
      console.log(key);
    }
    // true if storage is cleared
    if (event.clear) {
      console.log('Now storage should be cleared');
    }
  }
  public get(key: string): Promise<string | undefined> | (string | undefined) {
    // return the value associated to the key
    return 'value';
  }
}
```

### JavaScript
```javascript
class MyStorage {
  mutate(event) {
    // Pairs set
    for (const pair of event.set) {
      console.log(pair.key);
      console.log(pair.value);
    }
    // Keys of pairs removed
    for (const key of event.removed) {
      console.log(key);
    }
    // true if storage is cleared
    if (event.clear) {
      console.log('Now storage should be cleared');
    }
  }
  get(key) {
    // return the value associated to the key
    return 'value';
  }
}

module.exports = MyStorage;
```
