const { rollup } = require('rollup'),
      chokidar = require('chokidar'),
      fs = require('fs'),
      
      Logger = require('./Logger.js'),
      
      prepair = require('./plugins/prepair.js'),
      DEFAULTS = require('./defaults.js'),
      PLUGINS = require('./plugins.js');

class LibBuild {
	constructor (name, options = {}) {
		this.name = name;
		
		if (Array.isArray(options.plugins)) {
			this.plugins = [...PLUGINS, ...options.plugins];
			delete options.plugins;
		} else {
			this.plugins = PLUGINS;
		}
		
		this.options = Object.assign({}, DEFAULTS, options);
		
		this.setProduction(this.options.production);
		this.plugins.push(prepair(this.options.outputDirectory));
	}
	
	setProduction (value) {
		let oldNodeEnv = process.env.NODE_ENV;
		
		this.options.production = value;
		process.env.NODE_ENV = this.options.production ? 'production' : 'development';
		
		if (oldNodeEnv !== process.env.NODE_ENV)
			Logger.log('Environment changed to "' + process.env.NODE_ENV + '"');
	}
	
	getOutputConfig () {
		return this.options.outputOptions || [
			{
				name: this.name,
				format: 'umd',
				file: this.name + '.umd.js'
			}, {
				name: this.name,
				format: 'umd',
				compact: true,
				file: this.name + '.umd.min.js'
			}, {
				format: 'esm',
				file: this.name + '.esm.js'
			}
		];
	}
	
	async bundle () {
		let bundle = await rollup({
			cache: this.cache,
			input: this.options.input,
			external: this.options.externals,
			plugins: this.plugins
		});
		
		this.cache = bundle.cache;
		
		let config = this.getOutputConfig(),
		    builds = new Array();
		
		if (Array.isArray(config)) {
			for (let c of config) {
				if (this.options.production || !c.compact) {
					builds.push(await bundle.generate(c));
				}
			}
		} else builds.push(await bundle.generate(config));
		
		return { bundle, builds };
	}
	
	build () {
		return Logger.task('Building...', 'Built in %s!', (async () => {
			let { bundle, builds } = await this.bundle();
			
			builds.forEach(build => {
				build.output.forEach(o => {
					fs.writeFileSync(this.options.outputDirectory + '/' + o.fileName, o.code);
				});
			});
			
			return bundle.watchFiles;
		})()).catch(err => Logger.error(err));
	}
	
	async watch () {
		let oldWatchFiles = await this.build();
		
		if (oldWatchFiles === undefined) return;
		
		let watcher = chokidar.watch(oldWatchFiles, {
			disableGlobbing: true,
			ignoreInitial: true
		});
		
		Logger.log('Waiting for changes...');
		watcher.on('change', async () => {
			let newWatchFiles = await this.build();
			
			if (newWatchFiles === undefined) return;
			
			let watch = newWatchFiles.filter(file => oldWatchFiles.indexOf(file) == -1),
			    unwatch = oldWatchFiles.filter(file => newWatchFiles.indexOf(file) == -1);
			
			watcher.add(watch);
			watcher.unwatch(unwatch);
			
			oldWatchFiles = newWatchFiles;
		});
	}
}

module.exports = LibBuild;
