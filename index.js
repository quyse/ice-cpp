/* Скрипт для компиляции C++ проектов.
 */

var config = require('./config');
var ice = require('ice');
require('./rules');
var fs = require('fs');

exports.addEnvFile = function(envFile) {
	var data = fs.readFileSync(envFile, 'utf8');
	var re = /^(\w+)\=(.*)$/gm;
	var a, env = {};
	while(a = re.exec(data))
		env[a[1]] = a[2];
	addEnv(env);
};

var addEnv = exports.addEnv = function(env) {
	for(var i in env)
		config.env[i] = env[i];
};

exports.addMacro = function(macro) {
	config.compileOptions = config.platformModule.addMacro(config.compileOptions, macro);
};

exports.addIncludeDir = function(dir) {
	config.compileOptions = config.platformModule.addIncludeDir(config.compileOptions, dir);
};

exports.make = function(file) {
	ice.make(file);
};

exports.makeLibrary = function(library) {
	ice.make(library + config.libraryExt);
};

exports.makeExecutable = function(executable) {
	ice.make(executable + config.executableExt);
};
