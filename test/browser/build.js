const webpack = require('webpack');;
const path = require('path');

const entry = {
  'test': ['@babel/polyfill', path.resolve(__dirname, './test.ts')]
};

webpack({
  entry,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
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
    path: path.resolve(__dirname)
  }
}).run();
