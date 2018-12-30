# Storage
This documentation is to help you get to know about kevast's `Storage` and provide a development guide.

Storage is where kevast save data. You can use any imaginable storage media, [memory](https://github.com/kevast/kevast-memory.js), [file](https://github.com/kevast/kevast-file.js), [Web Storage](https://developer.mozilla.org/docs/Web/API/Web_Storage_API), [Github Gist](https://gist.github.com/), [Dropbox](https://www.dropbox.com/), etc.

If kevast does not yet support the storage media you want, you can quickly create one according to the [guide](#how-to-create-a-storage). Thank you for your contribution to the kevast community.

## How to Create a Storage
It is strongly recommended to use TypeScript in kevast project.

### TypeScript
For practical detail, you can refer to [kevast-memory](https://github.com/kevast/kevast-memory.js), [kevast-file](https://github.com/kevast/kevast-file.js) and [kevast-gist](https://github.com/kevast/kevast-gist.js) to learn how to develop, test and publish a new storage.

For short:
```typescript
import { IMutationEvent, IStorage } from 'kevast/dist/Storage';
class MyStorage implements IStorage {
  public async current(): Promise<Map<string, string>> {
    // return current contain like 
    return new Map<string, string>([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);
    // if empty
    return new Map<string, string>();
  }
  public async mutate(event: IMutationEvent) {
    // updates your storage according to mutation event
    // pairs added to storage
    event.added;
    // pairs changed
    event.changed;
    // pairs removed from storage
    event.removed;
    // current contain map
    event.current;
  }
}
```
### JavaScript
```javascript
class MyStorage {
  async current() {
    // return current contain like 
    return new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);
    // if empty
    return new Map();
  }
  async mutate(event) {
    // updates your storage according to mutation event
    // pairs added to storage
    event.added;
    // pairs changed
    event.changed;
    // pairs removed from storage
    event.removed;
    // current contain map
    event.current;
  }
}
```
