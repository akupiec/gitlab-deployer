const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  mode: 'production',
  devtool: false,
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
      {
        test: /node_modules\/cfonts.*constants\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: 'path.normalize(`${__dirname}/../package.json`)',
          replace: `'../package.json'`,
        },
      }],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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
