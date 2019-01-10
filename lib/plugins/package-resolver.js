const { resolve } = require('path');

module.exports = function () {
	return {
		resolveId (id) {
			if (id !== '$PACKAGE') return null;
			
			return resolve('package.json');
		}
	};
};
