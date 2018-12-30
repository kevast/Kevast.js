# Middleware
This documentation is to help you get to know about kevast's `Middleware` and provide a development guide.

The role of middleware is to extend the functionality of kevast. For example, you can use middlewares to filter, confuse, encrypt data, log, and etc.

If kevast does not yet has the middleware you want, you can quickly create one according to the [guide](#how-to-create-a-middleware). Thank you for your contribution to the kevast community.

## Onion structure
With kevast's onion-like middleware stack flows, you can perform actions downstream and upstream.

![middleware onget](./assets/middleware_onget.png)

![middleware onset](./assets/middleware_onset.png)

### Example
```javascript
const tracer = [];
const kevast = new Kevast();
kevast.onSet.use(async (pair, next) => {
  tracer.push('beforeSet:1');
  pair[1] += '1';
  await next();
  tracer.push('afterSet:1');
});
kevast.onSet.use(async (pair, next) => {
  tracer.push('beforeSet:2');
  pair[1] += '2';
  await next();
  tracer.push('afterSet:2');
});
kevast.onSet.use(async (pair, next) => {
  tracer.push('beforeSet:3');
  pair[1] += '3';
  await next();
  tracer.push('afterSet:3');
});
await kevast.set('key', 'value');
const value = kevast.get('key');
assert(value === 'value123');
assert.deepEqual(
  tracer,
  ['beforeSet:1', 'beforeSet:2', 'beforeSet:3', 'afterSet:3', 'afterSet:2', 'afterSet:1']
);
```

## Simplex and Duplex
Kevast runs middlewares only in both `get` and `set` cases.

If a middleware only runs in one of the `get` or `set` cases, it becomes a simplex middleware, while running in both cases is duplex middleware.

For example, the above code shows a simplex middleware for it only runs at `set`. [kevast-encrypt](https://github.com/kevast/kevast-encrypt.js/tree/master) is a duplex middleware because it needs to encrypt before `set` and decrypt after `get`.
 
## How to Create a Middleware
It is strongly recommended to use TypeScript in kevast project.

### TypeScript
For practical detail, you can refer to [kevast-encrypt](https://github.com/kevast/kevast-encrypt.js/tree/master) to learn how to develop, test and publish a new middleware.

For short:
```typescript
// Simplex onGet middleware
function onGetMiddleware(pair: [string, string], next: () => void) {/* code */}
// Simplex onSet middleware
async function onSetMiddleware(pair: [string, string], next: () => Promise<void>) {/* code */}
// Duplex middleware
const duplexMiddleware = {
  onGet: (pair: [string, string], next: () => void) => {/* code */},
  onSet: async (pair: [string, string], next: () => Promise<void>) => {/* code */},
}
```

### JavaScript
```javascript
// Simplex onGet middleware
function onGetMiddleware(pair, next) {/* code */}
// Simplex onSet middleware
async function onSetMiddleware(pair, next) {/* code */}
// Duplex middleware
const duplexMiddleware = {
  onGet: (pair, next) => {/* code */},
  onSet: async (pair, next) => {/* code */},
}
```
