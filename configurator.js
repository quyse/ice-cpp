/**
 * класс конфигуратора
 */
var Configurator = module.exports = function(baseDir, configurator) {
	this.baseDir = baseDir;
	this.configurator = configurator;
};
Configurator.prototype.relativeToFull = function(relative) {
	return this.baseDir + relative;
};
Configurator.prototype.fullToRelative = function(full) {
	if (full.substr(0, this.baseDir.length) != this.baseDir)
		throw new Error('Full path is not compatible with configurator base path');
	return full.substr(this.baseDir.length);
};

/**
 * кэшированные конфигураторы
 */
var dirConfigurators = {};
/**
 * найти конфигуратор, управляющий данным каталогом
 */
Configurator.getForDir = function(dirName) {
	// посмотреть, нет ли конфигуратора в кэше
	if (dirName in dirConfigurators)
		return dirConfigurators[dirName];
	// попробовать загрузить конфигуратор из этого каталога
	var configurator = null;
	try {
		var configuratorName = process.cwd() + '/' + dirName + 'configure.js';
		// console.log('trying configurator: ' + configuratorName);
		configurator = new Configurator(dirName, require(configuratorName));
	} catch (e) {
		// конфигуратор не найден, попробовать найти его в родительском каталоге
		if (dirName != '' && dirName != '/')
			configurator = Configurator.getForDir(/^(.*\/)?[^\/]+\//.exec(dirName)[1] || '');
	}
	// если ошибки не произошло, конфигуратор найден
	if (configurator)
		dirConfigurators[dirName] = configurator;
	else
		throw new Error('Configurator for ' + dirName + ' is not found');
	return configurator;
};

/**
 * разбить имя файла на имя каталога и имя файла примеры: a/b/c/d -> 'a/b/c/'
 * 'd' /a/b/c/d -> '/a/b/c/' 'd' a -> '' 'a'
 */
var splitFileName = function(fileName) {
	var a = /^(.*\/)?([^\/]+)$/.exec(fileName);
	return {
		dir: a[1] || '',
		title: a[2]
	};
};

Configurator.getForFile = function(fileName) {
	return Configurator.getForDir(splitFileName(fileName).dir);
};
