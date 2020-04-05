/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const path = require('path')

const tsConfig = path.resolve(__dirname, 'tsconfig.json')

module.exports = {
  entry: './handler.ts',
  target: 'node',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { configFile: tsConfig },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '.webpack'),
    filename: 'handler.js',
  },
}
