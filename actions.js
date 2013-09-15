var config = require('./config');
var child_process = require('child_process');
var invoking = require('./invoking');

// вспомогательная функция для перевода массива имён из относительных в полные
var toFull = function(arr, configurator, ext) {
	for ( var i = 0; i < arr.length; ++i)
		arr[i] = configurator.relativeToFull(arr[i]) + ext;
};

/**
 * Объект-компилятор. Служит для настройки компиляции объектных файлов. Для
 * настройки необходимо вызвать по крайней мере setSourceFile.
 */
var Compiler = exports.Compiler = function() {
	this.configuration = 'debug';
	this.sourceFile = null;
	this.macros = [];
	this.includeDirs = [];
	this.cppMode = true;
	this.strict = true;
};
Compiler.prototype.platform = config.platform;
Compiler.prototype.setSourceFile = function(sourceFile) {
	this.sourceFile = sourceFile;
};
Compiler.prototype.addMacro = function(macro) {
	this.macros.push(macro);
};
Compiler.prototype.addIncludeDir = function(dir) {
	this.includeDirs.push(dir);
};
Compiler.prototype.toFull = function(configurator) {
	this.sourceFile = configurator.relativeToFull(this.sourceFile);
	toFull(this.includeDirs, configurator, '');
};

/**
 * Объект-линкер. Служит для настройки компоновки исполняемых файлов. Необходимо
 * вызвать по крайней мере addObjectFile (один или несколько раз).
 */
var Linker = exports.Linker = function() {
	this.configuration = 'debug';
	this.objectFiles = [];
	this.dynamicLibraries = [];
	this.staticLibraries = [];
};
Linker.prototype.platform = config.platform;
Linker.prototype.addObjectFile = function(objectFile) {
	this.objectFiles.push(objectFile);
};
Linker.prototype.addDynamicLibrary = function(library) {
	this.dynamicLibraries.push(library);
};
Linker.prototype.addStaticLibrary = function(library) {
	this.staticLibraries.push(library);
};
Linker.prototype.toFull = function(configurator) {
	toFull(this.objectFiles, configurator, config.objectExt);
	toFull(this.staticLibraries, configurator, config.libraryExt);
};

/**
 * Объект-компоновщик библиотек. Служит для настройки компоновки библиотек.
 * Необходимо вызвать по крайней мере addObjectFile (один или несколько раз).
 */
var Composer = exports.Composer = function() {
	this.configuration = 'debug';
	this.objectFiles = [];
	this.skip = false;
};
Composer.prototype.platform = config.platform;
Composer.prototype.addObjectFile = function(objectFile) {
	this.objectFiles.push(objectFile);
};
Composer.prototype.toFull = function(configurator) {
	toFull(this.objectFiles, configurator, config.objectExt);
};

/**
 * запустить процесс
 */
var launchProcess = exports.launchProcess = function(command, args, callback) {
	invoking.invoke(function(end) {
		var childProcess = child_process.spawn(command, args, {
			env: config.env
		});

		var err = '';
		childProcess.stdout.on('data', function(data) {
			err += data;
		});
		childProcess.stderr.on('data', function(data) {
			err += data;
		});

		childProcess.on('exit', function(code) {
			callback(code == 0 ? null : err);
			end();
		});
	});
};
