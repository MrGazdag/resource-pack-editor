const path = require('path');

module.exports = {
  entry: {
    'core': {
        import: './src/index.ts'
    },
    'platforms/browser': {
        import: './src/platforms/browser/index.ts',
        dependOn: 'core'
    },
    'games/minecraft-java': {
        import: "./src/games/minecraft-java/index.ts",
        dependOn: 'core'
    }
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'eval',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};