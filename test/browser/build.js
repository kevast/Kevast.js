const webpack = require('webpack');;
const fs = require('fs');
const path = require('path');
const testPath = path.resolve(__dirname, '..');

const entry = {
  'kevast': path.resolve(__dirname, '../../src/index.ts')
};
fs.readdirSync(testPath).filter(name => name.includes('.test.ts')).forEach(name => {
  entry[name.substr(0, name.indexOf('.ts'))] = path.resolve(testPath, name);
});

webpack({
  entry,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'temp')
  }
}).run();
