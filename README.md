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
```
<script src="https://cdn.jsdelivr.net/npm/kevast/dist/browser/kevast.min.js"></script>
```
Specific version
```
<script src="https://cdn.jsdelivr.net/npm/kevast@0.0.4/dist/browser/kevast.min.js"></script>
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
const kevast = new Kevast(new KevastMemory(), new KevastFile(...));

// Using encryption as a middleware
kevast.use(new KevastEncrypt(...));

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
- [Storage]('./docs/storage.md')
- [Redundancy]('./docs/redundancy.md)
- [Middleware]('./docs/middleware.md)

## More Examples
TODO

## Compatibility
![Node.js v6.0.0](https://img.shields.io/badge/Node.js-v6.0.0-brightgreen.svg)

Kevast requires Node.js v6.0.0 or higher.

Browser support:

|![chrome](https://github.com/alrra/browser-logos/raw/master/src/chrome/chrome_64x64.png)|![firefox](https://github.com/alrra/browser-logos/raw/master/src/firefox/firefox_64x64.png)|![safari](https://github.com/alrra/browser-logos/raw/master/src/safari/safari_64x64.png)|![opera](https://github.com/alrra/browser-logos/raw/master/src/opera/opera_64x64.png)|![edge](https://github.com/alrra/browser-logos/raw/master/src/edge/edge_64x64.png)|![ie11](https://github.com/alrra/browser-logos/raw/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_64x64.png)|![ios](https://github.com/alrra/browser-logos/raw/master/src/safari-ios/safari-ios_64x64.png)|![android](https://github.com/alrra/browser-logos/raw/master/src/archive/android/android_64x64.png)|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|70|63|≤11 12|55|17|9 10 11|≤10 11 12|≤3 4|
|✅|✅|✅|✅|✅|✅|✅|✅|

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
