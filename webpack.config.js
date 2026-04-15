const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';

// Multi-mode configuration support
// Build modes: all (default), wallpaper, furniture, clothing, bassett, furniture-simple, clothing-simple
// Usage: npm run build -- --env mode=furniture
module.exports = (env = {}) => {
  const buildMode = env.mode || 'all';

  // Define which bundles to build
  const entries = {};

  if (buildMode === 'all' || buildMode === 'wallpaper') {
    entries['color-flex-core'] = './src/index.core.js';
  }

  if (buildMode === 'trade-demo') {
    entries['color-flex-trade-demo'] = './src/index.trade-demo.js';
  }

  if (buildMode === 'all' || buildMode === 'bassett') {
    entries['color-flex-bassett'] = './src/index.bassett.js';
  }

  if (buildMode === 'all' || buildMode === 'furniture') {
    entries['color-flex-furniture'] = './src/index.furniture.js';
  }

  if (buildMode === 'all' || buildMode === 'clothing') {
    entries['color-flex-clothing'] = './src/index.clothing.js';
  }

  if (buildMode === 'furniture-simple') {
    entries['color-flex-furniture-simple'] = './src/index.furniture-simple.js';
  }

  if (buildMode === 'clothing-simple') {
    entries['color-flex-clothing-simple'] = './src/index.clothing-simple.js';
  }

  if (buildMode === 'simple') {
    entries['color-flex-furniture-simple'] = './src/index.furniture-simple.js';
    entries['color-flex-clothing-simple'] = './src/index.clothing-simple.js';
  }

  console.log(`🎨 Building ColorFlex mode: ${buildMode}`);
  console.log(`📦 Output bundles:`, Object.keys(entries));

  return {
    mode: isProduction ? 'production' : 'development',

    entry: entries,

    output: {
      filename: isProduction ? '[name].min.js' : '[name].js',
      path: path.resolve(__dirname, 'src/assets'),
      library: {
        name: 'ColorFlex',
        type: 'umd'
      },
      globalObject: 'this',
      clean: false // Don't clean src/assets folder to preserve other files
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
        // CSS processing removed - CSS is managed manually
      ]
    },

    plugins: [
      // CleanWebpackPlugin removed to preserve manually managed CSS
      // MiniCssExtractPlugin removed - CSS is managed manually

      // Define mode constant for conditional logic (optional, mode detection handles this)
      new webpack.DefinePlugin({
        'process.env.BUILD_MODE': JSON.stringify(buildMode),
        'process.env.BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString()),
        'process.env.BUILD_DATE': JSON.stringify(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
      })
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: false, // Keep console.log statements for debugging
            },
          },
        })
      ]
    },

    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },

    devtool: isProduction ? false : 'source-map'
  };
};
