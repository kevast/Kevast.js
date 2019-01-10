const webpack = require('webpack');;
const path = require('path');

webpack({
  entry: path.resolve(__dirname, './test.ts'),
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: ['babel-loader', 'awesome-typescript-loader'],
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'temp')
  }
}).run();
