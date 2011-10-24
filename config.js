/* Скрипт, конфигурирующий компиляцию.
 */

var configuration = exports.configuration = process.env.CONF || 'debug';

/**
 * добавить завершающий /, если нет
 */
var ensureDir = exports.ensureDir = function(dir) {
	if (dir.length > 0 && dir[dir.length - 1] != '/')
		return dir + '/';
	return dir;
};

// дополнительные переменные окружения
var env = exports.env = process.env;

// платформа, под которую компилируем
var platform = exports.platform = process.env.PLATFORM || process.platform;
// модуль платформы
var platformModule = exports.platformModule = require('./platform-' + platform);

/**
 * получение опций в зависимости от конфигурации
 */
var getOptions = function(options) {
	return options.all.concat(options[configuration]);
};

var compileOptions = getOptions(platformModule.compileOptions);
exports.compileOptions = compileOptions;
exports.objectExt = platformModule.objectExt;

var linkOptions = getOptions(platformModule.linkOptions);
exports.linkOptions = linkOptions;
exports.executableExt = platformModule.executableExt;

var composeOptions = getOptions(platformModule.composeOptions);
exports.composeOptions = composeOptions;
exports.libraryExt = platformModule.libraryExt;

exports.maxRunningProcesses = 2;
