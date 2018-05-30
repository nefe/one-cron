const path = require('path');

module.exports = {
  entry: ['./src/index'],
  externals: {
    react: 'react'
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loaders: ['awesome-typescript-loader']
      },
      {
        test: /\.css?$/,
        loaders: ['style-loader', 'css-loader']
      }
    ]
  }
};
