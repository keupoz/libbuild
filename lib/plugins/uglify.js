const { minify } = require('uglify-js');

module.exports = function (options) {
	return {
		name: 'uglify',
		
		renderChunk (code, chunk, outputOptions) {
			if (!outputOptions.compact) return code;
			if (outputOptions.format === 'es') return code;
			
			let output = minify(code, options);
			
			if (output.error) throw output.error;
			
			return output.code;
		}
	};
};
