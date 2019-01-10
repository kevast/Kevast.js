const path = require('path');
const packageName = require('./package.json').name;

function generateConfig(name) {
  const mode = name.includes('min') ? 'production' : 'development';
  return {
    entry: './src/index.ts',
    mode,
    module: {
      rules: [
        {
          test: /\.ts?$/,
          loader: ['babel-loader', 'awesome-typescript-loader'],
        },
      ],
    },
    resolve: {
      extensions: [ '.ts', '.js' ]
    },
    output: {
      filename: `${name}.js`,
      path: path.resolve(__dirname, 'dist'),
      library: camelCase(packageName),
      libraryTarget: 'umd'
    },
    devtool: 'source-map',
  }
}

module.exports = [generateConfig(packageName), generateConfig(`${packageName}.min`)];

function camelCase(str) {
  str = str.replace(/^([a-z])/, v => v.toUpperCase())
  str = str.replace(/-([a-z])/g, v => v[1].toUpperCase());
  return str;
}
