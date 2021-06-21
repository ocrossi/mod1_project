var path = require('path');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
	
  module: {
    rules: [
      {
        test: /\.mod1$/i,
        use: 'raw-loader',
      },
      { test: /\.html$/i, loader: 'html-loader' },
    ],
  },
	
};
