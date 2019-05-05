const merge  = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output      : {
    filename: '[name].min.js',
    chunkFilename: '[name].bundle.js'
  },
  optimization: {
    splitChunks: {
      chunks                : 'async',
      minSize               : 30000,
      maxSize               : 0,
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
