/* Скрипт для компиляции C++ проектов.
 */

var config = require('./config');
var ice = require('ice');
require('./rules');

exports.addMacro = function(macro) {
	config.compileOptions = config.platformModule.addMacro(config.compileOptions, macro);
};

exports.addIncludeDir = function(dir) {
	config.compileOptions = config.platformModule.addIncludeDir(config.compileOptions, dir);
};

exports.addDynamicLibrary = function(library) {
	config.linkOptions = config.platformModule.addDynamicLibrary(config.linkOptions, library);
};

exports.addStaticLibrary = function(library) {
	config.linkStaticLibraries = config.platformModule.addStaticLibrary(config.linkStaticLibraries, library);
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
