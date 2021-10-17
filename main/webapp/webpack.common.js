const path              = require('path');
const {VueLoaderPlugin} = require('vue-loader');
const ferropolyApps     = require('./ferropolyApps.js');

module.exports = {
  entry  : function () {
    let retVal = {};
    ferropolyApps.forEach(app => {
      retVal[app.name] = app.entry;
    });
    return retVal;
  },
  output : {
    filename: '[name].js',
    path    : path.resolve(__dirname, '..', 'public', 'js', 'test')
  },
  mode   : 'development',
  module : {
    rules: [
      {
        test  : /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test  : /\.pug$/,
        loader: 'pug-plain-loader'
      },
      {
        test: /\.css$/,
        use : ['style-loader', 'css-loader']
      },
      {
        test: /\.html$/i,
        use : 'raw-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        use : [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ]
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    },
  },
  plugins: [
    new VueLoaderPlugin()

  ]
};
