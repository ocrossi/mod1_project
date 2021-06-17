
var path = require('path');

module.exports = {
  
	mode: "development",
	entry: './src/index.js',
	output: {
		filename: 'output.js',
		path: path.resolve(__dirname, "test")
	},
	
	//...
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },

	
};
