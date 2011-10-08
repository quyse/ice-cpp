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

exports.makeLibrary = function(library) {
	ice.make(library + config.libraryExt);
};
