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
Compiler.prototype.arch = config.arch;
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
	this.dynamicLibraryPaths = [];
	this.staticLibraries = [];
	this.resFiles = [];
};
Linker.prototype.platform = config.platform;
Linker.prototype.arch = config.arch;
Linker.prototype.addObjectFile = function(objectFile) {
	this.objectFiles.push(objectFile);
};
Linker.prototype.addDynamicLibrary = function(library) {
	this.dynamicLibraries.push(library);
};
Linker.prototype.addDynamicLibraryPath = function(libraryPath) {
	this.dynamicLibraryPaths.push(libraryPath);
};
Linker.prototype.addStaticLibrary = function(library) {
	this.staticLibraries.push(library);
};
Linker.prototype.addResFile = function(resFile) {
	this.resFiles.push(resFile);
};
Linker.prototype.toFull = function(configurator) {
	toFull(this.objectFiles, configurator, config.objectExt);
	toFull(this.dynamicLibraryPaths, configurator, '');
	toFull(this.staticLibraries, configurator, config.libraryExt);
	toFull(this.resFiles, configurator, config.resExt);
	if(this.defFile)
		this.defFile = configurator.relativeToFull(this.defFile);
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
Composer.prototype.arch = config.arch;
Composer.prototype.addObjectFile = function(objectFile) {
	this.objectFiles.push(objectFile);
};
Composer.prototype.toFull = function(configurator) {
	toFull(this.objectFiles, configurator, config.objectExt);
};

/**
 * Объект-компилятор ресурсов.
 */
var Resourcer = exports.Resourcer = function() {
	this.configuration = 'debug';
	this.resourceFile = null;
};
Resourcer.prototype.setResourceFile = function(resourceFile) {
	this.resourceFile = resourceFile;
};
Resourcer.prototype.toFull = function(configurator) {
	this.resourceFile = configurator.relativeToFull(this.resourceFile) + config.rcExt;
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
