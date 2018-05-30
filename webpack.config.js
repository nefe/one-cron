var path = require("path");
var webpack = require("webpack");

module.exports = {
  context: __dirname,
  debug: true,
  devtool: "#inline-source-map",
  entry: path.join(__dirname + "/src/index.tsx"),
  output: "lib",
  plugins: [new webpack.HotModuleReplacementPlugin()],
  resolve: {
    extensions: ["", ".js"]
  },

  stats: {
    colors: true,
    chunks: false
  },

  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        include: [__dirname, path.join(__dirname, "..", "index.ts")]
      }
    ]
  }
};
