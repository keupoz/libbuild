const fs = require('fs'),
      rmdirSync = require('rimraf').sync;

module.exports = function (dir) {
	return {
		name: 'prepair-dir',
		
		buildStart () {
			if (fs.existsSync(dir)) rmdirSync(dir);
			fs.mkdirSync(dir);
		}
	};
}
