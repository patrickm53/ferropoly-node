const path = require('path');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');


module.exports = {
  entry       : {
    checkin  : './webapp/check-in/app.js'
  },
  output      : {
    filename: '[name].js',
    path    : path.resolve(__dirname, 'main', 'public', 'js')
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
  plugins: [
    // To strip all locales except “en” and "de-ch"
    new MomentLocalesPlugin({
      localesToKeep: ['de-ch'],
    }),
  ]
};
