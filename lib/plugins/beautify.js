const beautify = require('js-beautify').js;

module.exports = function () {
	return {
		name: 'beautify',
		
		renderChunk (code, chunk, outputOptions) {
			if (outputOptions.compact) return code;
			
			return beautify(code, {
				end_with_newline: true
			});
		}
	};
};
