const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: ["./src/index"],
  externals: {
    react: "react"
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "lib"),
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        include: path.join(__dirname, "src"),
        exclude: /node_modules/,
        loaders: ["awesome-typescript-loader"]
      },
      {
        test: /\.css?$/,
        loaders: ["style-loader", "css-loader"]
      }
    ]
  },
  externals: {
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react"
    },
    lodash: "lodash",
    moment: "moment",
    "react-dom": "ReactDOM",
    antd: "antd"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  ]
};
