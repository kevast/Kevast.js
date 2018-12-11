# kevast.js
![logo](./docs/assets/logo.png)

Kevast is a dependency-free key-value storage interface, allowing you to access key-value based data wherever you want, memory, file, gist, etc.
With kevast's onion-like middleware stack flows, you can perform actions downstream and upstream.

Kevast.js is Javascript version of kevast for both Node.js and browser.

## Installation
### Node.js
Using yarn
```bash
yarn add kevast
```

Using npm
```bash
npm install kevast
```

### Browser
Latest version
```html
<script src="https://cdn.jsdelivr.net/npm/kevast/dist/browser/kevast.min.js"></script>
```
Specific version
```html
<script src="https://cdn.jsdelivr.net/npm/kevast@0.0.8/dist/browser/kevast.min.js"></script>
```

## Hello Kevast
```javascript
const Kevast = require('kevast');
// Install these package with yarn or npm
const KevastMemory = require('kevast-memory');
const KevastFile = require('kevast-file');
const KevastEncrypt = require('kevast-encrypt');

// Using memory as master storage,
// and file as redundancy storage
const kevast = new Kevast(new KevastMemory(), new KevastFile('./storage.db'));

// Using encryption as a middleware
const key = KevastEncrypt.randomKey();
kevast.use(new KevastEncrypt(key));

// Save key-value data
await kevast.set('key', Math.random().toString());

// According to configuration,
// data will be saved in both memory and file
// after encryption

// Read data from memory
// and decrypt
const value = await kevast.get('key');
console.log(value);
```

## Documentation
### Usage
#### Create an instance
When creating a kevast instance, you need to provide a master storage and optionally multiple redundancy storages.
Master storage will be the main storage and the data will be also backed up in redundancy storages.

```javascript
const Kevast = require('kevast');
const KevastMemory = require('kevast-memory');
const KevastFile = require('kevast-file');

//                           Master Storage         Redundancy Storages
//                                 ↓                          ↓
const kevast = new Kevast(new KevastMemory(), new KevastFile('./storage.db'));
```

#### Basic function
- `set(key: string, value: string): Promise<void>`: Sets the value for the key.
- `get(key: string, defaultValue: string | null = null): Promise<string>`: Returns the value associated to the key, or `defaultValue` if there is none.
- `delete(key: string): Promise<void>`: Remove a key-value pair
- `clear(): Promise<void>`: Removes all key-value pairs
- `has(key: string): Promise<boolean>`: Returns a boolean asserting whether key-value pair exists or not.
- `size(): Promise<number>`: Returns the number of key-value pairs.
- `keys(): Promise<Iterable<string>>`: Returns a new Iterable object that contains all keys.
- `values(): Promise<Iterable<string>>`: Returns a new Iterable object that contains all values.
- `entries(): Promise<Iterable<Pair>>`: Returns a Iterable object that contains an array of [key, value] for all pairs.

#### Use a middleware
With kevast's onion-like middleware stack flows, you can perform actions downstream and upstream.

![middleware onget](./docs/assets/middleware_onget.png)

![middleware onset](./docs/assets/middleware_onset.png)

```javascript
const kevast = new Kevast(...);
kevast.onGet.use(async (pair, next) => {
  // pair[0] => key
  // pair[1] => value
  console.log('Before Get');
  await next();
  console.log('After Get');
});

kevast.onSet.use((pair, next) => {
  // pair[0] => key
  // pair[1] => value
  console.log('Before Set');
  await next();
  console.log('After Set');
});

kevast.use({
  onGet(pair, next) {/* ... */},
  onSet(pair, next) {/* ... */}
});
```

### Development
- [Storage](./docs/storage.md)
- [Middleware](./docs/middleware.md)

## Compatibility
![Node.js v6.0.0](https://img.shields.io/badge/Node.js-v6.0.0-brightgreen.svg)

Kevast requires Node.js v6.0.0 or higher.

Browser support:

|![chrome](https://github.com/alrra/browser-logos/raw/master/src/chrome/chrome_64x64.png)|![firefox](https://github.com/alrra/browser-logos/raw/master/src/firefox/firefox_64x64.png)|![safari](https://github.com/alrra/browser-logos/raw/master/src/safari/safari_64x64.png)|![opera](https://github.com/alrra/browser-logos/raw/master/src/opera/opera_64x64.png)|![edge](https://github.com/alrra/browser-logos/raw/master/src/edge/edge_64x64.png)|![ie11](https://github.com/alrra/browser-logos/raw/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_64x64.png)|![ios](https://github.com/alrra/browser-logos/raw/master/src/safari-ios/safari-ios_64x64.png)|![android](https://github.com/alrra/browser-logos/raw/master/src/archive/android/android_64x64.png)|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|70|63|≤11 12|55|17|9 10 11|≤10 11 12|≤3 4|
|:white_check_mark:|:white_check_mark:|:white_check_mark:|:white_check_mark:|:white_check_mark:|:white_check_mark:|:white_check_mark:|:white_check_mark:|

## Build
```bash
npm run build
```

Both Node.js and browser version will be built. Locate at `kevast.js/dist`.

## Running Tests
```bash
npm run test
```

Both Node.js and browser version will be tested. Note that it will finally open your browser to finish the test.

## LICENSE
MIT

## Why the funky name?
Kevast stands for ke(y) va(lue) st(orage).
