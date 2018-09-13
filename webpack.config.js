const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  devtool: 'eval-source-map',
  plugins: [
    new HtmlWebPackPlugin({ template: 'src/index.html' }),
    new webpack.HotModuleReplacementPlugin({ }),
    new CopyWebpackPlugin([{ from: 'data' }]),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [ "@babel/preset-env", "@babel/preset-react" ],
            plugins: [ "transform-class-properties" ],
          },
        }],
      },
      { test: /\.xml$/, loader: "file" }
    ],
  },
};
