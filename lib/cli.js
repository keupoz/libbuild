#!/usr/bin/env node

const program = require('commander'),
      colors = require('colors'),
      fs = require('fs'),
      path = require('path'),
      
      Logger = require('./Logger.js'),
      
      { version: rollupVersion } = require('rollup/package.json'),
      { version } = require('../package.json'),
      DEFAULTS = require('./defaults.js');

let args = [];

function list (val) {
	return val ? val.split(',') : [];
}

program
	.version(`v${version}, rollup ${rollupVersion}`, '-v, --version')
	.arguments('<outputName> [outputDirectory] [input]')
	.description('Builds your project using Rollup')
	
	.option('-c, --config [path]', 'use config instead of arguments.')
	.option('', 'If path is omitted, defaults to ' + '"libbuild.config.js"'.yellow.bold)
	.option('-d, --devMode', 'sets environment to "development" and enables watcher')
	.option('-e, --externals <modules>', 'sets option "external" of Rollup input config.', list)
	.option('', 'Defaults to dependencies from package.json')
	.option('-E, --no-externals', 'unset externals', list)
	
	.action((..._args) => args = _args);

program.on('--help', function () {
	console.log('');
	console.log('Arguments:');
	console.log('  <outputName>       project name. Used in output file names');
	console.log('  [outputDirectory]  where to write the output bundles. Defaults to ' + `"${DEFAULTS.outputDirectory}"`.yellow.bold);
	console.log('  [input]            entry point. Defaults to ' + `"${DEFAULTS.input}"`.yellow.bold);
	console.log('');
});

function action (LibBuild, outputName, outputDirectory, input) {
	if (outputName === undefined) {
		console.error('<outputName>'.white.bold + ' is required!'.red.bold);
		process.exit(1);
	}
	
	if (this.config === true) this.config = 'libbuild.config.js';
	
	if (this.config && !fs.existsSync(this.config)) {
		console.error('Config '.red.bold + this.config.yellow.bold + ' doesn\'t exist!'.red.bold);
		process.exit(1);
	}
	
	let options = this.config ? require(path.resolve(this.config)) : {};
	
	if (outputDirectory) options.outputDirectory = outputDirectory;
	if (input) options.input = input;
	
	if (this.devMode) options.production = false;
	if (Array.isArray(this.externals)) options.externals = this.externals;
	
	Logger.enabled = true;
	let libbuild = new LibBuild(outputName, options);
	
	if (this.devMode) libbuild.watch();
	else libbuild.build();
}

program.parse(process.argv);

if (require.main === module) action.call(program, require('./index.js'), ...args);
else module.exports = function (LibBuild) {
	action.call(program, LibBuild, ...args);
};
