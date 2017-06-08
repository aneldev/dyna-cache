// help: http://webpack.github.io/docs/configuration.html

const libraryName = 'dyna-cache';

let path = require('path');
let webpack = require('webpack');

let config = {
  entry: [
    // the entry application code
    path.resolve(__dirname, 'src/index.ts')
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/dist/',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    alias: {},
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    // help: http://webpack.github.io/docs/tutorials/getting-started/
    rules: [
      {
        // Javascript and JSX loader
        test: /\.(jsx|js)$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'babel-polyfill', 'stage-2']
        }
      },
      {
        // typescript loader
        test: /\.(tsx|ts)$/,
        loader: 'awesome-typescript-loader',
        query: {
          ignoreDiagnostics: [
            // for codes see at:https://github.com/Microsoft/TypeScript/blob/master/src/compiler/diagnosticMessages.json
            2304, // Cannot find name '{0}
            2305, // '{0}' has no exported member '{1}'
            2307, // Cannot find module '{0}'
            //2339, // Property '{0}' does not exist on type '{1}'
            //2346, //Supplied parameters do not match any signature of call target.
          ]
        }
      },
      {	// json loader
        test: /\.json$/, loader: "json-loader"
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {test: /\.js$/, loader: "source-map-loader"}
    ]
  },
  plugins: [
    // todo: UglifyJsPlugin is not compatible at the moment with ES6 (Array.find && Object.assign are supported from ES6)
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   },
    //   sourceMap: true
    // })
  ]

};

module.exports = config;
