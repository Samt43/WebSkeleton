const webpack = require("webpack");
const path = require("path");
let config = {
  entry: "./src/index.js",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "../public/assets/js"),
    publicPath: "/assets/js",
    filename: "bundle.js"
  },
  module : {
    rules : [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      }
    ]
  },
}

module.exports = config;
