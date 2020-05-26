const {
  override,
  disableEsLint,
  addWebpackPlugin,
  addBabelPlugin,
  addPostcssPlugins,
  watchAll,
  babelInclude
} = require('customize-cra');
const path = require('path');

const PreloadWebpackPlugin = require('preload-webpack-plugin');
const ScriptWebpackPlugin = require('html-webpack-scripts-plugin');
const CombineMediaQuery = require('postcss-combine-media-query');

module.exports = process.env.NODE_ENV === 'production' ?
  override(
    disableEsLint(),
    addPostcssPlugins([CombineMediaQuery]),
    babelInclude([
      path.resolve('src'),
      path.resolve('node_modules/worker-timers-broker'),
      path.resolve('node_modules/worker-timers')
    ]),
    addBabelPlugin('@babel/transform-react-constant-elements'),
    addBabelPlugin('@babel/transform-react-inline-elements'),
    addBabelPlugin('transform-react-remove-prop-types'),
    addWebpackPlugin(new PreloadWebpackPlugin({
      rel: 'preload',
      include: 'allAssets',
      as(entry) {
        if (/\.css$/.test(entry)) {
          return 'style';
        }
        if (/\.woff|\.woff2$/.test(entry)) {
          return 'font';
        }
        if (/\.png|\.jpg|\.svg$/.test(entry)) {
          return 'image';
        }
        if (/\.mjs$/.test(entry)) {
          return 'modulepreload';
        }
        if (/\.js$/.test(entry)) {
          return 'script';
        }
        return 'fetch';
      },
      fileBlacklist: [
        /\.map/,
        /\.txt/
      ]
    })),
    addWebpackPlugin(new ScriptWebpackPlugin({
      'defer=defer charset=utf-8': /.*/
    }))
  ) : override(
    disableEsLint(),
    babelInclude([
      path.resolve('src'),
      path.resolve('node_modules/worker-timers-broker'),
      path.resolve('node_modules/worker-timers')
    ]),
    addBabelPlugin('@babel/transform-react-constant-elements'),
    addBabelPlugin('@babel/transform-react-inline-elements'),
    watchAll()
  );
