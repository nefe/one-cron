const path = require('path');

module.exports = {
  entry: ['./demo/index'],
  watch: true,
  cache: true,
  devtool: 'eval-source-map',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css','.less']
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
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: true,
    ignored: /node_modules/
  },
  devServer: {
    contentBase: path.join(__dirname, '/'),
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    historyApiFallback: {
      index: '/index.html'
    },
    stats: 'minimal',
    host: '0.0.0.0',
    port: 8080,
    compress: true
  }
};
