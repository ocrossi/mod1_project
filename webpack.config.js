
var path = require('path');

module.exports = {
  //...
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
	/*
	output: {
		filename: 'output.js',
		path: path.resolve(__dirname, "dist")
	}
	*/
};
