# Middleware
The role of middleware is to extend the functionality of kevast. For example, you can use middlewares to filter, confuse, encrypt data, log, and etc.

If kevast does not yet has the middleware you want, you can quickly create one according to the guide below. Thank you for your contribution to the kevast community.

## Simplex and Duplex
Kevast has three kinds of middleware:

1. `afterGet` middleware works after `Get` operation.
2. `beforeSet` middleware works before `Set` operation.
3. `DuplexMiddleware` is a combination of the two above.

```javascript
const kevast = await Kevast.create(...storages);
kevast.afterGet.use((pair) => {
  console.log(pair.key, pair.value);
  if (pair.value) {
    pair.value += '***';
  }
});

kevast.beforeSet.use((pair) => {
  console.log(pair.key, pair.value);
  pair.value += '***';
});

kevast.use({
  afterGet(pair) {/* ... */},
  beforeSet(pair) {/* ... */},
});
```
 
## How to Create a Middleware
It is strongly recommended to use TypeScript in kevast project.

### TypeScript
For practical detail, you can refer to [kevast-encrypt](https://github.com/kevast/kevast-encrypt.js/tree/master) to learn how to develop, test and publish a new middleware.

For short:
```typescript
import { Pair } from 'kevast/dist/Pair';

export function afterGet(pair: Pair) {
  console.log(pair.key);
  if (pair.value) {
    console.log(pair.value);
  }
}
```

```typescript
import { Pair } from 'kevast/dist/Pair';

export function beforeSet(pair: Pair) {
  console.log(pair.key);
  console.log(pair.value);
}
```


```typescript
import { DuplexMiddleware } from 'kevast/dist/Middleware';
import { Pair } from 'kevast/dist/Pair';

export class MyMiddleware implements DuplexMiddleware {
  public afterGet(pair: Pair) {
    console.log(pair.key);
    console.log(pair.value);
  }
  public beforeSet(pair: Pair) {
    console.log(pair.key);
    console.log(pair.value);
  }
}
```

### JavaScript
```javascript
module.exports = function afterGet(pair) {
  console.log(pair.key);
  if (pair.value) {
    console.log(pair.value);
  }
}
```

```javascript
module.exports = function beforeSet(pair) {
  console.log(pair.key);
  console.log(pair.value);
}
```


```javascript
module.exports = class MyMiddleware {
  afterGet(pair) {
    console.log(pair.key);
    console.log(pair.value);
  }
  beforeSet(pair) {
    console.log(pair.key);
    console.log(pair.value);
  }
}
```
