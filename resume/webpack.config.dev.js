const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: '#cheap-module-eval-source-map',
  entry: [
    `webpack-dev-server/client?http://${process.env.npm_package_config_host}:${process.env.npm_package_config_port}`,
    'webpack/hot/only-dev-server',
    'react-hot-loader/patch',
    './src/index.dev'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      '__DEV__': true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html', // Load a custom template
      inject: 'body' // Inject all scripts into the body 
    })
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel?retainLines=true'],
      include: path.join(__dirname, 'src')
    }, {
      test: /\.css$/, // Only .css files
      loader: 'style!css' // Run both loaders
    }, {
      test: /\.less$/, // Only .css files
      loader: 'style!css!less' // Run both loaders
    }]
  }
};
