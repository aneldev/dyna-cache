// help: http://webpack.github.io/docs/configuration.html

let path = require('path');
let webpack = require('webpack');

console.log('To debug open address: http://localhost:8027 on any browser');
console.log('');

let config = {
  entry: [
    // inject some code in order to enable the auto refresh of the browse in case of a file's change
    'webpack-dev-server/client?http://localhost:8027',
    // the entry application code
    path.resolve(__dirname, 'debug/index.ts')
  ],
  output: {
    path: path.resolve(__dirname, 'debug-ground/debug-on-browser'),
    filename: 'debug-browser.js'
  },
  resolve: {
    alias: {},
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    // help: http://webpack.github.io/docs/tutorials/getting-started/
    loaders: [
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
};

module.exports = config;
