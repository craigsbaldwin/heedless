// Configured using https://github.com/fransyrcc/starter-html-sass-js-webpack/blob/master/webpack.config.js

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  mode: 'development',
  context: path.join(__dirname, 'src'),

  entry: {
    theme: './scripts/theme.js',
  },

  output: {
    filename: 'assets/[name].js',
    path: path.join(__dirname, 'dist'),
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      hash: false,
      filename: 'index.html',
      template: path.resolve(__dirname, 'src', 'index.html')
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].css',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src', 'pwa'),
        to: path.resolve(__dirname, 'dist', 'assets'),
        toType: 'dir',
      },
    ]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src', 'images'),
        to: path.resolve(__dirname, 'dist', 'assets/images'),
        toType: 'dir',
      },
    ])
  ],
};

module.exports = config;
