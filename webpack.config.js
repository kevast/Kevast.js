const path = require('path');

function generateConfig(name) {
  const mode = name.includes('min') ? 'production' : 'development';
  return {
    entry: './src/index.ts',
    mode,
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
      filename: `${name}.js`,
      path: path.resolve(__dirname, 'dist', 'browser'),
      library: 'kevast',
      libraryTarget: 'umd'
    },
    devtool: 'source-map'
  }
}

module.exports = [generateConfig('kevast'), generateConfig('kevast.min')];
