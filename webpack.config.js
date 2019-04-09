const path = require('path');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');


module.exports = {
  entry       : {
    app  : './webapp/check-in/app.js'
  },
  output      : {
    filename: '[name].js',
    path    : path.resolve(__dirname, 'main', 'public', 'js', 'check-in')
  },
  mode        : 'development',
  module      : {
    rules: [
      {
        test: /\.css$/,
        use : ['style-loader', 'css-loader']
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    // To strip all locales except “en” and "de-ch"
    new MomentLocalesPlugin({
      localesToKeep: ['de-ch'],
    }),
  ]
};
