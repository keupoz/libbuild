const { resolve } = require('path'),
      DEPENDENCIES = Object.keys(require(resolve('package.json')).dependencies);

module.exports = {
	outputOptions: null,
	
	input: 'src/main.js',
	outputDirectory: 'build',
	production: true,
	externals: DEPENDENCIES
};
