const json = require('rollup-plugin-json'),
      resolve = require('rollup-plugin-node-resolve'),
      cjs = require('rollup-plugin-commonjs'),
      
      package = require('./plugins/package-resolver.js'),
      buble = require('./plugins/buble.js'),
      uglify = require('./plugins/uglify.js'),
      beautify = require('./plugins/beautify.js');

module.exports = [
	// Resolvers
	package(), resolve(),
	// Transformers
	json(), cjs(),
	// Bundle transformers
	buble({
		transforms: {
			modules: false
		}
	}),
	beautify(), uglify()
];
