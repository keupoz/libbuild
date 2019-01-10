const buble = require('buble');

module.exports = function (options) {
	return {
		name: 'buble',
		
		renderChunk (code, chunk, outputOptions) {
			if (process.env.NODE_ENV === 'development') return code;
			
			let output = buble.transform(code, options);
			return output;
		}
	};
};
