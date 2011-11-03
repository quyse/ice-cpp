/* Скрипт, конфигурирующий компиляцию.
 */

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
var getOptions = exports.getOptions = function(options, configuration) {
	return options.all.concat(options[configuration]);
};

exports.objectExt = platformModule.objectExt;

exports.executableExt = platformModule.executableExt;

exports.libraryExt = platformModule.libraryExt;

exports.maxRunningProcesses = 2;
