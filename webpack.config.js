const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const VueLoaderPlugin = require('vue-loader/lib/plugin')


module.exports = function (options) {
  return {
    mode: process.env.NODE_ENV || "development",
    entry: [
      'webpack-hot-middleware/client?reload=true',
      // './src/client/index.ts',
      './src/client/index3d.ts'
    ],
    module: {
      rules: [
       // { test: /\.tsx?$/, use: 'ts-loader?configFile=tsconfig-client.json', exclude: /node_modules/ },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
         
          use: [
            {

              loader: 'ts-loader',
              options:{
                configFile: "tsconfig-client.json",
                appendTsSuffixTo: [/\.vue$/],
                appendTsxSuffixTo: [/\.vue$/]
              }
            
            }



          ]
        },


        { test: /\.(png|woff|woff2|eot|ttf|svg)$/, use: 'file-loader?limit=1024&name=[path][name].[ext]' },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        // this will apply to both plain `.js` files
        // AND `<script>` blocks in `.vue` files
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        // this will apply to both plain `.css` files
        // AND `<style>` blocks in `.vue` files
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: [
            "style-loader", // creates style nodes from JS strings
            "css-loader", // translates CSS into CommonJS
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
          ]
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),

      new VueLoaderPlugin(),

      new HtmlWebpackPlugin({
        template: path.resolve("src", "client", "index3d.html")
      }),

      // extract styles from bundle into a separate file
      new ExtractTextPlugin('index.css'),
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'lib', 'public')
    }
  };
}
