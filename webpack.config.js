const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  mode: 'production',
  devtool: false,
  module: {
    rules: [{ test: /\.ts?$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'gitlab-deployer',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
  ],
  stats: {
    warningsFilter: [/node_modules\/yargs/],
  },
};
