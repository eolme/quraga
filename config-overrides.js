const {
  override,
  disableEsLint,
  addWebpackPlugin,
  addBabelPlugin,
  addWebpackAlias,
  watchAll
} = require('customize-cra');

const PreloadWebpackPlugin = require('preload-webpack-plugin');

module.exports = process.env.NODE_ENV === 'production' ?
  override(
    disableEsLint(),
    addBabelPlugin('@babel/transform-react-constant-elements'),
    addBabelPlugin('transform-react-remove-prop-types'),
    addWebpackAlias({
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }),
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
    }))
  ) : override(
    disableEsLint(),
    watchAll(),
    addWebpackAlias({
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    })
  );
