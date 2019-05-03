const merge  = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output      : {
    filename: '[name].min.js',
    chunkFilename: '[name].bundle.js',
    path    : path.resolve(__dirname, 'main', 'public', 'js', 'min')
  },
  optimization: {
    splitChunks: {
      chunks                : 'all',
      minSize               : 30000,
      maxSize               : 200000,
      minChunks             : 1,
      maxAsyncRequests      : 5,
      maxInitialRequests    : 3,
      automaticNameDelimiter: '~',
      name                  : false,
      cacheGroups           : {
        vendors: {
          test    : /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks         : 2,
          priority          : -20,
          reuseExistingChunk: true
        }
      }
    }
  }

});
